/**
 * The shadcn theme: the mapping holds against the tokens and the specs, every documented shadcn
 * variable gets a value in every mode, the build writes the CSS and the registry item, and both
 * say the same thing. Zero dependencies: node --test packages/shadcn-theme/test/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as mapping from '../src/mapping.mjs';
import { loadQuantum, checkMapping, resolveMapping, ALLOWED_TIERS } from '../src/lib.mjs';
import { buildTheme, REGISTRY_SCHEMA } from '../build.mjs';

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quantum = loadQuantum();

/** shadcn's theme variables (https://ui.shadcn.com/docs/theming), on :root and .dark. */
const DOCUMENTED = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
];
/** What shadcn's components read from `@theme inline` beyond the colors. */
const THEME_READ = ['font-sans', 'font-mono', 'radius-sm', 'radius-md', 'radius-lg', 'radius-xl'];
const REGISTRY_TYPES = ['registry:lib', 'registry:block', 'registry:component', 'registry:ui', 'registry:hook', 'registry:theme', 'registry:page', 'registry:file', 'registry:style', 'registry:base', 'registry:font', 'registry:item'];

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'quantum-shadcn-'));
const built = buildTheme({ outDir: out, quantum });

/** The declarations of one block of the generated CSS: name -> { value, comment }. */
function block(css, selector) {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `quantum.css has a ${selector} block`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start));
  const decls = {};
  for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);(?:\s*\/\*\s*(.*?)\s*\*\/)?/g)) decls[m[1]] = { value: m[2].trim(), comment: m[3] ?? null };
  return decls;
}

test('the mapping names existing semantic or component tokens and existing spec ids', () => {
  assert.deepEqual(checkMapping(mapping, quantum), []);
  for (const group of [mapping.VARIABLES, mapping.THEME]) {
    for (const [name, e] of Object.entries(group)) {
      const t = quantum.light.get(e.token);
      assert.ok(t, `${name}: ${e.token} exists`);
      assert.ok(ALLOWED_TIERS.includes(t.tier), `${name}: ${e.token} is ${t.tier}`);
    }
  }
});

test('the mapping check refuses unknown tokens, raw tokens and unknown spec ids', () => {
  const bad = {
    VARIABLES: { background: { token: 'global.bg.nope' }, foreground: { token: 'brand.light.600' } },
    THEME: {},
    COMPONENTS: [
      { quantum: 'button', configs: [{ set: { emphasis: 'loud' } }, { set: { tone: 'x' } }, { state: 'pressed' }, { part: 'halo' }, { set: { disabled: 'yes' } }] },
      { quantum: 'carousel', configs: [] },
    ],
  };
  const problems = checkMapping(bad, quantum);
  for (const needle of ['unknown Quantum token "global.bg.nope"', '"brand.light.600" is a raw token', 'no option "loud"', 'no property "tone"', 'no state "pressed"', 'no part "halo"', 'is a boolean', 'no Quantum component "carousel"']) {
    assert.ok(problems.some((p) => p.includes(needle)), `reports ${needle}: ${problems.join(' | ')}`);
  }
  assert.throws(() => resolveMapping(bad, quantum), /does not match the Quantum tokens and specs/);
});

test('every documented shadcn variable is defined in light and dark, and the theme variables shadcn reads', () => {
  for (const name of DOCUMENTED) {
    assert.ok(built.theme.light[name]?.value, `--${name} in light`);
    assert.ok(built.theme.dark[name]?.value, `--${name} in dark`);
  }
  assert.ok(built.theme.light.radius?.value, '--radius on :root');
  for (const name of THEME_READ) assert.ok(built.theme.theme[name]?.value, `--${name} in @theme inline`);
});

test('dark values come from the dark mode and fall back to the light value', () => {
  for (const [name, e] of Object.entries(built.theme.dark)) {
    const token = mapping.VARIABLES[name].token;
    assert.equal(e.value, quantum.dark.get(token).value, `--${name}`);
  }
  assert.equal(built.theme.light.primary.value, quantum.light.get('global.bg.accent.brand.default').value);
  assert.notEqual(built.theme.dark.background.value, built.theme.light.background.value, 'the page surface changes in dark');
});

test('the build writes quantum.css and quantum.json', () => {
  for (const f of ['quantum.css', 'quantum.json']) assert.ok(fs.statSync(path.join(out, f)).size > 0, f);
});

test('quantum.css: every declaration names its token, and @theme inline bridges every color', () => {
  const css = fs.readFileSync(path.join(out, 'quantum.css'), 'utf8');
  const root = block(css, ':root');
  const dark = block(css, '.dark');
  const theme = block(css, '@theme inline');
  for (const [decls, source] of [[root, built.theme.light], [dark, built.theme.dark]]) {
    assert.deepEqual(Object.keys(decls).sort(), Object.keys(source).sort());
    for (const [name, d] of Object.entries(decls)) {
      assert.equal(d.value, source[name].value, `--${name}`);
      assert.ok(d.comment?.startsWith(mapping.VARIABLES[name].token), `--${name} carries /* ${mapping.VARIABLES[name].token} */`);
    }
  }
  for (const name of DOCUMENTED) assert.equal(theme[`color-${name}`]?.value, `var(--${name})`, `--color-${name}`);
  for (const [name, e] of Object.entries(mapping.THEME)) {
    assert.equal(theme[name]?.value, built.theme.theme[name].value, `--${name}`);
    assert.ok(theme[name].comment?.startsWith(e.token), `--${name} carries /* ${e.token} */`);
  }
});

test('quantum.json is a registry theme item whose cssVars equal the CSS', () => {
  const item = JSON.parse(fs.readFileSync(path.join(out, 'quantum.json'), 'utf8'));
  assert.equal(item.$schema, REGISTRY_SCHEMA);
  assert.equal(item.name, 'quantum');
  assert.ok(REGISTRY_TYPES.includes(item.type), item.type);
  assert.equal(item.type, 'registry:theme');
  for (const field of ['style', 'iconLibrary', 'baseColor', 'theme', 'font']) assert.ok(!(field in item), `${field} is only for registry:base or registry:font items`);
  for (const field of ['title', 'description', 'author']) assert.equal(typeof item[field], 'string', field);
  assert.deepEqual(Object.keys(item.cssVars).sort(), ['dark', 'light', 'theme']);
  for (const values of Object.values(item.cssVars)) for (const v of Object.values(values)) assert.equal(typeof v, 'string');
  const css = fs.readFileSync(path.join(out, 'quantum.css'), 'utf8');
  const values = (decls) => Object.fromEntries(Object.entries(decls).map(([n, d]) => [n, d.value]));
  assert.deepEqual(item.cssVars.light, values(block(css, ':root')));
  assert.deepEqual(item.cssVars.dark, values(block(css, '.dark')));
  const themeDecls = Object.fromEntries(Object.entries(values(block(css, '@theme inline'))).filter(([n]) => !n.startsWith('color-')));
  assert.deepEqual(item.cssVars.theme, themeDecls);
});

test('the radius scale is Quantum\'s: controls 4px, cards 8px', () => {
  assert.equal(built.theme.theme['radius-md'].value, quantum.light.get('button.container.border-radius.medium').value);
  assert.equal(built.theme.theme['radius-xl'].value, quantum.light.get('card.container.border-radius').value);
});

test('every shadcn component the mapping names is in the demo', () => {
  const names = new Set([...mapping.COMPONENTS.map((c) => c.shadcn).filter(Boolean), ...mapping.SHADCN_ONLY]);
  for (const name of names) assert.ok(fs.existsSync(path.join(PKG, 'demo/src/components/ui', `${name}.tsx`)), `demo/src/components/ui/${name}.tsx`);
  const ids = new Set(mapping.COMPONENTS.map((c) => c.quantum));
  for (const id of Object.keys(quantum.specs)) assert.ok(ids.has(id), `the mapping says what shadcn does for Quantum ${id}`);
});
