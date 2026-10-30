/**
 * Framework themes (packages/bootstrap-theme, packages/shadcn-theme, …): what every theme reads from the
 * design system and the primitives that check a theme mapping against it. Zero dependencies:
 * plain Node and lib/dtcg.mjs. A theme package keeps its mapping as plain data (src/mapping.mjs:
 * framework theming variable -> Quantum token path, and framework component -> Quantum component
 * configuration, in the shape its framework calls for) and composes these functions in its own
 * src/lib.mjs, which its build and test call: a token or spec change the mapping no longer
 * matches fails the build (`pnpm build`, `prepack`) and `pnpm test`.
 *
 *   loadQuantum()                             the tokens resolved per mode + the component and foundation specs
 *   checkTokenPath / checkTokenEntry          a token path exists and is semantic or component
 *   specOptions / specStates / specParts      the ids a spec declares; checkSet / checkConfig check one configuration
 *   checkComponents / checkMapping            the `{ quantum, configs }` equivalence shape; assertMapping throws
 *   semanticOrigin, tokenTrace, pxNumber, pxToRem
 *
 * The skill .claude/skills/framework-theme/SKILL.md documents the mapping shapes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll, resolveContext, resolveValue, formatScalar, isAlias, aliasPath, defaultMode } from './dtcg.mjs';
import { PATHS } from './paths.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Tiers a mapping may name: semantic decisions and component decisions, never raw primitives. */
export const ALLOWED_TIERS = ['semantic', 'component'];

/**
 * One token of one mode: its path, DTCG type, tier, the token it aliases (or null), `raw` the
 * resolved DTCG value (a `{ value, unit }` length, a typography composite's members…) and
 * `value` the CSS text of a scalar (null for a typography composite: a theme reads its members).
 */
function describe(token, byPath) {
  const raw = resolveValue(token.value, byPath, [token.path]);
  return {
    path: token.path,
    type: token.type,
    tier: token.tier,
    alias: isAlias(token.value) ? aliasPath(token.value) : null,
    raw,
    value: token.type === 'typography' ? null : formatScalar(token.type, raw),
  };
}

const specsIn = (dir) => Object.fromEntries(
  fs.readdirSync(dir)
    .filter((f) => f.endsWith('.spec.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    .map((s) => [s.id, s]),
);

/**
 * The Quantum design system as a theme reads it: one Map per mode id (`quantum.light`,
 * `quantum.dark`: token path -> the description above, resolved in that mode; a token a mode
 * does not change has the default mode's value), `modes` (the mode ids, default first),
 * `modeDetails` (`{ id, default, scheme }` each), `specs` (component id -> spec),
 * `foundations` (foundation id -> spec) and `root`. Reads the token sources and the specs,
 * not dist/, so no token build is needed first.
 */
export function loadQuantum(root = ROOT) {
  const loaded = loadAll(path.join(root, PATHS.tokens));
  const def = defaultMode(loaded);
  const modeDetails = [def, ...(loaded.modes ?? []).filter((m) => m !== def)].filter(Boolean).map((m) => ({ id: m.id, default: Boolean(m.default), scheme: m.scheme ?? null }));
  const modes = modeDetails.length ? modeDetails.map((m) => m.id) : ['light'];
  const index = (mode) => {
    const ctx = resolveContext(loaded, { mode });
    const out = new Map();
    for (const [p, t] of ctx.byPath) out.set(p, describe(t, ctx.byPath));
    return out;
  };
  const quantum = {
    root,
    modes,
    modeDetails,
    specs: specsIn(path.join(root, PATHS.specs, 'components')),
    foundations: specsIn(path.join(root, PATHS.specs, 'foundations')),
  };
  for (const mode of modes) quantum[mode] = index(mode === modes[0] ? null : mode);
  return quantum;
}

/** The token `path` in the default mode, or undefined. */
export const tokenOf = (quantum, p) => quantum[quantum.modes[0]].get(p);

/** The problems of one token path named at `where`: unknown, or a raw primitive. */
export function checkTokenPath(quantum, p, where) {
  const t = tokenOf(quantum, p);
  if (!t) return [`${where}: unknown Quantum token "${p}"`];
  if (!ALLOWED_TIERS.includes(t.tier)) return [`${where}: "${p}" is a ${t.tier} token; map a semantic or component token`];
  return [];
}

/** The problems of one token entry ({ token, modes? }) named `where`. */
export function checkTokenEntry(quantum, entry, where) {
  if (!entry || typeof entry.token !== 'string') return [`${where}: no token path`];
  const problems = checkTokenPath(quantum, entry.token, where);
  for (const m of entry.modes ?? []) if (!quantum.modes.includes(m)) problems.push(`${where}: unknown mode "${m}"`);
  return problems;
}

/** The option ids of an enum property of a spec (options may be strings or `{ value }`), or null without the property. */
export function specOptions(spec, propertyId) {
  const def = (spec.properties ?? []).find((p) => p.id === propertyId);
  if (!def) return null;
  return (def.options ?? []).map((o) => (typeof o === 'object' ? o.value ?? o.id : o));
}

/** The state ids a spec declares. */
export const specStates = (spec) => (spec.states ?? []).map((s) => (typeof s === 'string' ? s : s.id));

/** The anatomy part ids a spec declares. */
export const specParts = (spec) => (Array.isArray(spec.anatomy) ? spec.anatomy : spec.anatomy?.parts ?? []).map((p) => p.id);

/** The problems of one `set` (property id -> option id, or boolean property -> boolean) against a spec. */
export function checkSet(spec, set, where) {
  const problems = [];
  for (const [prop, value] of Object.entries(set)) {
    const def = (spec.properties ?? []).find((p) => p.id === prop);
    if (!def) { problems.push(`${where}: ${spec.id} has no property "${prop}"`); continue; }
    if (def.type === 'enum') {
      const options = specOptions(spec, prop);
      if (!options.includes(value)) problems.push(`${where}: ${spec.id}.${prop} has no option "${value}" (options: ${options.join(', ')})`);
    } else if (def.type === 'boolean') {
      if (typeof value !== 'boolean') problems.push(`${where}: ${spec.id}.${prop} is a boolean, got ${JSON.stringify(value)}`);
    } else {
      problems.push(`${where}: ${spec.id}.${prop} is a ${def.type} property; only enum and boolean properties name a configuration`);
    }
  }
  return problems;
}

/** The problems of one configuration (`set`, `state` and/or `part`) against a spec. */
export function checkConfig(spec, cfg, where) {
  const problems = [];
  if (cfg.set) problems.push(...checkSet(spec, cfg.set, where));
  if (cfg.state !== undefined && !specStates(spec).includes(cfg.state)) problems.push(`${where}: ${spec.id} has no state "${cfg.state}" (states: ${specStates(spec).join(', ')})`);
  if (cfg.part !== undefined && !specParts(spec).includes(cfg.part)) problems.push(`${where}: ${spec.id} has no part "${cfg.part}" (parts: ${specParts(spec).join(', ')})`);
  if (!cfg.set && cfg.state === undefined && cfg.part === undefined) problems.push(`${where}: names no property, state or part`);
  return problems;
}

/**
 * The problems of component equivalences in the `{ quantum: '<component id>', configs: [{ set |
 * state | part, … }] }` shape: each `quantum` is a component with a spec, each config holds.
 */
export function checkComponents(quantum, components, group = 'COMPONENTS') {
  const problems = [];
  for (const [i, c] of (components ?? []).entries()) {
    const where = `${group}[${i}] (${c.quantum})`;
    const spec = quantum.specs[c.quantum];
    if (!spec) { problems.push(`${where}: no Quantum component "${c.quantum}" in ${PATHS.specs}/components/`); continue; }
    for (const [j, cfg] of (c.configs ?? []).entries()) problems.push(...checkConfig(spec, cfg, `${where}.configs[${j}]`));
  }
  return problems;
}

/**
 * Every problem of a mapping in the simple shape against the design system. `tokens` is the
 * token entries to check, as `[where, entry]` pairs or as groups `{ GROUP: { name: entry } }`;
 * `components` the equivalences. Returns messages; empty means the mapping holds.
 */
export function checkMapping(quantum, { tokens = [], components = [] } = {}) {
  const pairs = Array.isArray(tokens)
    ? tokens
    : Object.entries(tokens).flatMap(([group, entries]) => Object.entries(entries ?? {}).map(([name, e]) => [`${group}.${name}`, e]));
  return [
    ...pairs.flatMap(([where, entry]) => checkTokenEntry(quantum, entry, where)),
    ...checkComponents(quantum, components),
  ];
}

/** Throw with every problem, one per line (`problems` an array, or a mapping in the simple shape to check). */
export function assertMapping(quantum, mappingOrProblems, file = 'src/mapping.mjs') {
  const problems = Array.isArray(mappingOrProblems) ? mappingOrProblems : checkMapping(quantum, mappingOrProblems);
  if (problems.length) throw new Error(`${file} does not match the Quantum tokens and specs:\n  ${problems.join('\n  ')}`);
}

/** The first semantic (or raw) token the alias chain of `p` reaches: the origin of a component token. */
export function semanticOrigin(quantum, p) {
  let cur = tokenOf(quantum, p);
  const seen = new Set();
  while (cur && cur.tier === 'component' && cur.alias && !seen.has(cur.path)) {
    seen.add(cur.path);
    cur = tokenOf(quantum, cur.alias);
  }
  return cur?.path ?? p;
}

/**
 * The token shown next to a value: its path, and for a component token the semantic token it
 * aliases (`card.container.background.level-1 (= global.bg.level.1.default)`). A semantic
 * token's alias is a raw primitive, which a theme never names.
 */
export const tokenTrace = (t) => (t.tier === 'component' && t.alias ? `${t.path} (= ${t.alias})` : t.path);

/** px dimension (`"12px"`, `{ value: 12, unit: 'px' }` or a number) -> number; null when not a px length. */
export const pxNumber = (value) => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') return value.unit === 'px' && typeof value.value === 'number' ? value.value : null;
  const m = /^(-?\d*\.?\d+)px$/.exec(String(value).trim());
  return m ? Number(m[1]) : null;
};

/** px -> rem on a 16px root, trimmed (`12px` -> `0.75rem`, `4` -> `0.25rem`); any other value is returned as is. */
export function pxToRem(value, base = 16) {
  const px = pxNumber(value);
  if (px === null) return String(value);
  return `${+(px / base).toFixed(5)}rem`;
}
