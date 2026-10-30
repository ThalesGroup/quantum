#!/usr/bin/env node
/**
 * @quantum-ds/bootstrap-theme build (pnpm --filter @quantum-ds/bootstrap-theme build, also prepack).
 * Reads the Quantum tokens and specs (src/lib.mjs), checks src/mapping.mjs against them and against
 * Bootstrap's compiled CSS (src/css-index.mjs), and writes dist/ (not committed):
 *
 *   dist/quantum.css         the theme to load after bootstrap.css: Bootstrap's own custom properties
 *                            reassigned, light-dark() values, one comment per declaration naming its token
 *   dist/scss/_quantum.scss  the same decisions as Bootstrap Sass maps, and a mixin for the rest
 *   dist/quantum.scss        ready entry: @use "bootstrap/scss/bootstrap" with (…) + the mixin
 *   dist/demo.html           demo/index.html with Bootstrap, the theme and the demo files inlined
 *
 * node build.mjs --readme also rewrites the generated tables of README.md (mapping, equivalences).
 *
 * Any unknown token path, spec id or Bootstrap property fails the build (non-zero exit).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapping from './src/mapping.mjs';
import { loadQuantum, checkMapping, entryCss, normaliseEntry, entryPaths } from './src/lib.mjs';
import { indexCustomProperties, checkTargets, shadowedRules, findRule, layerOf, stripComments } from './src/css-index.mjs';

export const PKG = path.dirname(fileURLToPath(import.meta.url));
export const BOOTSTRAP = path.join(PKG, 'node_modules/bootstrap');
export const OUT = path.join(PKG, 'dist');
const ROOT_SELECTOR = ':root, :host';
const isRoot = (g) => g.selector === ROOT_SELECTOR;

const version = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8')).version;
const bootstrapVersion = JSON.parse(fs.readFileSync(path.join(BOOTSTRAP, 'package.json'), 'utf8')).version;

/** Fail with every problem at once. */
function assertClean(problems, what) {
  if (problems.length) throw new Error(`${what}:\n  - ${problems.join('\n  - ')}`);
}

/** The comment naming where a value comes from. */
function provenance(entry) {
  const e = normaliseEntry(entry);
  if (e.literal !== undefined) return `${e.rule} (Quantum foundation rule)`;
  const paths = entryPaths(e).join(' + ');
  return e.member ? `${paths} (${e.member})` : paths;
}

/** Every declaration of the mapping, resolved: [{ group, property, css, comment }]. */
export function declarations(q) {
  return mapping.groups.map((g) => ({
    group: g,
    decls: Object.entries(g.tokens).map(([property, entry]) => ({ property, entry, css: entryCss(entry, q, mapping.units).css, comment: provenance(entry) })),
  }));
}

const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');
const declLines = (decls, rename = (p) => p) => decls.map((d) => `${rename(d.property)}: ${d.css};${d.comment ? ` /* ${d.comment} */` : ''}`).join('\n');
const block = (selector, body) => `${selector} {\n${indent(body, 2)}\n}`;

/** Wrap a rule in its at-rule context (outermost first), skipping the layer, which the caller opens. */
function inContext(contexts, text) {
  return contexts.reduceRight((inner, c) => `${c} {\n${indent(inner, 2)}\n}`, text);
}

/** Every selector a group writes: its own and the `also` rules that share its Sass map. */
const selectorsOf = (g) => [g.selector, ...(g.also ?? [])];

/**
 * The rules of the theme outside the root block, in Bootstrap's order, grouped by layer, with the
 * Bootstrap rules they would shadow restated after them. `groups` is the subset written as rules;
 * `inPlace` the groups configured inside Bootstrap's own rules (the Sass maps), whose values a
 * restated rule takes instead of Bootstrap's defaults.
 */
function componentRules(groups, resolved, rules, { rename = (p) => p, revalue = (v) => v, inPlace = [] } = {}) {
  const items = [];
  const targets = [];
  for (const g of groups) {
    const decls = resolved.find((r) => r.group === g).decls;
    for (const sel of selectorsOf(g)) {
      const found = findRule(rules, sel);
      items.push({ index: found.index, layer: layerOf(found.rule), contexts: [], text: block(sel, `/* ${g.title}${sel !== g.selector ? ` (same Sass map as ${g.selector})` : ''}${g.component ? ` (Quantum ${g.component})` : ''} */\n${declLines(decls, rename)}`) });
      targets.push({ selector: sel, properties: Object.keys(g.tokens) });
    }
  }
  const themeValue = new Map();
  for (const g of inPlace) {
    const decls = resolved.find((r) => r.group === g).decls;
    for (const sel of selectorsOf(g)) for (const d of decls) themeValue.set(`${sel} ${d.property}`, d);
  }
  const shadows = shadowedRules(rules, targets);
  const byRule = new Map();
  for (const s of shadows) {
    const key = `${s.index} ${s.selectors.join(', ')}`;
    if (!byRule.has(key)) byRule.set(key, { ...s, decls: [] });
    byRule.get(key).decls.push(s);
  }
  for (const k of byRule.values()) {
    const line = (d) => {
      const own = k.selectors.length === 1 && themeValue.get(`${k.selectors[0]} ${d.property}`);
      return own ? `${rename(d.property)}: ${own.css}; /* ${own.comment} */` : `${rename(d.property)}: ${revalue(d.value)}; /* Bootstrap's value */`;
    };
    const body = `/* Restated so ${k.selectors.join(', ')} still overrides the theme's ${k.after}, as in Bootstrap */\n${k.decls.map(line).join('\n')}`;
    items.push({ index: k.index + 0.5, layer: layerOf(k.rule), contexts: k.rule.context.filter((c) => !c.startsWith('@layer')), text: block(k.selectors.join(', '), body) });
  }
  items.sort((a, b) => a.index - b.index);
  const layers = [];
  for (const it of items) {
    let l = layers.at(-1);
    if (!l || l.layer !== it.layer) layers.push((l = { layer: it.layer, texts: [] }));
    l.texts.push(inContext(it.contexts, it.text));
  }
  return { layers, shadows };
}

const layerStatement = (bootstrapCss) => stripComments(bootstrapCss).match(/@layer [\w-]+(?:, ?[\w-]+)+;/)?.[0] ?? '';

/** dist/quantum.css */
export function renderCss(q, resolved, index, bootstrapCss) {
  const root = resolved.filter((r) => isRoot(r.group));
  let rootBody = '';
  let section = '';
  for (const r of root) {
    const head = r.group.section !== section ? `\n/* ---- ${(section = r.group.section)} ---- */\n` : '';
    rootBody += `${head}/* ${r.group.title}${r.group.why ? `: ${r.group.why}` : ''} */\n${declLines(r.decls)}\n`;
  }
  const { layers } = componentRules(mapping.groups.filter((g) => !isRoot(g)), resolved, index.rules);
  return [
    `/*!\n * @quantum-ds/bootstrap-theme ${version}: the Quantum Design System theme for Bootstrap ${bootstrapVersion}.\n * Generated by build.mjs from src/mapping.mjs and @quantum-ds/tokens: do not edit.\n * Load after bootstrap.css. Only Bootstrap's own custom properties are reassigned; colors are\n * light-dark() pairs that follow Bootstrap's color-scheme (data-bs-theme="light|dark", or the system).\n * Each comment names the Quantum token (or foundation rule) the value comes from.\n */`,
    `/* Bootstrap's layer order, restated so this file can be loaded on its own without reordering them. */\n${layerStatement(bootstrapCss)}`,
    block(ROOT_SELECTOR, rootBody.trim()),
    ...layers.map((l) => (l.layer ? `${l.layer} {\n${indent(l.texts.join('\n\n'), 2)}\n}` : l.texts.join('\n\n'))),
  ].join('\n\n') + '\n';
}

// ---- Sass ---------------------------------------------------------------------------------------

/** A CSS value as a Sass map value: quoted when a top-level comma would split it into a list. */
function sassValue(css) {
  let depth = 0;
  for (const ch of css) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) return `"${css.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return css;
}

const unprefix = (s) => s.replaceAll(mapping.bootstrap.prefix, '--');
const sassKey = (k, numeric) => (numeric ? k : `"${k}"`);

/** The Sass maps of the mapping: { '$theme-colors': text, … } in first-use order, and the leftovers. */
function sassMaps(resolved) {
  const maps = new Map(); // name -> Map(key -> value or Map)
  const residualRoot = [];
  const residualGroups = [];
  const put = (name, key, value) => {
    if (!maps.has(name)) maps.set(name, new Map());
    maps.get(name).set(key, value);
  };
  for (const r of resolved) {
    const s = r.group.sass;
    if (!s) { residualGroups.push(r.group); continue; }
    for (const d of r.decls) {
      if (normaliseEntry(d.entry).sass === false) { residualRoot.push(d); continue; }
      const v = sassValue(d.css);
      if (s.key) {
        if (!maps.has(s.map)) maps.set(s.map, new Map());
        const m = maps.get(s.map);
        if (!m.has(s.key)) m.set(s.key, new Map());
        m.get(s.key).set(`"${d.property.slice(s.strip.length)}"`, v);
      } else if (s.nested) {
        const [prefix, sub] = Object.entries(s.nested).find(([p]) => d.property.startsWith(p));
        const name = d.property.slice(prefix.length);
        if (!maps.has(s.map)) maps.set(s.map, new Map());
        const m = maps.get(s.map);
        if (!m.has(`"${name}"`)) m.set(`"${name}"`, new Map());
        m.get(`"${name}"`).set(`"${sub}"`, v);
      } else if (s.strip === mapping.bootstrap.prefix) {
        put(s.map, unprefix(d.property), `${v}`);
      } else {
        put(s.map, sassKey(d.property.slice(s.strip.length), s.numericKeys), v);
      }
    }
  }
  const comments = new Map(resolved.flatMap((r) => r.decls.map((d) => [d.property, d.comment])));
  return { maps, residualRoot, residualGroups, comments };
}

function renderSassMap(m, depth = 1) {
  const pad = '  '.repeat(depth);
  const lines = [...m].map(([k, v]) => (v instanceof Map ? `${pad}${k}: ${renderSassMap(v, depth + 1)},` : `${pad}${k}: ${v},`));
  return `(\n${lines.join('\n')}\n${'  '.repeat(depth - 1)})`;
}

/** dist/scss/_quantum.scss and dist/quantum.scss */
export function renderSass(q, resolved, index) {
  const { maps, residualRoot, residualGroups } = sassMaps(resolved);
  const variables = [...maps].map(([name, m]) => `/// Bootstrap's ${name}, from the Quantum tokens.\n${name}: ${renderSassMap(m)};`).join('\n\n');
  const inPlace = mapping.groups.filter((g) => g.sass && !isRoot(g));
  const { layers } = componentRules(residualGroups, resolved, index.rules, { rename: unprefix, revalue: unprefix, inPlace });
  const rootRule = residualRoot.length
    ? block(ROOT_SELECTOR, residualRoot.map((d) => `${unprefix(d.property)}: ${d.css}; /* ${d.comment} */`).join('\n'))
    : '';
  const rules = [rootRule, ...layers.map((l) => (l.layer ? `${l.layer} {\n${indent(l.texts.join('\n\n'), 2)}\n}` : l.texts.join('\n\n')))].filter(Boolean).join('\n\n');
  const module = `// @quantum-ds/bootstrap-theme ${version}: the Quantum theme for Bootstrap ${bootstrapVersion}, as Bootstrap Sass configuration.
// Generated by build.mjs from src/mapping.mjs and @quantum-ds/tokens: do not edit.
//
// Pass the maps to Bootstrap, then include the rules no Bootstrap map can hold:
//
//   @use "@quantum-ds/bootstrap-theme/dist/scss/quantum" as quantum;
//   @use "bootstrap/scss/bootstrap" with (
//     $theme-colors: quantum.$theme-colors,
//     …every map below…
//   );
//   @include quantum.rules;
//
// or use the ready entry @quantum-ds/bootstrap-theme/dist/quantum.scss. Bootstrap's Sass writes its custom
// properties without the --bs- prefix (bootstrap.css gets it from a PostCSS step): the rules below are
// unprefixed too, so they match whatever your build does.

${variables}

/// The decisions no Bootstrap map can hold: modifier and state rules, written in Bootstrap's layers.
@mixin rules {
${indent(rules, 2)}
}
`;
  const entry = `// @quantum-ds/bootstrap-theme ${version}: Bootstrap ${bootstrapVersion} configured with the Quantum theme.
// Generated by build.mjs: do not edit. Compile with node_modules on the load path, e.g.
//   sass --load-path=node_modules node_modules/@quantum-ds/bootstrap-theme/dist/quantum.scss out.css
@use "scss/quantum";
@use "bootstrap/scss/bootstrap" with (
${[...maps.keys()].map((n) => `  ${n}: quantum.${n},`).join('\n')}
);

@include quantum.rules;
`;
  return { module, entry, maps: [...maps.keys()] };
}

// ---- Demo ---------------------------------------------------------------------------------------

const componentName = (q, id) => q.specs.get(id)?.name ?? id;
const cls = (c) => (c === '' ? 'default' : c === null ? 'none' : c);

/** The note under a demo section: the Quantum components it shows and their Bootstrap classes. */
export function equivalenceNote(ids, q) {
  if (!ids.length || ids.includes('none')) return 'No Quantum component: Bootstrap\'s own component, themed through the root tokens only.';
  return ids.map((id) => {
    const eq = mapping.equivalences.find((e) => e.component === id);
    if (!eq) throw new Error(`demo/index.html names "${id}", which has no equivalence in src/mapping.mjs`);
    if (!eq.bootstrap) return `Quantum ${componentName(q, id)}: no Bootstrap equivalent. ${eq.why ?? ''}`.trim();
    const props = Object.entries(eq.options ?? {}).map(([p, o]) => `${p} ${Object.keys(o).join('/')} = ${Object.values(o).map(cls).join(' / ')}`);
    const combos = (eq.combinations ?? []).map((c) => `${Object.values(c.when).join(' + ')} = ${c.classes}`);
    return `Quantum ${componentName(q, id)} = Bootstrap ${eq.bootstrap}${eq.base ? ` (${eq.base})` : ''}${props.length ? `: ${props.join('; ')}` : ''}${combos.length ? `; ${combos.join('; ')}` : ''}.`;
  }).join(' ');
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Bootstrap's bundle is an ES module ending in `export { … };`: expose the same names as window.bootstrap. */
export function globaliseBundle(js) {
  const m = js.match(/export\s*\{([^}]*)\};?\s*(\/\/# sourceMappingURL=.*)?\s*$/);
  if (!m) throw new Error('bootstrap.bundle.js: no trailing export { … } to expose as window.bootstrap');
  const names = m[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [local, exported = local] = s.split(/\s+as\s+/);
    return `${exported}: ${local}`;
  });
  return `${js.slice(0, m.index)}window.bootstrap = { ${names.join(', ')} };\n`;
}

/** dist/demo.html from demo/index.html: every data-inline link and script inlined, the notes filled. */
export function renderDemo(q, themeCss) {
  const dir = path.join(PKG, 'demo');
  let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const read = (href) => {
    const file = path.resolve(dir, href);
    if (path.resolve(file) === path.join(OUT, 'quantum.css')) return themeCss;
    const text = fs.readFileSync(file, 'utf8');
    return file.endsWith('bootstrap.bundle.js') ? globaliseBundle(text) : text;
  };
  const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  html = html.replace(/<link\b[^>]*\bdata-inline\b[^>]*>/g, (tag) => {
    const id = attr(tag, 'id');
    const css = read(attr(tag, 'href')).replace(/\/\*# sourceMappingURL=.*?\*\//g, '').replace(/<\/style/gi, '<\\/style');
    return `<style${id ? ` id="${id}"` : ''}>\n${css}\n</style>`;
  });
  html = html.replace(/<script\b[^>]*\bdata-inline\b[^>]*><\/script>/g, (tag) => {
    const type = attr(tag, 'type');
    const js = read(attr(tag, 'src')).replace(/\/\/# sourceMappingURL=.*$/gm, '').replace(/<\/script/gi, '<\\/script');
    return `<script${type ? ` type="${type}"` : ''}>\n${js}\n</script>`;
  });
  html = html.replace(/<p class="demo-note" data-equivalence="([^"]*)"><\/p>/g, (_, ids) => `<p class="demo-note" data-equivalence="${ids}">${escapeHtml(equivalenceNote(ids.split(/\s+/).filter(Boolean), q))}</p>`);
  const left = html.match(/<(link|script)\b[^>]*\bdata-inline\b[^>]*>/);
  if (left) throw new Error(`demo/index.html: could not inline ${left[0]}`);
  return html;
}

// ---- README tables -----------------------------------------------------------------------------

const md = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const code = (s) => `\`${s}\``;

/** The mapping table of the README: one table per section, every Bootstrap token and its source. */
export function mappingTable(q) {
  const out = [];
  let section = null;
  for (const g of mapping.groups) {
    if (g.section !== section) {
      section = g.section;
      out.push(`\n#### ${section}\n`);
    }
    const where = g.selector === ROOT_SELECTOR ? 'root' : code(g.selector) + (g.also ? ` (and ${g.also.map(code).join(', ')})` : '');
    out.push(`${g.title}, on ${where}${g.sass ? `; Sass ${code(g.sass.map)}` : '; Sass: written after the @use'}.${g.why ? ` ${md(g.why)}` : ''}\n`);
    out.push('| Bootstrap | ← Quantum | Light / dark | Why |\n| --- | --- | --- | --- |');
    for (const [prop, entry] of Object.entries(g.tokens)) {
      const e = normaliseEntry(entry);
      const v = entryCss(e, q, mapping.units);
      const source = e.literal !== undefined ? `${code(e.literal)} (rule ${code(e.rule)})` : e.template ? code(e.template.replace(/, -apple-system.*|, ui-monospace.*/, ', …')) : code(e.token) + (e.member ? ` (${e.member})` : '');
      const value = v.light === v.dark ? code(v.light.length > 40 ? `${v.light.slice(0, 37)}…` : v.light) : `${code(v.light)} / ${code(v.dark)}`;
      out.push(`| ${code(prop)} | ${source} | ${value} | ${md(e.why ?? '')} |`);
    }
    out.push('');
  }
  return out.join('\n').trim();
}

/** The Quantum component <-> Bootstrap equivalence table of the README. */
export function equivalenceTable(q) {
  const rows = mapping.equivalences.map((eq) => {
    const name = componentName(q, eq.component);
    if (!eq.bootstrap) return `| ${name} (${code(eq.component)}) | none | ${md(eq.why ?? '')} |`;
    const props = Object.entries(eq.options ?? {}).map(([p, o]) => `${p}: ${Object.entries(o).map(([k, v]) => `${k} = ${v === '' ? 'default' : v === null ? 'none' : code(v)}`).join(', ')}`);
    const combos = (eq.combinations ?? []).map((c) => `${Object.entries(c.when).map(([p, o]) => `${p} ${o}`).join(' + ')} = ${code(c.classes)}`);
    const states = Object.entries(eq.states ?? {}).map(([k, v]) => `${k} = ${code(v)}`);
    const parts = Object.entries(eq.parts ?? {}).map(([k, v]) => `${k} = ${code(v)}`);
    const cells = [...props, ...combos, states.length ? `states: ${states.join(', ')}` : '', parts.length ? `parts: ${parts.join(', ')}` : '', eq.bootstrapOnly ? `Bootstrap only: ${eq.bootstrapOnly.map(code).join(', ')}` : ''].filter(Boolean);
    return `| ${name} (${code(eq.component)}) | ${eq.bootstrap}${eq.base ? ` (${code(eq.base)})` : ''} | ${md(cells.join('; '))} |`;
  });
  return `| Quantum component | Bootstrap | Options, states and parts |\n| --- | --- | --- |\n${rows.join('\n')}\n\nBootstrap components with no Quantum equivalent (themed by the root tokens only): ${mapping.bootstrapOnly.join(', ')}.`;
}

/** README.md with its generated sections replaced. */
export function renderReadme(q, readme) {
  const put = (text, name, body) => {
    const re = new RegExp(`(<!-- ${name}:start[^>]*-->)[\\s\\S]*?(<!-- ${name}:end -->)`);
    if (!re.test(text)) throw new Error(`README.md has no <!-- ${name}:start --> … <!-- ${name}:end --> section`);
    return text.replace(re, (_, a, b) => `${a}\n${body}\n${b}`);
  };
  return put(put(readme, 'mapping', mappingTable(q)), 'equivalences', equivalenceTable(q));
}

// ---- Main ---------------------------------------------------------------------------------------

export function build({ write = true } = {}) {
  const q = loadQuantum();
  assertClean(checkMapping(mapping, q), 'src/mapping.mjs does not match the Quantum tokens and specs');
  const bootstrapCss = fs.readFileSync(path.join(BOOTSTRAP, 'dist/css/bootstrap.css'), 'utf8');
  const index = indexCustomProperties(bootstrapCss);
  assertClean(checkTargets(mapping, index), `src/mapping.mjs does not match Bootstrap ${bootstrapVersion}`);
  const resolved = declarations(q);
  const css = renderCss(q, resolved, index, bootstrapCss);
  const sass = renderSass(q, resolved, index);
  const demo = renderDemo(q, css);
  if (write) {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(path.join(OUT, 'scss'), { recursive: true });
    fs.writeFileSync(path.join(OUT, 'quantum.css'), css);
    fs.writeFileSync(path.join(OUT, 'scss/_quantum.scss'), sass.module);
    fs.writeFileSync(path.join(OUT, 'quantum.scss'), sass.entry);
    fs.writeFileSync(path.join(OUT, 'demo.html'), demo);
  }
  const count = resolved.reduce((n, r) => n + r.decls.length, 0);
  return { css, sass, demo, count, groups: resolved.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.includes('--readme')) {
      const file = path.join(PKG, 'README.md');
      fs.writeFileSync(file, renderReadme(loadQuantum(), fs.readFileSync(file, 'utf8')));
      console.log('Updated the generated tables of README.md.');
    }
    const { count, groups, sass } = build();
    const rel = path.relative(process.cwd(), OUT) || '.';
    console.log(`@quantum-ds/bootstrap-theme: ${count} Bootstrap custom properties from ${groups} mapping groups.`);
    console.log(`Wrote ${rel}/quantum.css, ${rel}/quantum.scss (+ scss/_quantum.scss: ${sass.maps.join(', ')}) and ${rel}/demo.html.`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
