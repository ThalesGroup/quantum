// Tests of @quantum-ds/bootstrap-theme: node --test packages/bootstrap-theme/test/ (zero dependencies).
// The mapping matches the Quantum tokens and specs and Bootstrap's CSS, the build writes dist/,
// and dist/quantum.css holds exactly the mapped values in light and in dark.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import mapping from '../src/mapping.mjs';
import { loadQuantum, checkMapping, entryValues, normaliseEntry } from '../src/lib.mjs';
import { indexCustomProperties, checkTargets, parseRules, findRule } from '../src/css-index.mjs';
import { build, PKG, BOOTSTRAP, OUT } from '../build.mjs';

const q = loadQuantum();
const bootstrapCss = fs.readFileSync(path.join(BOOTSTRAP, 'dist/css/bootstrap.css'), 'utf8');
const index = indexCustomProperties(bootstrapCss);
const clone = (o) => structuredClone(o);

/** The value of a CSS text under one color scheme: light-dark(a, b) -> a or b. */
function underScheme(css, scheme) {
  let out = css;
  for (;;) {
    const i = out.indexOf('light-dark(');
    if (i === -1) return out;
    let depth = 0, comma = -1, j = i + 'light-dark'.length;
    for (; j < out.length; j++) {
      if (out[j] === '(') depth++;
      else if (out[j] === ')' && --depth === 0) break;
      else if (out[j] === ',' && depth === 1 && comma === -1) comma = j;
    }
    const a = out.slice(i + 'light-dark('.length, comma).trim();
    const b = out.slice(comma + 1, j).trim();
    out = out.slice(0, i) + (scheme === 'dark' ? b : a) + out.slice(j + 1);
  }
}

test('every Quantum token path, member, spec id and foundation rule in the mapping exists', () => {
  assert.deepEqual(checkMapping(mapping, q), []);
});

test('the mapping is plain data', () => {
  const src = fs.readFileSync(path.join(PKG, 'src/mapping.mjs'), 'utf8');
  assert.doesNotMatch(src, /=>|\bfunction\b|\bimport\b/, 'src/mapping.mjs holds no logic and imports nothing');
});

test('checkMapping reports unknown tokens, raw tokens, spec options and missing equivalences', () => {
  const m = clone(mapping);
  m.groups[0].tokens['--bs-primary-bg'] = 'global.bg.accent.brand.nope';
  m.groups.find((g) => g.id === 'card').tokens['--bs-card-bg'] = 'card.container.background.level-9';
  const raw = [...q.tokens.values()].find((t) => t.tier === 'raw').path;
  m.groups.find((g) => g.id === 'surfaces').tokens['--bs-bg-1'] = [raw, 'test'];
  m.groups.find((g) => g.id === 'btn').tokens['--bs-btn-disabled-opacity'] = { literal: '1', rule: 'effects.nope' };
  const button = m.equivalences.find((e) => e.component === 'button');
  button.options.size.huge = '.btn-xl';
  delete button.options.emphasis.ghost;
  button.states.pressed = ':active';
  m.equivalences = m.equivalences.filter((e) => e.component !== 'spinner');
  const problems = checkMapping(m, q).join('\n');
  assert.match(problems, /unknown Quantum token "global\.bg\.accent\.brand\.nope"/);
  assert.match(problems, /unknown Quantum token "card\.container\.background\.level-9"/);
  assert.match(problems, /is a raw token/);
  assert.match(problems, /foundation effects has no rule "nope"/);
  assert.match(problems, /property size has no option "huge"/);
  assert.match(problems, /option emphasis=ghost is not mapped/);
  assert.match(problems, /spec has no state "pressed"/);
  assert.match(problems, /component spinner has no equivalence entry/);
});

test('every Bootstrap custom property and selector the mapping targets exists in bootstrap.css', () => {
  assert.deepEqual(checkTargets(mapping, index), []);
  const m = clone(mapping);
  m.groups.find((g) => g.id === 'card').tokens['--bs-card-renamed'] = 'card.container.padding';
  m.groups.find((g) => g.id === 'check-sm').selector = '.check-xs';
  const problems = checkTargets(m, index).join('\n');
  assert.match(problems, /neither declares nor reads --bs-card-renamed/);
  assert.match(problems, /no rule "\.check-xs"/);
});

test('the build writes the CSS theme, the Sass configuration and the demo', () => {
  const out = build();
  for (const f of ['quantum.css', 'quantum.scss', 'scss/_quantum.scss', 'demo.html']) {
    assert.ok(fs.existsSync(path.join(OUT, f)), `dist/${f}`);
  }
  assert.ok(out.count > 300);
});

const themeCss = () => fs.readFileSync(path.join(OUT, 'quantum.css'), 'utf8');

test('dist/quantum.css holds every mapped value, in light and in dark', () => {
  const rules = parseRules(themeCss());
  const value = (selector, property) => {
    let v;
    for (const r of rules) if (r.selectors.join(', ') === selector) for (const d of r.declarations) if (d.property === property) v ??= d.value;
    return v;
  };
  let checked = 0;
  for (const g of mapping.groups) {
    for (const sel of [g.selector, ...(g.also ?? [])]) {
      for (const [prop, entry] of Object.entries(g.tokens)) {
        const css = value(sel, prop);
        assert.ok(css !== undefined, `${sel} { ${prop} } is written`);
        const expected = entryValues(normaliseEntry(entry), q, mapping.units);
        assert.equal(underScheme(css, 'light'), expected.light, `${sel} ${prop} in light`);
        assert.equal(underScheme(css, 'dark'), expected.dark, `${sel} ${prop} in dark`);
        checked++;
      }
    }
  }
  assert.ok(checked > 300);
});

test('dist/quantum.css: Quantum values where the brief expects them', () => {
  const rules = parseRules(themeCss());
  const get = (selector, property) => rules.find((r) => r.selector === selector && r.declarations.some((d) => d.property === property))?.declarations.find((d) => d.property === property).value;
  assert.equal(get(':root, :host', '--bs-primary-bg'), 'light-dark(#175DD6, #9EE7FA)');
  assert.equal(get(':root, :host', '--bs-primary-contrast'), 'light-dark(#FBFCFD, #09191D)');
  assert.equal(get(':root, :host', '--bs-radius-5'), '0.25rem');
  assert.equal(get(':root, :host', '--bs-radius-7'), '0.5rem');
  assert.equal(get(':root, :host', '--bs-border-width'), '0.6px');
  assert.match(get(':root, :host', '--bs-body-font-family'), /^Inter, /);
  assert.match(get(':root, :host', '--bs-font-mono'), /^"Fragment Mono", /);
  assert.equal(get('.form-control', '--bs-control-min-height'), '2.5rem');
  assert.equal(get('.form-control', '--bs-control-border-color'), 'light-dark(#323031, #B9B7B7)');
  assert.equal(get('.card', '--bs-card-border-radius'), '0.5rem');
  assert.equal(get('.card', '--bs-card-bg'), 'light-dark(#F7F6F6, #212121)');
});

test('dist/quantum.css uses the theming API only, each value traced to its source', () => {
  const css = themeCss();
  const rules = parseRules(css);
  for (const r of rules) {
    for (const d of r.declarations) assert.ok(d.property.startsWith('--bs-'), `${r.selector} sets ${d.property}: only Bootstrap custom properties may be set`);
    for (const s of r.selectors) assert.ok(findRule(index.rules, s) || index.rules.some((b) => b.selectors.includes(s)), `${s} is one of Bootstrap's selectors`);
  }
  const lines = css.split('\n').filter((l) => /^\s*--bs-[\w-]+:/.test(l));
  for (const l of lines) assert.match(l, /\/\* .+ \*\/\s*$/, `commented: ${l.trim()}`);
  assert.match(css, /^@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;$/m);
});

test('a size modifier Bootstrap writes after a themed base class still overrides it', () => {
  const css = themeCss();
  const at = (s) => css.indexOf(`\n  ${s} {`);
  assert.ok(at('.pagination') > 0 && at('.pagination-lg') > at('.pagination'), '.pagination-lg restated after .pagination');
  assert.ok(at('.badge-lg') > at('.badge'), '.badge-lg restated after .badge');
});

test('dist/quantum.scss passes the maps to Bootstrap and compiles with sass', (t) => {
  const entry = fs.readFileSync(path.join(OUT, 'quantum.scss'), 'utf8');
  for (const m of ['$theme-colors', '$theme-bgs', '$root-tokens', '$font-sizes', '$radii', '$spacers', '$button-tokens', '$form-control-tokens']) {
    assert.ok(entry.includes(`${m}: quantum.${m}`), m);
  }
  const sass = path.join(PKG, 'node_modules/.bin/sass');
  if (!fs.existsSync(sass)) return t.skip('sass is not installed');
  const r = spawnSync(sass, ['--load-path=node_modules', '--no-source-map', 'dist/quantum.scss'], { cwd: PKG, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /--primary-bg: light-dark\(#175DD6, #9EE7FA\)/);
  assert.match(r.stdout, /--control-min-height: 2\.5rem/);
});

test('dist/demo.html is self-contained apart from the webfonts', () => {
  const html = fs.readFileSync(path.join(OUT, 'demo.html'), 'utf8');
  assert.doesNotMatch(html, /data-inline/);
  assert.doesNotMatch(html, /<(link|script)\b[^>]*\b(href|src)="(?!https:\/\/fonts\.(googleapis|gstatic)\.com)/);
  assert.match(html, /<style id="quantum-theme">/);
  assert.match(html, /window\.bootstrap = \{/);
  assert.doesNotMatch(html, /<p class="demo-note"[^>]*><\/p>/, 'every section note is filled');
  assert.match(html, /\.btn-solid \/ \.btn-subtle \/ \.btn-text/);
});

test('the README tables are generated from the current mapping', async () => {
  const { renderReadme } = await import('../build.mjs');
  const readme = fs.readFileSync(path.join(PKG, 'README.md'), 'utf8');
  assert.equal(readme, renderReadme(q, readme), 'run node packages/bootstrap-theme/build.mjs --readme');
});
