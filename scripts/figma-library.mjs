#!/usr/bin/env node
/**
 * The Figma library export -> packages/tokens/src/: the design tokens of the Figma library,
 * recreated as clean DTCG.
 *
 *   node scripts/figma-library.mjs            report how the token sources diverge from the export
 *   node scripts/figma-library.mjs --write    (re)write the files listed in COLLECTIONS
 *
 * The export lives in raw_content/ at the repository root, a local copy of the private Figma library
 * that git ignores: it is never committed, and without it this script and its tests skip. It is
 * read-only reference material: nothing else reads it. The tokens recreated from
 * it keep its paths, values and alias structure, errors included; only what a DTCG path, a CSS
 * variable or a code generator cannot carry is changed (NAME RULES below). Everything the system
 * adds on top lives in src/additions/ and src/platforms/, never in these files.
 *
 * --write is the starting point, not a sync: once the tokens evolve, writing again would undo
 * that evolution. The report mode is the lasting use: it lists every path added, removed or
 * changed since the export, so the origin of any token stays answerable.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATHS } from './lib/paths.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, PATHS.rawContent);
/** Whether the local export is there (it is never committed). */
export const available = fs.existsSync(SRC);
const out = (file) => `${PATHS.tokensSrc}/${file}`;

/** One entry per Figma library collection (and mode): where its tokens go. */
export const COLLECTIONS = [
  { set: 'Colors / Base', file: 'Colors _ Base/Mode 1.tokens.json', out: out('raw/colors-base.tokens.json') },
  { set: 'Colors / Palette Switch', file: 'Colors _ Palette Switch/Ash.tokens.json', out: out('raw/palette-switch.tokens.json'), note: 'Ash mode: the default palette. The Slate mode is not recreated yet.' },
  { set: 'Dimension', file: 'Dimension/Mode 1.tokens.json', out: out('semantic/dimension.tokens.json') },
  { set: 'Effect', file: 'Effect/Mode 1.tokens.json', out: out('semantic/effect.tokens.json') },
  { set: 'Typography', file: 'Typography/Mode 1.tokens.json', out: out('semantic/typography.tokens.json') },
  { set: 'Colors / Mapped', file: 'Colors _ Mapped/light.tokens.json', out: out('semantic/colors-mapped.tokens.json'), note: 'Light mode: the default mode.' },
  { set: 'Colors / Mapped', file: 'Colors _ Mapped/dark.tokens.json', out: out('modes/dark/colors-mapped.tokens.json'), note: 'Dark mode: only the tokens whose value differs from the light mode.', overlayOf: 'Colors _ Mapped/light.tokens.json' },
];

// ---------------------------------------------------------------------------
// NAME RULES
// ---------------------------------------------------------------------------

/**
 * A Figma library key made valid: no emoji or other non-ASCII marker, camelCase and spaces become
 * kebab-case, lowercase. `⚠️ai` -> `ai`, `semiBold` -> `semi-bold`, `drop shadow` -> `drop-shadow`,
 * `AI` -> `ai`. Typos are kept (`functionnal`, `subtile`).
 */
export const validKey = (key) =>
  String(key)
    .replace(/[^\x20-\x7e]/g, '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();

/**
 * Paths that stay distinct once made valid but would produce the same CSS variable: the build
 * joins segments with `-`, so Base `brand.identity.*` and Mapped `brand-identity.*` collide.
 * The primitive yields; the token people apply keeps its name.
 */
export const RENAMES = { 'brand.identity': 'brand.identity-base' };

export const validPath = (segments) => {
  let p = segments.map(validKey).join('.');
  for (const [from, to] of Object.entries(RENAMES)) if (p === from || p.startsWith(from + '.')) p = to + p.slice(from.length);
  return p;
};

/** A Figma variable name (`neutral/light/ash/25`) or an alias body (`global.bg.base.neutral.1`). */
const validName = (name) => validPath(name.split(/[/.]/));

// ---------------------------------------------------------------------------
// VALUE RULES
// ---------------------------------------------------------------------------

/** Figma stores every length as a unitless float32 number: the dimension groups get px, rounded. */
const DIMENSION_GROUPS = new Set(['space', 'size', 'corner-radius', 'stroke-width', 'blur']);
const round = (n) => Number(Number(n).toFixed(4));

function convert(token, segments, known) {
  const ext = token.$extensions ?? {};
  const alias = ext['com.figma.aliasData'];
  const composed = ext['com.figma.composedColor'];
  const p = validPath(segments);
  const out = {};
  let type = token.$type;
  let value = token.$value;
  const notes = [];

  if (type === 'number' && DIMENSION_GROUPS.has(p.split('.')[0])) {
    type = 'dimension';
    value = { value: round(value), unit: 'px' };
  } else if (type === 'number' && p.startsWith('opacity.')) {
    value = round(value / 100);
    notes.push(`${token.$value} % in the Figma library`);
  } else if (type === 'number' && /^(heading|body|mono)\.size\./.test(p)) {
    type = 'dimension';
    value = { value: round(value), unit: 'px' };
  } else if (type === 'number' && /^(heading|body|mono)\.weight\./.test(p)) {
    type = 'fontWeight';
  } else if (type === 'string' && /^(heading|body|mono)\.family$/.test(p)) {
    type = 'fontFamily';
  }

  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    value = `{${validName(value.slice(1, -1))}}`;
  } else if (alias) {
    const target = validName(alias.targetVariableName);
    if (known.has(target)) value = `{${target}}`;
    else notes.push(`The Figma library aliases ${alias.targetVariableSetName}: ${alias.targetVariableName}, which it does not contain; its literal value is kept`);
  } else if (composed) {
    const name = (arg) => (arg?.type === 'alias' ? validName(arg.alias.targetVariableName) : JSON.stringify(arg?.value ?? arg));
    notes.push(`${name(composed.colorArg)} at ${name(composed.opacityArg)}: the Figma library composes them, DTCG cannot, so the resulting color is written as is`);
  }

  if (type) out.$type = type;
  out.$value = value;
  const description = [token.$description, ...notes].filter(Boolean).join('. ');
  if (description) out.$description = description;
  return [p, out];
}

// ---------------------------------------------------------------------------
// Reading and writing
// ---------------------------------------------------------------------------

const read = (file) => JSON.parse(fs.readFileSync(path.join(SRC, file), 'utf8'));

function flatten(tree, prefix = [], acc = []) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith('$') || !v || typeof v !== 'object') continue;
    if ('$value' in v) acc.push([[...prefix, k], v]);
    else flatten(v, [...prefix, k], acc);
  }
  return acc;
}

/** Every path the Figma library defines, made valid: alias targets are checked against it. */
export function knownPaths() {
  return new Set(COLLECTIONS.flatMap((c) => flatten(read(c.file)).map(([s]) => validPath(s))));
}

/** The recreated tokens of one collection: [[path, token], ...] in the export order. */
export function recreate(collection, known = knownPaths()) {
  const tokens = flatten(read(collection.file)).map(([s, t]) => convert(t, s, known));
  if (!collection.overlayOf) return tokens;
  const base = new Map(flatten(read(collection.overlayOf)).map(([s, t]) => convert(t, s, known)));
  return tokens.filter(([p, t]) => JSON.stringify(t.$value) !== JSON.stringify(base.get(p)?.$value));
}

function nest(entries) {
  const root = {};
  for (const [p, token] of entries) {
    const segs = p.split('.');
    let node = root;
    for (const s of segs.slice(0, -1)) node = node[s] ??= {};
    node[segs.at(-1)] = token;
  }
  return root;
}

/** JSON with one token per line, so a file reads like a table. */
function format(node, indent = '') {
  const inner = indent + '  ';
  const entries = Object.entries(node).map(([k, v]) => {
    const isToken = v && typeof v === 'object' && '$value' in v;
    return `${inner}${JSON.stringify(k)}: ${isToken || typeof v !== 'object' ? JSON.stringify(v) : format(v, inner)}`;
  });
  return `{\n${entries.join(',\n')}\n${indent}}`;
}

function write() {
  const known = knownPaths();
  for (const c of COLLECTIONS) {
    const entries = recreate(c, known);
    const doc = { $description: `Recreated from the Figma library (${c.set}) by scripts/figma-library.mjs: same paths made valid, same values, same aliases.${c.note ? ' ' + c.note : ''} The system's own tokens live in tokens/additions/.`, ...nest(entries) };
    fs.mkdirSync(path.dirname(path.join(ROOT, c.out)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, c.out), format(doc) + '\n');
    console.log(`${c.out}: ${entries.length} tokens`);
  }
}

function report() {
  const known = knownPaths();
  let diverged = 0;
  for (const c of COLLECTIONS) {
    const want = new Map(recreate(c, known));
    const file = path.join(ROOT, c.out);
    const have = new Map(fs.existsSync(file) ? flatten(JSON.parse(fs.readFileSync(file, 'utf8'))).map(([s, t]) => [s.join('.'), t]) : []);
    const lines = [];
    for (const [p, t] of want) {
      if (!have.has(p)) lines.push(`  - ${p} (removed)`);
      else if (JSON.stringify(have.get(p).$value) !== JSON.stringify(t.$value)) lines.push(`  ~ ${p}: ${JSON.stringify(t.$value)} -> ${JSON.stringify(have.get(p).$value)}`);
    }
    for (const p of have.keys()) if (!want.has(p)) lines.push(`  + ${p} (added)`);
    diverged += lines.length;
    console.log(`${c.out}: ${lines.length ? `${lines.length} difference(s) from the export` : 'same as the export'}`);
    if (lines.length) console.log(lines.join('\n'));
  }
  console.log(diverged ? `\n${diverged} token(s) diverge from the export.` : '\nEvery recreated token still matches the export.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!available) {
    console.log(`No Figma library export in ${PATHS.rawContent}/ (it is local and never committed): nothing to compare.`);
    process.exit(0);
  }
  if (process.argv.includes('--write')) write();
  else report();
}
