/**
 * Minimal DTCG (Design Tokens Community Group) toolkit.
 * Zero dependencies. Used by build-tokens.mjs, validate.mjs and the Astro site.
 *
 * Supports both value shapes seen in the wild:
 *  - legacy strings:   "#2563eb", "16px", "150ms"
 *  - 2024+ objects:    { colorSpace, components, alpha, hex }, { value, unit }
 * and composites: typography, shadow, border. Aliases use "{path.to.token}".
 */
import fs from 'node:fs';
import path from 'node:path';

const ALIAS_RE = /^\{([^}]+)\}$/;
const COMPOSITE_KEYS = {
  typography: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'],
};
const COMPOSITE_SUBTYPES = {
  fontFamily: 'fontFamily',
  fontSize: 'dimension',
  fontWeight: 'fontWeight',
  lineHeight: 'number',
  letterSpacing: 'dimension',
};
const FONT_WEIGHT_KEYWORDS = {
  thin: 100, hairline: 100, 'extra-light': 200, 'ultra-light': 200, light: 300,
  normal: 400, regular: 400, book: 400, medium: 500, 'semi-bold': 600, 'demi-bold': 600,
  bold: 700, 'extra-bold': 800, 'ultra-bold': 800, black: 900, heavy: 900,
};

/** Reverse-domain key for Quantum data inside DTCG `$extensions` (resolved platform outputs, Specs bridge). */
export const EXT = 'io.quantum';

export const isAlias = (v) => typeof v === 'string' && ALIAS_RE.test(v.trim());
export const aliasPath = (v) => v.trim().match(ALIAS_RE)[1];

/** Recursively list *.json files under a directory (sorted for determinism). */
export function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFiles(p));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(p);
  }
  return out.sort();
}

/** Deep-merge DTCG groups from several files into one tree. Duplicate token paths are an error. */
export function mergeTrees(trees) {
  const root = {};
  const merge = (target, source, trail, file) => {
    for (const [key, value] of Object.entries(source)) {
      if (key.startsWith('$')) {
        if (!(key in target)) target[key] = value;
        continue;
      }
      const here = [...trail, key];
      if (isToken(value)) {
        if (key in target) throw new Error(`Duplicate token "${here.join('.')}" in ${file}`);
        target[key] = { ...value, $file: file };
      } else if (value && typeof value === 'object') {
        if (isToken(target[key])) throw new Error(`Group "${here.join('.')}" in ${file} collides with a token`);
        target[key] ??= {};
        merge(target[key], value, here, file);
      }
    }
  };
  for (const { tree, file } of trees) merge(root, tree, [], file);
  return root;
}

export const isToken = (node) => !!node && typeof node === 'object' && '$value' in node;

/**
 * Flatten a DTCG tree into a list of tokens.
 * $type is inherited from the nearest ancestor group when a token omits it.
 */
export function flatten(tree, { tier = null } = {}) {
  const tokens = [];
  const walk = (node, trail, inheritedType, inheritedDescription) => {
    const type = node.$type ?? inheritedType;
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      const here = [...trail, key];
      if (isToken(value)) {
        tokens.push({
          path: here.join('.'),
          segments: here,
          type: value.$type ?? type ?? null,
          value: value.$value,
          description: value.$description ?? null,
          extensions: value.$extensions ?? null,
          file: value.$file ?? null,
          tier,
        });
      } else if (value && typeof value === 'object') {
        walk(value, here, type, value.$description ?? inheritedDescription);
      }
    }
  };
  walk(tree, [], null, null);
  return tokens;
}

/** Load one tier: every JSON file under each source directory, merged and flattened. */
export function loadTier({ name, sources }, tokensDir) {
  const files = sources.flatMap((s) => listJsonFiles(path.resolve(tokensDir, s)));
  const trees = files.map((file) => ({
    file: path.relative(tokensDir, file),
    tree: JSON.parse(fs.readFileSync(file, 'utf8')),
  }));
  const tree = mergeTrees(trees);
  return { name, files: trees.map((t) => t.file), tree, tokens: flatten(tree, { tier: name }) };
}

/** Load one platform overlay (config.platforms[id]): every JSON file under its sources, merged and flattened. */
export function loadPlatform(id, cfg, tokensDir) {
  const files = (cfg.sources ?? []).flatMap((s) => listJsonFiles(path.resolve(tokensDir, s)));
  const trees = files.map((file) => ({ file: path.relative(tokensDir, file), tree: JSON.parse(fs.readFileSync(file, 'utf8')) }));
  const tree = mergeTrees(trees);
  return { id, output: cfg.output ?? null, files: trees.map((t) => t.file), tree, tokens: flatten(tree, { tier: null }) };
}

/**
 * Load one mode (config.modes[id]): a color scheme or any other context in which the same token
 * paths take other values. The default mode has no sources: the base tiers are its values.
 * Every other mode is an overlay of the tiers marked `modal`.
 */
export function loadMode(id, cfg, tokensDir) {
  const files = (cfg.sources ?? []).flatMap((s) => listJsonFiles(path.resolve(tokensDir, s)));
  const trees = files.map((file) => ({ file: path.relative(tokensDir, file), tree: JSON.parse(fs.readFileSync(file, 'utf8')) }));
  const tree = mergeTrees(trees);
  return { id, default: cfg.default === true, scheme: cfg.scheme ?? null, description: cfg.description ?? null, files: trees.map((t) => t.file), tree, tokens: flatten(tree, { tier: null }) };
}

/** The configuration file of the tokens package, next to its package.json. */
export const CONFIG_FILE = 'tokens.config.json';

/** Load every tier, platform overlay and mode declared in tokens.config.json. Returns { config, tiers, byPath, all, platforms, modes }. */
export function loadAll(tokensDir) {
  const config = JSON.parse(fs.readFileSync(path.join(tokensDir, CONFIG_FILE), 'utf8'));
  const tiers = config.tiers.map((t) => loadTier(t, tokensDir));
  const entries = (o) => Object.entries(o ?? {}).filter(([id]) => !id.startsWith('$'));
  const platforms = entries(config.platforms).map(([id, cfg]) => loadPlatform(id, cfg, tokensDir));
  const modes = entries(config.modes).map(([id, cfg]) => loadMode(id, cfg, tokensDir));
  return { ...indexTiers(config, tiers), platforms, modes };
}

/** A platform from in-memory trees (tests and tooling). */
export function platformFromTrees(id, trees, output = null) {
  const tree = mergeTrees(trees.map((tree, i) => ({ tree, file: `${id}-${i}.json` })));
  return { id, output, files: [], tree, tokens: flatten(tree, { tier: null }) };
}

/** A mode from in-memory trees (tests and tooling). */
export function modeFromTrees(id, trees, { default: isDefault = false, scheme = null } = {}) {
  const tree = mergeTrees(trees.map((tree, i) => ({ tree, file: `${id}-${i}.json` })));
  return { id, default: isDefault, scheme, description: null, files: [], tree, tokens: flatten(tree, { tier: null }) };
}

/** The default mode of a loaded set (null when no modes are declared). */
export const defaultMode = (loaded) => (loaded.modes ?? []).find((m) => m.default) ?? null;

/**
 * Sort the tokens of an overlay (platform or mode) into accepted overrides and refused ones.
 * An overlay may only replace the value of an existing token of a tier carrying `tierFlag` in
 * the config, keeping its $type; `conflict(base)` may refuse more.
 */
function overlayOverrides(index, overlay, { tierFlag, kind, conflict = () => null }) {
  const allowed = new Set(index.config.tiers.filter((t) => t[tierFlag]).map((t) => t.name));
  const problems = [];
  const overrides = new Map();
  for (const o of overlay.tokens) {
    const base = index.byPath.get(o.path);
    const problem = (message, extra = {}) => problems.push({ [kind]: overlay.id, token: o.path, file: o.file, message, ...extra });
    if (!base) { problem('overrides a token that exists in no tier; an overlay cannot add tokens'); continue; }
    if (!allowed.has(base.tier)) { problem(`overrides a ${base.tier} token; only ${[...allowed].join(' and ') || 'no'} tokens may vary per ${kind}`); continue; }
    if (o.type && base.type && o.type !== base.type) { problem(`changes the $type from ${base.type} to ${o.type}`); continue; }
    const why = conflict(base);
    if (why) { problem(why, { conflict: true }); continue; }
    overrides.set(o.path, o);
  }
  return { overrides, problems };
}

/** Clone the tiers of an index, replacing overridden values and flagging them with `flag: true`. */
function overlayTiers(index, overrides, flag) {
  return index.tiers.map((t) => ({
    ...t,
    tokens: t.tokens.map((tok) => {
      const o = overrides.get(tok.path);
      const copy = { ...tok, references: [] };
      return o ? { ...copy, value: o.value, description: o.description ?? tok.description, file: o.file, [flag]: true } : copy;
    }),
  }));
}

/**
 * Apply a platform overlay to the base index: every overlay token replaces the value of the
 * base token with the same path. Overlays may only touch tiers marked `overridable` in the
 * config and may not add tokens, so every platform resolves the same set of paths.
 * Returns { index, problems }: `index` is a fresh index (base untouched) whose overridden
 * tokens carry `overridden: true`; `problems` lists overlay tokens that were refused.
 */
export function applyPlatform(loaded, platform) {
  const { overrides, problems } = overlayOverrides(loaded, platform, { tierFlag: 'overridable', kind: 'platform' });
  const cloned = overlayTiers(loaded, overrides, 'overridden');
  return { index: { ...indexTiers(loaded.config, cloned), platforms: [], modes: [], platform: platform.id, mode: loaded.mode ?? null }, problems };
}

/**
 * Apply a mode to an index (the base one, or a platform's from applyPlatform): same rules as a
 * platform overlay, on the tiers marked `modal`. The default mode changes nothing. A token both a
 * platform and a mode override is refused: which value wins would be arbitrary.
 * Overridden tokens carry `modeOverridden: true`; the index records `mode`.
 */
export function applyMode(index, mode) {
  const conflict = (base) => (base.overridden ? `is also overridden by platform ${index.platform}; a token varies per platform or per mode, not both` : null);
  const { overrides, problems } = mode.default ? { overrides: new Map(), problems: [] } : overlayOverrides(index, mode, { tierFlag: 'modal', kind: 'mode', conflict });
  const cloned = overlayTiers(index, overrides, 'modeOverridden');
  return { index: { ...indexTiers(index.config, cloned), platforms: [], modes: [], platform: index.platform ?? null, mode: mode.id }, problems };
}

/** Index of one platform (or the base tiers when null) in one mode (or the default one when null). */
export function resolveContext(loaded, { platform = null, mode = null } = {}) {
  const p = platform ? (loaded.platforms ?? []).find((x) => x.id === platform) : null;
  if (platform && !p) throw new Error(`Unknown platform "${platform}"`);
  const m = mode ? (loaded.modes ?? []).find((x) => x.id === mode) : defaultMode(loaded);
  if (mode && !m) throw new Error(`Unknown mode "${mode}"`);
  const base = p ? applyPlatform(loaded, p).index : loaded;
  return m ? applyMode(base, m).index : base;
}

/**
 * Mode problems: the declaration (one default mode, which has no overlay), every mode's overlay
 * and references, and every platform x mode combination (a token overridden by both).
 */
export function checkModes(loaded) {
  const modes = loaded.modes ?? [];
  if (!modes.length) return [];
  const problems = [];
  const where = { token: 'modes', file: CONFIG_FILE };
  const defaults = modes.filter((m) => m.default);
  if (defaults.length !== 1) problems.push({ ...where, message: `exactly one mode must be "default": true (found ${defaults.length})` });
  if (!loaded.config.tiers.some((t) => t.modal)) problems.push({ ...where, message: 'modes are declared but no tier is "modal"' });
  for (const m of modes) {
    if (m.default && m.tokens.length) problems.push({ mode: m.id, ...where, message: 'the default mode takes its values from the base tiers; it cannot have an overlay' });
    if (m.scheme && !['light', 'dark'].includes(m.scheme)) problems.push({ mode: m.id, ...where, message: `scheme must be "light" or "dark", not "${m.scheme}"` });
    if (m.default) continue;
    const { index, problems: overlay } = applyMode(loaded, m);
    problems.push(...overlay);
    for (const p of checkReferences(index)) if (index.byPath.get(p.token)?.modeOverridden) problems.push({ mode: m.id, ...p });
    for (const pl of loaded.platforms ?? []) {
      const conflicts = applyMode(applyPlatform(loaded, pl).index, m).problems.filter((p) => p.conflict);
      problems.push(...conflicts.map((p) => ({ ...p, platform: pl.id })));
    }
  }
  return problems;
}

/** Overlay problems and reference problems of every platform. Returns a list of problems (empty when clean). */
export function checkPlatforms(loaded) {
  const problems = [];
  for (const platform of loaded.platforms ?? []) {
    const { index, problems: overlay } = applyPlatform(loaded, platform);
    problems.push(...overlay);
    for (const p of checkReferences(index)) {
      const t = index.byPath.get(p.token);
      if (t?.overridden) problems.push({ platform: platform.id, ...p });
    }
  }
  return problems;
}

/**
 * Render an index as one resolved DTCG tree: every token keeps its path, `$type` and
 * `$description`; `$value` has aliases followed; `$extensions["io.quantum"]` records the tier,
 * the alias it was authored as, and whether a platform overlay or a mode overrode it. Valid DTCG, so any
 * technology's token tooling can transform it.
 */
export function renderResolvedTree(index, { platform = null, mode = null, header = '' } = {}) {
  const overridden = index.all.filter((t) => t.overridden).map((t) => t.path);
  const modeOverridden = index.all.filter((t) => t.modeOverridden).map((t) => t.path);
  const context = { ...(platform ? { platform } : {}), ...(mode ? { mode } : {}), overridden, ...(mode ? { modeOverridden } : {}) };
  const tree = { ...(header ? { $description: header } : {}), $extensions: { [EXT]: context } };
  for (const t of index.all) {
    let node = tree;
    for (const s of t.segments.slice(0, -1)) node = node[s] ??= {};
    const entry = {};
    if (t.type) entry.$type = t.type;
    entry.$value = resolveValue(t.value, index.byPath, [t.path]);
    if (t.description) entry.$description = t.description;
    const ext = { tier: t.tier };
    if (isAlias(t.value)) ext.alias = aliasPath(t.value);
    if (t.overridden) ext.overridden = true;
    if (t.modeOverridden) ext.modeOverridden = true;
    entry.$extensions = { [EXT]: ext };
    node[t.segments.at(-1)] = entry;
  }
  return JSON.stringify(tree, null, 2) + '\n';
}

/** Build the global index (byPath, references, inferred types) from already-loaded tiers. */
export function indexTiers(config, tiers) {
  const all = tiers.flatMap((t) => t.tokens);
  const byPath = new Map();
  for (const t of all) {
    if (byPath.has(t.path)) throw new Error(`Token path "${t.path}" defined in both ${byPath.get(t.path).tier} and ${t.tier} tiers`);
    byPath.set(t.path, t);
  }
  for (const t of all) {
    t.references = collectAliases(t.value);
    t.type ??= inferType(t, byPath);
  }
  return { config, tiers, byPath, all };
}

/** Build a tier from in-memory trees (used by tests and tooling). */
export function tierFromTrees(name, trees) {
  const tree = mergeTrees(trees.map((tree, i) => ({ tree, file: `${name}-${i}.json` })));
  return { name, files: [], tree, tokens: flatten(tree, { tier: name }) };
}

/** Every alias path used anywhere inside a value (including composite members and arrays). */
export function collectAliases(value, out = []) {
  if (isAlias(value)) out.push(aliasPath(value));
  else if (Array.isArray(value)) value.forEach((v) => collectAliases(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectAliases(v, out));
  return out;
}

function inferType(token, byPath, seen = new Set()) {
  if (token.type) return token.type;
  if (isAlias(token.value)) {
    const target = byPath.get(aliasPath(token.value));
    if (target && !seen.has(target.path)) {
      seen.add(target.path);
      return target.type ?? inferType(target, byPath, seen);
    }
  }
  return null;
}

/** Fully resolve aliases to a concrete value. Throws on unknown or circular references. */
export function resolveValue(value, byPath, trail = []) {
  if (isAlias(value)) {
    const p = aliasPath(value);
    if (trail.includes(p)) throw new Error(`Circular alias: ${[...trail, p].join(' -> ')}`);
    const target = byPath.get(p);
    if (!target) throw new Error(`Unknown token reference "{${p}}"${trail.length ? ` (from ${trail[0]})` : ''}`);
    return resolveValue(target.value, byPath, [...trail, p]);
  }
  if (Array.isArray(value)) return value.map((v) => resolveValue(v, byPath, trail));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveValue(v, byPath, trail)]));
  }
  return value;
}

/** Validate every alias in the set resolves and respects tier boundaries. Returns a list of problems. */
export function checkReferences({ config, byPath, all }) {
  const problems = [];
  const allowed = Object.fromEntries(config.tiers.map((t) => [t.name, new Set(t.mayReference ?? [])]));
  for (const t of all) {
    for (const ref of t.references) {
      const target = byPath.get(ref);
      if (!target) {
        problems.push({ token: t.path, file: t.file, message: `references unknown token "{${ref}}"` });
        continue;
      }
      if (target.tier !== t.tier && !allowed[t.tier].has(target.tier)) {
        problems.push({ token: t.path, file: t.file, message: `(${t.tier}) may not reference ${target.tier} token "{${ref}}"; allowed tiers: ${[...allowed[t.tier]].join(', ') || 'none'}` });
      }
    }
    try {
      resolveValue(t.value, byPath, [t.path]);
    } catch (e) {
      if (!/Unknown token reference/.test(e.message)) problems.push({ token: t.path, file: t.file, message: e.message });
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// CSS emission
// ---------------------------------------------------------------------------

export function cssVarName(pathOrSegments, prefix = '') {
  const segs = Array.isArray(pathOrSegments) ? pathOrSegments : pathOrSegments.split('.');
  const name = segs.map(slug).join('-');
  return `--${prefix ? slug(prefix) + '-' : ''}${name}`;
}

export const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

const quoteFont = (f) => (/[^a-zA-Z0-9-]/.test(f) && !/^(serif|sans-serif|monospace|system-ui|ui-monospace|ui-serif|ui-sans-serif|cursive|fantasy|math|emoji|fangsong)$/.test(f) ? `"${f}"` : f);

/** Format a *resolved* (alias-free) scalar value of a given DTCG type as CSS. */
export function formatScalar(type, value) {
  if (value === null || value === undefined) return '';
  switch (type) {
    case 'color': {
      if (typeof value === 'string') return value;
      const { colorSpace = 'srgb', components = [], alpha = 1 } = value;
      // `hex` is the opaque fallback of DTCG 2025 colors: carry the alpha channel into it.
      if (value.hex) return alpha === 1 || alpha === undefined ? value.hex : `${value.hex.slice(0, 7)}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      const comps = components.map((c) => (c === 'none' ? 'none' : +(+c).toFixed(4))).join(' ');
      const a = alpha === 1 || alpha === undefined ? '' : ` / ${alpha}`;
      if (colorSpace === 'srgb') return `color(srgb ${comps}${a})`;
      if (['display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'xyz-d50', 'xyz-d65', 'srgb-linear'].includes(colorSpace)) return `color(${colorSpace} ${comps}${a})`;
      return `${colorSpace}(${comps}${a})`; // hsl, hwb, lab, lch, oklab, oklch
    }
    case 'dimension':
    case 'duration':
      if (typeof value === 'object') return `${value.value}${value.unit ?? ''}`;
      return String(value);
    case 'fontFamily':
      return (Array.isArray(value) ? value : [value]).map(quoteFont).join(', ');
    case 'fontWeight':
      if (typeof value === 'string') return String(FONT_WEIGHT_KEYWORDS[value.toLowerCase()] ?? value);
      return String(value);
    case 'number':
      return String(value);
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`;
    case 'shadow': {
      const one = (s) => `${s.inset ? 'inset ' : ''}${formatScalar('dimension', s.offsetX)} ${formatScalar('dimension', s.offsetY)} ${formatScalar('dimension', s.blur)} ${formatScalar('dimension', s.spread)} ${formatScalar('color', s.color)}`;
      return (Array.isArray(value) ? value : [value]).map(one).join(', ');
    }
    case 'border':
      return `${formatScalar('dimension', value.width)} ${typeof value.style === 'string' ? value.style : 'solid'} ${formatScalar('color', value.color)}`;
    default:
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}

/**
 * Turn one token into CSS declarations: [[name, value], ...].
 * Composite types (typography) expand into one declaration per member.
 * With preserveAliases, an alias becomes var(--target) so the cascade stays themeable.
 */
export function cssDeclarations(token, byPath, { prefix = '', preserveAliases = true } = {}) {
  const name = cssVarName(token.segments, prefix);
  const type = token.type;
  const memberValue = (subType, v) => {
    if (preserveAliases && isAlias(v)) {
      const target = byPath.get(aliasPath(v));
      if (!target) throw new Error(`Unknown token reference "{${aliasPath(v)}}" in ${token.path}`);
      return `var(${cssVarName(target.segments, prefix)})`;
    }
    return formatScalar(subType, resolveValue(v, byPath, [token.path]));
  };

  if (type in COMPOSITE_KEYS) {
    const keys = COMPOSITE_KEYS[type];
    if (isAlias(token.value)) {
      const target = byPath.get(aliasPath(token.value));
      if (!target) throw new Error(`Unknown token reference "${token.value}" in ${token.path}`);
      if (preserveAliases) {
        return keys.map((k) => [`${name}-${camelToKebab(k)}`, `var(${cssVarName(target.segments, prefix)}-${camelToKebab(k)})`]);
      }
      const resolved = resolveValue(token.value, byPath, [token.path]);
      return keys.filter((k) => k in resolved).map((k) => [`${name}-${camelToKebab(k)}`, formatScalar(COMPOSITE_SUBTYPES[k], resolved[k])]);
    }
    return keys
      .filter((k) => k in token.value)
      .map((k) => [`${name}-${camelToKebab(k)}`, memberValue(COMPOSITE_SUBTYPES[k], token.value[k])]);
  }

  if (preserveAliases && isAlias(token.value)) {
    const target = byPath.get(aliasPath(token.value));
    if (!target) throw new Error(`Unknown token reference "${token.value}" in ${token.path}`);
    return [[name, `var(${cssVarName(target.segments, prefix)})`]];
  }
  // Composite object with alias members (shadow/border) is resolved fully.
  return [[name, formatScalar(type, resolveValue(token.value, byPath, [token.path]))]];
}

/** One CSS rule: `selector { name: value; … }`, indented by `indent`. */
function renderRule(selector, declarations, indent = '') {
  return [`${indent}${selector} {`, ...declarations.map(([n, v]) => `${indent}  ${n}: ${v};`), `${indent}}`];
}

const tokenDeclarations = (tokens, byPath, opts) => tokens.flatMap((t) => cssDeclarations(t, byPath, opts));

/**
 * Render a CSS file for a list of tokens. `declarations` are emitted before the tokens' own;
 * `after` holds extra rules (lines) appended to the file.
 */
export function renderCss(tokens, byPath, { selector = ':root', prefix = '', preserveAliases = true, header = '', declarations = [], after = [] } = {}) {
  const lines = [];
  if (header) lines.push(`/* ${header} */`);
  lines.push(...renderRule(selector, [...declarations, ...tokenDeclarations(tokens, byPath, { prefix, preserveAliases })]));
  if (after.length) lines.push('', ...after);
  lines.push('');
  return lines.join('\n');
}

/**
 * Web contexts of the modes (config.css.modes = { attribute, auto }): the default mode applies
 * to the root and to every element carrying the attribute; `[attribute="<mode>"]` switches a
 * subtree to another mode; `[attribute="<auto>"]` follows the user's color scheme preference
 * through the modes' `scheme`. Tiers that read a modal tier (directly or through another tier)
 * are declared on every context too, so their var() aliases resolve again inside it.
 * Returns null when there is nothing to switch.
 */
function modeContexts(loaded) {
  const { config } = loaded;
  const ctx = config.css?.modes;
  const def = defaultMode(loaded);
  const others = (loaded.modes ?? []).filter((m) => !m.default);
  if (!ctx?.attribute || !def || !others.length) return null;
  const attr = (v) => `[${ctx.attribute}="${v}"]`;
  const modal = new Set(config.tiers.filter((t) => t.modal).map((t) => t.name));
  const reaches = (name, seen = new Set([name])) =>
    modal.has(name) || (config.tiers.find((t) => t.name === name)?.mayReference ?? []).some((r) => !seen.has(r) && reaches(r, new Set([...seen, r])));
  const firstModal = config.tiers.find((t) => t.modal)?.name;
  return {
    selector: (tierName, base) => (reaches(tierName) ? `${base}, [${ctx.attribute}]` : base),
    /** Color-scheme declarations of the first modal tier's root rule. */
    rootDeclarations: (tierName) => (tierName === firstModal && def.scheme ? [['color-scheme', def.scheme]] : []),
    /** Rules after the root rule of a modal tier: one per other mode, plus the auto preference. */
    rules: (tierName, opts) => {
      if (!modal.has(tierName)) return [];
      const out = [];
      const schemes = [...new Set([def, ...others].map((m) => m.scheme).filter(Boolean))];
      if (tierName === firstModal && ctx.auto && schemes.length > 1) out.push(...renderRule(attr(ctx.auto), [['color-scheme', schemes.join(' ')]]), '');
      for (const m of others) {
        const { index } = applyMode(loaded, m);
        const decls = tokenDeclarations(index.all.filter((t) => t.tier === tierName && t.modeOverridden), index.byPath, opts);
        const scheme = tierName === firstModal && m.scheme ? [['color-scheme', m.scheme]] : [];
        out.push(`/* Mode ${m.id}${m.description ? `: ${m.description}` : ''} */`, ...renderRule(attr(m.id), [...scheme, ...decls]), '');
        if (ctx.auto && m.scheme && m.scheme !== def.scheme) {
          out.push(`@media (prefers-color-scheme: ${m.scheme}) {`, ...renderRule(attr(ctx.auto), decls, '  '), '}', '');
        }
      }
      if (out.at(-1) === '') out.pop();
      return out;
    },
  };
}

/**
 * Compute every output file: Map<absoluteOutputPath, text>. CSS per tier (web), with one rule
 * per mode context, and one resolved DTCG JSON per platform overlay and mode. Pure (no writes)
 * so the build and its tests can share it. Assumes checkReferences, checkPlatforms and checkModes passed.
 */
export function planOutputs(loaded, tokensDir) {
  const { config, tiers, byPath } = loaded;
  const { modes: _contexts, ...css } = config.css ?? {};
  const outputs = new Map();
  const header = (label) => `GENERATED by scripts/build-tokens.mjs from the token sources of packages/tokens/src (${label}). Do not edit by hand; run "pnpm tokens:build".`;
  const modes = loaded.modes?.length ? loaded.modes : [null];
  for (const platform of loaded.platforms ?? []) {
    if (!platform.output) continue;
    const { index } = applyPlatform(loaded, platform);
    for (const m of platform.output.includes('{mode}') ? modes : [defaultMode(loaded)]) {
      const resolved = m ? applyMode(index, m).index : index;
      const label = `platform ${platform.id}${m ? `, mode ${m.id}` : ''}, every tier resolved`;
      outputs.set(path.resolve(tokensDir, platform.output.replace('{mode}', m?.id ?? '')), renderResolvedTree(resolved, { platform: platform.id, mode: m?.id ?? null, header: header(label) }));
    }
  }
  const contexts = modeContexts(loaded);
  for (const tierCfg of config.tiers) {
    const tier = tiers.find((t) => t.name === tierCfg.name);
    const opts = {
      ...css,
      selector: contexts ? contexts.selector(tierCfg.name, css.selector ?? ':root') : css.selector,
      declarations: contexts?.rootDeclarations(tierCfg.name) ?? [],
      after: contexts?.rules(tierCfg.name, { prefix: css.prefix, preserveAliases: css.preserveAliases }) ?? [],
    };
    if (tierCfg.splitByTopLevelGroup) {
      const groups = new Map();
      for (const t of tier.tokens) {
        const g = t.segments[0];
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(t);
      }
      for (const [g, toks] of groups) {
        const out = path.resolve(tokensDir, tierCfg.output.replace('{component}', g));
        outputs.set(out, renderCss(toks, byPath, { ...opts, header: header(`${tierCfg.name} tier, ${g}`) }));
      }
    } else {
      const out = path.resolve(tokensDir, tierCfg.output);
      outputs.set(out, renderCss(tier.tokens, byPath, { ...opts, header: header(`${tierCfg.name} tier`) }));
    }
  }
  // The entry point: every CSS file above, in cascade order (tiers as configured, component files by name).
  if (config.css?.index) {
    const index = path.resolve(tokensDir, config.css.index);
    const files = [...outputs.keys()].filter((f) => f.endsWith('.css'));
    const imports = files.map((f) => `@import "./${path.relative(path.dirname(index), f).split(path.sep).join('/')}";`);
    outputs.set(index, `/* ${header('entry point: every tier in cascade order')} */\n${imports.join('\n')}\n`);
  }
  return outputs;
}
