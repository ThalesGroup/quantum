/**
 * The distribution formats of @quantum-ds/tokens, built with Style Dictionary from the DTCG sources
 * (src/, tiers, platforms and modes declared in tokens.config.json), as the 1.x package shipped them:
 *
 *   dist/tokens.css, dist/tokens-<mode>.css        CSS custom properties (:root, then .<mode>)
 *   dist/tokens.scss, dist/tokens-<mode>.scss      Sass variables
 *   dist/tokens-es6.js, dist/tokens-es6.d.ts       one named export per token (+ -<mode> files)
 *   dist/variables-css.js                          the CSS custom property name of every token (CommonJS)
 *   dist/resources.xml, dist/resources-<mode>.xml  Android resources (android platform overlay)
 *   dist/figma/, dist/tokens_studio/               one file per top-level group, plus tokens.json
 *   dist/penpot/tokens.json                        Penpot token sets and themes (one theme per mode)
 *   dist/dtcg/                                     the DTCG sources and a resolver (quantum.resolver.json)
 *
 * A -<mode> file holds every token whose value differs in that mode (a semantic token the mode
 * overrides and every token aliasing it), to be loaded after the default file. The tokens CSS
 * that the docs site and the reference implementation read (dist/css/, dist/platforms/,
 * dist/shiki-theme.json) comes from scripts/build-tokens.mjs at the root of the monorepo.
 *
 *   node style-dictionary.config.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { fileHeader } from 'style-dictionary/utils';

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, 'tokens.config.json'), 'utf8'));
const DIST = 'dist/';

// ---------------------------------------------------------------------------
// Sources: the tiers, the platform overlays and the mode overlays, merged per context
// ---------------------------------------------------------------------------

const entries = (obj) => Object.entries(obj ?? {}).filter(([k]) => !k.startsWith('$'));
const isToken = (node) => !!node && typeof node === 'object' && '$value' in node;

function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) => (e.isDirectory() ? listJson(path.join(dir, e.name)) : e.name.endsWith('.json') ? [path.join(dir, e.name)] : []));
}

/** Deep-merge DTCG trees: a token of a later tree replaces the token of an earlier one. */
function merge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (isToken(v) || typeof v !== 'object' || v === null || typeof target[k] !== 'object' || target[k] === null) target[k] = structuredClone(v);
    else merge(target[k], v);
  }
  return target;
}

const readTree = (dirs) => dirs.flatMap((d) => listJson(path.join(here, d))).reduce((tree, f) => merge(tree, JSON.parse(fs.readFileSync(f, 'utf8'))), {});

const tiers = config.tiers.map((t) => ({ ...t, tree: readTree(t.sources) }));
const base = tiers.reduce((tree, t) => merge(tree, t.tree), {});
const componentGroups = new Set(Object.keys(tiers.find((t) => t.name === 'component')?.tree ?? {}));

const modes = entries(config.modes).map(([id, m]) => ({ id, ...m, tree: m.default ? {} : readTree(m.sources ?? []) }));
const defaultMode = modes.find((m) => m.default);
const otherModes = modes.filter((m) => !m.default);
const platformTree = (id) => readTree(config.platforms?.[id]?.sources ?? []);

/** The tree of one context: the base tiers, then a platform overlay, then a mode overlay. */
const contextTree = ({ platform = null, mode = defaultMode } = {}) => [platform ? platformTree(platform) : {}, mode.tree].reduce((tree, overlay) => merge(tree, overlay), structuredClone(base));

/** Paths of every token a tree defines. */
function tokenPaths(tree, prefix = [], out = new Set()) {
  for (const [k, v] of entries(tree)) {
    if (isToken(v)) out.add([...prefix, k].join('.'));
    else if (v && typeof v === 'object') tokenPaths(v, [...prefix, k], out);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------

const ALIAS_RE = /^\{([^{}]+)\}$/;
const aliasOf = (v) => (typeof v === 'string' ? v.trim().match(ALIAS_RE)?.[1] ?? null : null);
const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const kebab = (segments) => segments.map(slug).join('-');
const pascal = (segments) => segments.flatMap((s) => slug(s).split('-')).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const camel = (segments) => pascal(segments).replace(/^./, (c) => c.toLowerCase());
const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/** Members of a typography token, in the order the CSS of dist/css/ declares them. */
const TYPOGRAPHY_MEMBERS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];
const memberType = { fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', lineHeight: 'number', letterSpacing: 'dimension' };

const GENERIC_FAMILIES = /^(serif|sans-serif|monospace|system-ui|ui-monospace|ui-serif|ui-sans-serif|cursive|fantasy|math|emoji|fangsong)$/;
const quoteFont = (f) => (/[^a-zA-Z0-9-]/.test(f) && !GENERIC_FAMILIES.test(f) ? `"${f}"` : f);

const channel = (c) => Math.round((c === 'none' ? 0 : c) * 255);
/** Alpha channel, rounded: the sources hold float32 noise (0.10000000149011612). */
const alphaOf = (v) => (v.alpha === undefined ? 1 : +v.alpha.toFixed(4));

function colorString(v) {
  if (typeof v === 'string') return v;
  const a = alphaOf(v);
  if ((v.colorSpace ?? 'srgb') === 'srgb') {
    if (a === 1 && v.hex) return v.hex;
    const [r, g, b] = v.components.map(channel);
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `color(${v.colorSpace} ${v.components.join(' ')}${a === 1 ? '' : ` / ${a}`})`;
}

/** rgba(), the color notation of Tokens Studio and Penpot. */
function rgba(v) {
  if (typeof v === 'string') return v;
  const [r, g, b] = v.components.map(channel);
  return `rgba(${r}, ${g}, ${b}, ${alphaOf(v)})`;
}

/** #AARRGGBB, the Android color notation. */
function androidColor(v) {
  if (typeof v === 'string') return v;
  const hex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
  const [r, g, b] = v.hex && /^#[0-9a-f]{6}$/i.test(v.hex) ? [1, 3, 5].map((i) => parseInt(v.hex.slice(i, i + 2), 16)) : v.components.map(channel);
  return `#${hex(Math.round(alphaOf(v) * 255))}${hex(r)}${hex(g)}${hex(b)}`;
}

const dimensionString = (v) => (v && typeof v === 'object' ? `${v.value}${v.unit ?? ''}` : String(v));
/** A dimension in pixels, the unit of the design tools (rem at 16 px). */
const px = (v) => (v && typeof v === 'object' ? (v.unit === 'rem' || v.unit === 'em' ? v.value * 16 : v.value) : Number.parseFloat(v));

/** A resolved scalar value as text; `css` quotes font family names that need it. */
function scalar(type, v, { css = false } = {}) {
  switch (type) {
    case 'color': return colorString(v);
    case 'dimension':
    case 'duration': return dimensionString(v);
    case 'cubicBezier': return Array.isArray(v) ? `cubic-bezier(${v.join(', ')})` : String(v);
    case 'fontFamily': return (Array.isArray(v) ? v : [v]).map((f) => (css ? quoteFont(f) : f)).join(', ');
    case 'shadow': return (Array.isArray(v) ? v : [v]).map((s) => `${s.inset ? 'inset ' : ''}${[s.offsetX, s.offsetY, s.blur, s.spread].map(dimensionString).join(' ')} ${colorString(s.color)}`).join(', ');
    default:
      if (v && typeof v === 'object' && 'value' in v) return dimensionString(v);
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
}

// ---------------------------------------------------------------------------
// Tokens of a dictionary: path index, types through aliases, flat entries
// ---------------------------------------------------------------------------

const pathOf = (token) => token.path.join('.');

function indexTokens(dictionary) {
  const byPath = new Map(dictionary.unfilteredAllTokens.map((t) => [pathOf(t), t]));
  /** $type of a token, following its alias when it has none of its own. */
  const typeOf = (token, trail = new Set()) => {
    if (token.$type) return token.$type;
    const target = byPath.get(aliasOf(token.original.$value));
    if (!target || trail.has(target)) return undefined;
    return typeOf(target, trail.add(target));
  };
  return { byPath, typeOf };
}

/**
 * The flat entries of a token: one per token, one per member for a typography token.
 * Each entry has the segments of its name, its type, its resolved value and, when the source
 * value is an alias, the segments of the referenced entry.
 */
function flatEntries(token, { byPath, typeOf }) {
  const type = typeOf(token);
  const original = token.original.$value;
  const targetSegments = (alias) => byPath.get(alias)?.path ?? alias.split('.');
  if (type === 'typography') {
    const whole = aliasOf(original);
    return TYPOGRAPHY_MEMBERS.filter((m) => token.$value?.[m] !== undefined).map((m) => {
      const memberAlias = whole ? null : aliasOf(original[m]);
      return {
        segments: [...token.path, camelToKebab(m)],
        type: memberType[m],
        value: token.$value[m],
        ref: whole ? [...targetSegments(whole), camelToKebab(m)] : memberAlias ? targetSegments(memberAlias) : null,
      };
    });
  }
  const alias = aliasOf(original);
  return [{ segments: token.path, type, value: token.$value, ref: alias ? targetSegments(alias) : null }];
}

/** Tokens in an order where every token comes after the tokens it references (Sass needs it). */
function referenceOrder(tokens, byPath) {
  const done = new Set();
  const out = [];
  const refs = (t) => {
    const v = t.original.$value;
    const values = v && typeof v === 'object' && !Array.isArray(v) ? Object.values(v) : [v];
    return values.map(aliasOf).filter(Boolean).map((p) => byPath.get(p)).filter(Boolean);
  };
  const visit = (t) => {
    if (done.has(t)) return;
    done.add(t);
    refs(t).forEach(visit);
    out.push(t);
  };
  const wanted = new Set(tokens);
  tokens.forEach(visit);
  return out.filter((t) => wanted.has(t));
}

const header = async (file, commentStyle) => fileHeader({ file, commentStyle });

// ---------------------------------------------------------------------------
// Formats: CSS, Sass, JavaScript, Android
// ---------------------------------------------------------------------------

StyleDictionary.registerTransform({
  name: 'quantum/name',
  type: 'name',
  transform: (token) => kebab(token.path),
});

StyleDictionary.registerFormat({
  name: 'quantum/css',
  format: async ({ dictionary, file, options }) => {
    const index = indexTokens(dictionary);
    const lines = dictionary.allTokens.flatMap((t) => flatEntries(t, index)).map((e) => `  --${kebab(e.segments)}: ${e.ref ? `var(--${kebab(e.ref)})` : scalar(e.type, e.value, { css: true })};`);
    return `${await header(file)}${options.selector} {\n${lines.join('\n')}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'quantum/scss',
  format: async ({ dictionary, file }) => {
    const index = indexTokens(dictionary);
    const lines = referenceOrder(dictionary.allTokens, index.byPath).flatMap((t) => flatEntries(t, index)).map((e) => `$${kebab(e.segments)}: ${e.ref ? `$${kebab(e.ref)}` : scalar(e.type, e.value, { css: true })};`);
    return `${await header(file)}${lines.join('\n')}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'quantum/es6',
  format: async ({ dictionary, file }) => {
    const index = indexTokens(dictionary);
    const lines = dictionary.allTokens.flatMap((t) => flatEntries(t, index)).map((e) => `export const ${pascal(e.segments)} = ${JSON.stringify(scalar(e.type, e.value))};`);
    return `${await header(file)}${lines.join('\n')}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'quantum/es6-declarations',
  format: async ({ dictionary, file }) => {
    const index = indexTokens(dictionary);
    const lines = dictionary.allTokens.flatMap((t) => flatEntries(t, index)).map((e) => `export const ${pascal(e.segments)}: string;`);
    return `${await header(file)}${lines.join('\n')}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'quantum/variables-css',
  format: async ({ dictionary, file }) => {
    const index = indexTokens(dictionary);
    const vars = dictionary.allTokens.flatMap((t) => flatEntries(t, index)).map((e) => [camel(e.segments), `--${kebab(e.segments)}`]);
    return `${await header(file)}${vars.map(([n, v]) => `const ${n} = ${JSON.stringify(v)};`).join('\n')}\n\nmodule.exports = {\n${vars.map(([n]) => `  ${n},`).join('\n')}\n};\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'quantum/android-resources',
  format: async ({ dictionary, file }) => {
    const index = indexTokens(dictionary);
    const snake = (segments) => kebab(segments).replace(/-/g, '_');
    const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '\\"').replace(/'/g, "\\'");
    const lines = dictionary.allTokens.flatMap((t) => flatEntries(t, index)).map((e) => {
      const tag = e.type === 'color' ? 'color' : 'string';
      const value = e.ref ? `@${tag}/${snake(e.ref)}` : e.type === 'color' ? androidColor(e.value) : escape(scalar(e.type, e.value));
      return `  <${tag} name="${snake(e.segments)}">${value}</${tag}>`;
    });
    return `<?xml version="1.0" encoding="utf-8"?>\n${await header(file, 'xml')}\n<resources>\n${lines.join('\n')}\n</resources>\n`;
  },
});

// ---------------------------------------------------------------------------
// Formats: design tools (Figma, Tokens Studio, Penpot)
// ---------------------------------------------------------------------------

/**
 * The Tokens Studio and Penpot type of a token, from the DTCG type and the property its path
 * names: the design tools tell a radius, a stroke width, a spacing, a size or a font size apart
 * where DTCG only has `dimension`.
 */
function designToolType(segments, type, { penpot = false } = {}) {
  const has = (re) => segments.some((s) => re.test(s));
  switch (type) {
    case 'color': return 'color';
    case 'typography': return 'typography';
    case 'shadow': return penpot ? 'shadow' : 'boxShadow';
    case 'fontFamily': return penpot ? 'fontFamily' : 'fontFamilies';
    case 'fontWeight': return penpot ? 'fontWeight' : 'fontWeights';
    case 'number':
      if (has(/^opacity$/)) return 'opacity';
      if (has(/^line-height$/)) return 'lineHeights';
      return 'number';
    case 'dimension':
      if (has(/radius$/)) return 'borderRadius';
      if (has(/^(border|stroke|outline)-width$/) || (has(/^ring$/) && has(/^width$/))) return 'borderWidth';
      if (has(/letter-spacing$/)) return 'letterSpacing';
      if (has(/^(body|heading|mono)$/) && has(/^size$/)) return 'fontSizes';
      if (has(/^font-size$/)) return 'fontSizes';
      if (has(/^(space|gap|column-gap|row-gap|offset|outline-offset)$/) || has(/^(padding|margin)(-|$)/)) return 'spacing';
      if (has(/^(size|width|height|min-width|min-height|max-width|max-height)$/)) return 'sizing';
      return 'dimension';
    default: return null; // duration, cubicBezier: no design-tool equivalent
  }
}

/** One token as a design tool reads it, or null when the tool has no equivalent type. */
function designToolToken(token, index, tool) {
  const type = index.typeOf(token);
  const original = token.original.$value;
  const alias = aliasOf(original);
  const v = token.$value;
  if (tool === 'figma') {
    if (alias) return type === 'duration' ? null : { $value: original };
    switch (type) {
      case 'color': return { $type: 'color', $value: original };
      case 'dimension': return { $type: 'number', $value: px(v) };
      case 'fontWeight':
      case 'number': return { $type: 'number', $value: v };
      case 'fontFamily': return { $type: 'fontFamily', $value: original };
      case 'cubicBezier': return { $type: 'string', $value: scalar(type, v) };
      case 'typography':
        return Object.fromEntries(TYPOGRAPHY_MEMBERS.filter((m) => original[m] !== undefined).map((m) => {
          if (aliasOf(original[m])) return [m, { $value: original[m] }];
          if (memberType[m] === 'dimension') return [m, { $type: 'number', $value: px(original[m]) }];
          if (memberType[m] === 'fontFamily') return [m, { $type: 'fontFamily', $value: original[m] }];
          return [m, { $type: 'number', $value: original[m] }];
        }));
      default: return null;
    }
  }
  const penpot = tool === 'penpot';
  const toolType = designToolType(token.path, type, { penpot });
  if (!toolType) return null;
  const withDescription = (t) => (penpot ? { ...t, description: token.$description ?? '' } : t);
  if (alias) return withDescription({ $type: toolType, $value: original });
  const member = (m, value) => {
    if (aliasOf(value)) return value;
    if (m === 'letterSpacing') return `${px(value)}px`;
    if (memberType[m] === 'fontFamily') return scalar('fontFamily', value);
    return scalar(memberType[m], value);
  };
  switch (type) {
    case 'color': return withDescription({ $type: toolType, $value: rgba(v) });
    case 'dimension': return withDescription({ $type: toolType, $value: `${px(v)}px` });
    case 'fontFamily': return withDescription({ $type: toolType, $value: penpot ? original : scalar('fontFamily', v) });
    case 'typography':
      return withDescription({ $type: toolType, $value: Object.fromEntries(TYPOGRAPHY_MEMBERS.filter((m) => original[m] !== undefined).map((m) => [m, member(m, original[m])])) });
    default: return withDescription({ $type: toolType, $value: v });
  }
}

/**
 * The tokens of a dictionary (those its file keeps, and `only` keeps) as a nested tree for a design
 * tool, without the tokens the tool has no type for nor the aliases to them.
 */
function designToolTree(dictionary, tool, only = () => true) {
  const index = indexTokens(dictionary);
  const kept = new Map();
  for (const t of dictionary.unfilteredAllTokens) {
    const out = designToolToken(t, index, tool);
    if (out) kept.set(pathOf(t), out);
  }
  // An alias to a token the tool has no type for (a duration) would dangle: drop it, transitively.
  let dropped = true;
  while (dropped) {
    dropped = false;
    for (const [p, out] of kept) {
      const values = out.$value !== undefined ? [out.$value] : Object.values(out).map((m) => m.$value);
      const refs = values.flatMap((v) => (v && typeof v === 'object' ? Object.values(v) : [v])).map(aliasOf).filter(Boolean);
      if (refs.some((r) => !kept.has(r) && index.byPath.has(r))) { kept.delete(p); dropped = true; }
    }
  }
  const tree = {};
  for (const t of dictionary.allTokens.filter(only)) {
    const out = kept.get(pathOf(t));
    if (!out) continue;
    const segments = t.path;
    let cursor = tree;
    for (const s of segments.slice(0, -1)) cursor = cursor[s] ??= {};
    cursor[segments.at(-1)] = out;
  }
  return tree;
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

StyleDictionary.registerFormat({
  name: 'quantum/figma',
  format: ({ dictionary }) => json(designToolTree(dictionary, 'figma')),
});

StyleDictionary.registerFormat({
  name: 'quantum/tokens-studio',
  format: ({ dictionary, options }) => {
    const tree = designToolTree(dictionary, 'tokensStudio');
    return json(options.single ? { tokens: tree } : tree);
  },
});

const title = (id) => id.charAt(0).toUpperCase() + id.slice(1);

StyleDictionary.registerFormat({
  name: 'quantum/penpot',
  format: ({ dictionary, options }) => {
    const tree = designToolTree(dictionary, 'penpot');
    const pick = (keep) => Object.fromEntries(Object.entries(tree).filter(([group]) => keep(group)));
    const defaultSet = `Mode/${title(defaultMode.id)}`;
    const sets = {
      Foundation: pick((g) => !componentGroups.has(g)),
      Component: pick((g) => componentGroups.has(g)),
      [defaultSet]: {},
      ...Object.fromEntries(options.modes.map((m) => [`Mode/${title(m.id)}`, m.tree])),
    };
    return json({
      ...sets,
      $themes: modes.map((m) => ({
        name: title(m.id),
        group: 'Mode',
        description: m.description ?? '',
        isSource: false,
        selectedTokenSets: { Foundation: 'enabled', Component: 'enabled', [`Mode/${title(m.id)}`]: 'enabled' },
      })),
      $metadata: {
        tokenSetOrder: Object.keys(sets),
        activeThemes: [defaultSet],
        activeSets: ['Foundation', 'Component', defaultSet],
      },
    });
  },
});

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const dictionaryOf = (tree, platforms = { quantum: { transforms: ['quantum/name'] } }) => new StyleDictionary({ usesDtcg: true, tokens: tree, platforms, log: { verbosity: 'silent', warnings: 'disabled' } });

/** Every token of a context, resolved and named, as the dictionary a format receives. */
async function tokensOf(tree) {
  const { allTokens } = await dictionaryOf(tree).getPlatformTokens('quantum');
  return { allTokens, unfilteredAllTokens: allTokens };
}

/** Resolved value of every token of a context, by path. */
async function resolvedValues(tree) {
  const { allTokens } = await tokensOf(tree);
  return new Map(allTokens.map((t) => [pathOf(t), JSON.stringify(t.$value)]));
}

/** Paths whose resolved value differs between two contexts: what a -<mode> file declares. */
async function changedPaths(defaultTree, modeTree) {
  const [before, after] = await Promise.all([resolvedValues(defaultTree), resolvedValues(modeTree)]);
  return new Set([...after].filter(([p, v]) => before.get(p) !== v).map(([p]) => p));
}

const inSet = (paths) => (token) => paths.has(pathOf(token));
const groups = Object.keys(base);
const suffix = (mode) => (mode.default ? '' : `-${mode.id}`);

/** CSS, Sass and JavaScript files of the web context in one mode. */
function webFiles(mode, filter) {
  const s = suffix(mode);
  return [
    { destination: `tokens${s}.css`, format: 'quantum/css', filter, options: { selector: mode.default ? ':root' : `.${mode.id}` } },
    { destination: `tokens${s}.scss`, format: 'quantum/scss', filter },
    { destination: `tokens-es6${s}.js`, format: 'quantum/es6', filter },
    { destination: `tokens-es6${s}.d.ts`, format: 'quantum/es6-declarations', filter },
  ];
}

/** Design tool files of the web context in one mode: per top-level group, then every token. */
function designToolFiles(mode, groupsOfMode) {
  const s = suffix(mode);
  const perGroup = (dir, format) => groupsOfMode.map((g) => ({ destination: `${dir}/${g}${s}.tokens.json`, format, filter: (t) => t.path[0] === g }));
  return [
    ...perGroup('figma', 'quantum/figma'),
    { destination: `figma/tokens${s}.json`, format: 'quantum/figma' },
    ...perGroup('tokens_studio', 'quantum/tokens-studio'),
    { destination: `tokens_studio/tokens${s}.json`, format: 'quantum/tokens-studio', options: { single: true } },
  ];
}

/** The DTCG sources and a DTCG resolver document listing them by set and modifier. */
function writeDtcg() {
  const out = path.join(here, DIST, 'dtcg');
  const rel = (f) => path.relative(path.join(here, 'src'), f).split(path.sep).join('/');
  const refs = (dirs) => dirs.flatMap((d) => listJson(path.join(here, d))).map((f) => ({ $ref: rel(f) }));
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(path.join(here, 'src'), out, { recursive: true });
  const resolver = {
    name: 'Quantum',
    description: 'Quantum design tokens: raw, semantic and component tiers, with their platform and mode overlays.',
    version: '2025.10',
    resolutionOrder: [...config.tiers.map((t) => ({ $ref: `#/sets/${t.name}` })), { $ref: '#/modifiers/platform' }, { $ref: '#/modifiers/mode' }],
    sets: Object.fromEntries(config.tiers.map((t) => [t.name, { description: t.description, sources: refs(t.sources) }])),
    modifiers: {
      platform: { default: 'web', contexts: { web: [], ...Object.fromEntries(entries(config.platforms).map(([id, p]) => [id, refs(p.sources ?? [])])) } },
      mode: { default: defaultMode.id, contexts: Object.fromEntries(modes.map((m) => [m.id, refs(m.sources ?? [])])) },
    },
  };
  fs.writeFileSync(path.join(out, 'quantum.resolver.json'), json(resolver));
}

const webDefault = contextTree();
const androidDefault = contextTree({ platform: 'android' });

// Penpot holds every mode in one file: a set per mode with the tokens the mode overrides.
const penpotModes = [];
for (const mode of otherModes) penpotModes.push({ id: mode.id, tree: designToolTree(await tokensOf(contextTree({ mode })), 'penpot', inSet(tokenPaths(mode.tree))) });

await dictionaryOf(webDefault, {
  web: { transforms: ['quantum/name'], buildPath: DIST, files: [...webFiles(defaultMode), { destination: 'variables-css.js', format: 'quantum/variables-css' }] },
  design: { transforms: ['quantum/name'], buildPath: DIST, files: [...designToolFiles(defaultMode, groups), { destination: 'penpot/tokens.json', format: 'quantum/penpot', options: { modes: penpotModes } }] },
}).buildAllPlatforms();

await dictionaryOf(androidDefault, {
  android: { transforms: ['quantum/name'], buildPath: DIST, files: [{ destination: 'resources.xml', format: 'quantum/android-resources' }] },
}).buildAllPlatforms();

for (const mode of otherModes) {
  const web = contextTree({ mode });
  const android = contextTree({ platform: 'android', mode });
  const changed = await changedPaths(webDefault, web);
  const modeGroups = [...new Set([...tokenPaths(mode.tree)].map((p) => p.split('.')[0]))];
  await dictionaryOf(web, {
    web: { transforms: ['quantum/name'], buildPath: DIST, files: webFiles(mode, inSet(changed)) },
    design: { transforms: ['quantum/name'], buildPath: DIST, files: designToolFiles(mode, modeGroups) },
  }).buildAllPlatforms();
  await dictionaryOf(android, {
    android: { transforms: ['quantum/name'], buildPath: DIST, files: [{ destination: `resources${suffix(mode)}.xml`, format: 'quantum/android-resources', filter: inSet(await changedPaths(androidDefault, android)) }] },
  }).buildAllPlatforms();
}

writeDtcg();
console.log(`Built the distribution formats of @quantum-ds/tokens in ${DIST} (${modes.map((m) => m.id).join(', ')} modes).`);
