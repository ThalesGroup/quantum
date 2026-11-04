/**
 * The Quantum side of the theme. The token and spec loading, the token-path and tier checks, the
 * spec option, state and part lookups, the alias chain and px -> rem come from the repository's
 * shared library for framework themes (scripts/lib/theme-mapping.mjs); this module keeps what is
 * Bootstrap's own: the entry forms of src/mapping.mjs (token, typography member, template,
 * foundation-rule literal), light-dark() values, and the checks of its groups and equivalences.
 * build.mjs and test/theme.test.mjs call only these functions.
 *
 *   loadQuantum()                -> { tokens, light, dark, specs, foundations, modes, shared }
 *   checkMapping(mapping, q)     -> [problem, …]   unknown token paths, members, tiers, spec ids, rules
 *   entryValues(entry, q, units) -> { light, dark, paths }   CSS text per mode and the token paths read
 *   entryCss(entry, q, units)    -> { css, … }      one value for both schemes (light-dark() for colors)
 *   pxToRem(px, base)            -> '0.25rem'
 */
import { formatScalar } from '../../../scripts/lib/dtcg.mjs';
import {
  loadQuantum as loadShared,
  checkTokenPath,
  specOptions,
  specStates,
  specParts,
  semanticOrigin as sharedSemanticOrigin,
  pxToRem,
} from '../../../scripts/lib/theme-mapping.mjs';

export { ROOT } from '../../../scripts/lib/theme-mapping.mjs';
export { pxToRem };

/**
 * The design system as this package reads it, built from the shared loader: `tokens` (path ->
 * { path, tier, type, alias }), `light` and `dark` (path -> resolved DTCG value), `specs` and
 * `foundations` (id -> spec, as Maps), `modes` (`{ id, default, scheme }` each), and `shared`, the
 * shared library's own object, for its helpers.
 */
export function loadQuantum(root) {
  const shared = root ? loadShared(root) : loadShared();
  const [defaultId] = shared.modes;
  const darkId = shared.modeDetails.find((m) => m.scheme === 'dark' && !m.default)?.id ?? defaultId;
  const tokens = new Map();
  const raw = (id) => new Map([...shared[id]].map(([p, t]) => [p, t.raw]));
  for (const [p, { path, tier, type, alias }] of shared[defaultId]) tokens.set(p, { path, tier, type, alias });
  return {
    tokens,
    light: raw(defaultId),
    dark: raw(darkId),
    specs: new Map(Object.entries(shared.specs)),
    foundations: new Map(Object.entries(shared.foundations)),
    modes: shared.modeDetails,
    shared,
  };
}

/** The first semantic (or raw) token an alias chain reaches from `p`. */
export const semanticOrigin = (p, q) => sharedSemanticOrigin(q.shared, p);

const globMatch = (pattern, p) => (pattern.endsWith('.*') ? p.startsWith(pattern.slice(0, -1)) : p === pattern);

/** Normalise an entry to { token?, member?, template?, literal?, rule?, why?, sass? }. */
export function normaliseEntry(entry) {
  if (typeof entry === 'string') return { token: entry };
  if (Array.isArray(entry)) return { token: entry[0], why: entry[1] };
  return entry;
}

/** The token paths an entry reads (a template's `{path}` placeholders included). */
export function entryPaths(entry) {
  const e = normaliseEntry(entry);
  if (e.token) return [e.token];
  if (e.template) return [...e.template.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  return [];
}

/** One resolved scalar as CSS. Lengths in px become rem unless `px` is set. */
function scalarCss(type, value, { px = false, base = 16 } = {}) {
  if ((type === 'dimension' || type === 'fontSize') && value && typeof value === 'object' && value.unit === 'px' && !px) {
    return pxToRem(value, base);
  }
  return formatScalar(type, value);
}

const MEMBER_TYPES = { fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', lineHeight: 'number', letterSpacing: 'dimension' };

/** The CSS of one token (or one member of a composite) in one mode. */
function tokenCss(p, member, q, mode, units) {
  const t = q.tokens.get(p);
  const raw = (mode === 'dark' ? q.dark : q.light).get(p);
  const px = (units.keepPx ?? []).some((g) => globMatch(g, semanticOrigin(p, q)));
  if (member) return scalarCss(MEMBER_TYPES[member], raw[member], { px, base: units.remBase });
  return scalarCss(t.type, raw, { px, base: units.remBase });
}

/**
 * The CSS value of a mapping entry in light and in dark, with the token paths it reads.
 * A color that differs between modes is written `light-dark(<light>, <dark>)` by entryCss.
 */
export function entryValues(entry, q, units = {}) {
  const e = normaliseEntry(entry);
  if (e.literal !== undefined) return { light: e.literal, dark: e.literal, paths: [], literal: true, rule: e.rule };
  const render = (mode) => {
    if (e.token) return tokenCss(e.token, e.member, q, mode, units);
    return e.template.replace(/\{([^}]+)\}/g, (_, p) => tokenCss(p, null, q, mode, units));
  };
  return { light: render('light'), dark: render('dark'), paths: entryPaths(e), member: e.member ?? null };
}

/**
 * The CSS of an entry for both color schemes at once: a plain value when light and dark agree,
 * light-dark() otherwise. Only colors may differ per mode (light-dark() takes colors): a token
 * placeholder inside a template is wrapped on its own, so `1px solid light-dark(a, b)` stays valid.
 */
export function entryCss(entry, q, units = {}) {
  const e = normaliseEntry(entry);
  const v = entryValues(e, q, units);
  if (v.light === v.dark) return { ...v, css: v.light };
  const both = (p, member) => {
    const l = tokenCss(p, member, q, 'light', units);
    const d = tokenCss(p, member, q, 'dark', units);
    if (l === d) return l;
    if (q.tokens.get(p).type !== 'color') throw new Error(`${p} differs between light and dark but is not a color: light-dark() takes colors only`);
    return `light-dark(${l}, ${d})`;
  };
  const css = e.token ? both(e.token, e.member) : e.template.replace(/\{([^}]+)\}/g, (_, p) => both(p, null));
  return { ...v, css };
}

/**
 * Check a mapping against the tokens and the specs. Returns a list of problems (strings);
 * empty when every token path, member, tier, spec component, property, option, state, part and
 * foundation rule it names exists, and every option of a mapped property is mapped.
 */
export function checkMapping(mapping, q) {
  const problems = [];
  const where = (g, prop) => `${g.id}${prop ? ` ${prop}` : ''}`;
  const ids = new Set();
  for (const g of mapping.groups ?? []) {
    if (ids.has(g.id)) problems.push(`group id "${g.id}" is used twice`);
    ids.add(g.id);
    if (!['semantic', 'component'].includes(g.tier)) problems.push(`${where(g)}: tier must be "semantic" or "component"`);
    if (g.component && !q.specs.has(g.component)) problems.push(`${where(g)}: no component spec "${g.component}"`);
    for (const [prop, raw] of Object.entries(g.tokens ?? {})) {
      const e = normaliseEntry(raw);
      if (!prop.startsWith(mapping.bootstrap.prefix)) problems.push(`${where(g, prop)}: Bootstrap custom properties start with ${mapping.bootstrap.prefix}`);
      const forms = ['token', 'template', 'literal'].filter((k) => e[k] !== undefined);
      if (forms.length !== 1) { problems.push(`${where(g, prop)}: an entry has exactly one of token, template, literal`); continue; }
      if (e.literal !== undefined) {
        const [fid, rid] = String(e.rule ?? '').split('.');
        const f = q.foundations.get(fid);
        if (!f) problems.push(`${where(g, prop)}: literal "${e.literal}" must name a foundation rule (<foundation>.<rule>), no foundation "${fid}"`);
        else if (!(f.rules ?? []).some((r) => r.id === rid)) problems.push(`${where(g, prop)}: foundation ${fid} has no rule "${rid}"`);
        continue;
      }
      for (const p of entryPaths(e)) {
        const found = checkTokenPath(q.shared, p, where(g, prop));
        if (found.length) { problems.push(...found); continue; }
        const t = q.tokens.get(p);
        if (t.tier !== g.tier && !e.why) problems.push(`${where(g, prop)}: "${p}" is a ${t.tier} token in a ${g.tier} group; say why`);
        if (t.tier === 'component' && g.component && p.split('.')[0] !== g.component && !e.why) problems.push(`${where(g, prop)}: "${p}" belongs to another component than ${g.component}; say why`);
      }
      if (e.member) {
        const t = q.tokens.get(e.token);
        if (t && t.type !== 'typography') problems.push(`${where(g, prop)}: member "${e.member}" needs a typography token, "${e.token}" is ${t.type}`);
        else if (t && !(e.member in (q.light.get(e.token) ?? {}))) problems.push(`${where(g, prop)}: "${e.token}" has no member "${e.member}"`);
      }
    }
  }
  for (const eq of mapping.equivalences ?? []) {
    const spec = q.specs.get(eq.component);
    const at = `equivalence ${eq.component}`;
    if (!spec) { problems.push(`${at}: no component spec "${eq.component}"`); continue; }
    for (const [pid, options] of Object.entries(eq.options ?? {})) {
      const values = specOptions(spec, pid);
      if (!values) { problems.push(`${at}: spec has no property "${pid}"`); continue; }
      for (const o of Object.keys(options)) if (!values.includes(o)) problems.push(`${at}: property ${pid} has no option "${o}"`);
      for (const v of values) if (!(v in options)) problems.push(`${at}: option ${pid}=${v} is not mapped (use null for no equivalent)`);
    }
    for (const c of eq.combinations ?? []) {
      for (const [pid, o] of Object.entries(c.when ?? {})) {
        const values = specOptions(spec, pid);
        if (!values) problems.push(`${at}: combination names unknown property "${pid}"`);
        else if (!values.includes(o)) problems.push(`${at}: combination names unknown option ${pid}=${o}`);
      }
    }
    const states = specStates(spec);
    for (const s of Object.keys(eq.states ?? {})) if (!states.includes(s)) problems.push(`${at}: spec has no state "${s}"`);
    const parts = specParts(spec);
    for (const p of Object.keys(eq.parts ?? {})) if (!parts.includes(p)) problems.push(`${at}: spec has no anatomy part "${p}"`);
  }
  const mapped = new Set((mapping.equivalences ?? []).map((e) => e.component));
  for (const id of q.specs.keys()) if (!mapped.has(id)) problems.push(`component ${id} has no equivalence entry (add one, with bootstrap: null when Bootstrap has none)`);
  return problems;
}
