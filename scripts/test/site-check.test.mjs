import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSiteCss, checkSiteMarkup, implicitRole } from '../lib/site-check.mjs';

const vars = {
  semantic: new Set(['--color-text-default', '--color-surface-default', '--text-body-sm-font-size', '--radius-surface-md', '--border-width-divider']),
  raw: new Set(['--color-brand-light-600', '--space-8']),
  component: new Set(['--button-container-background-accent-neutral-default']),
};
const messages = (css) => checkSiteCss(css, vars).map((p) => p.message);
const clean = (css) => assert.deepEqual(messages(css), []);
const flags = (css, pattern) => assert.ok(messages(css).some((m) => pattern.test(m)), `${css} -> ${JSON.stringify(messages(css))}`);

test('semantic tokens, site layout variables and keywords pass', () => {
  clean('.a { color: var(--color-text-default); background: var(--color-surface-default); }');
  clean(':root { --site-header: 52px; } .a { height: var(--site-header); padding: 0.5rem 1rem; }');
  clean('.a { font: inherit; font-size: var(--text-body-sm-font-size); font-weight: inherit; }');
  clean('.a { border: var(--border-width-divider) solid transparent; border-radius: var(--radius-surface-md); outline: none; }');
  clean('.a { background: color-mix(in srgb, var(--color-surface-default) 12%, transparent); white-space: nowrap; }');
  clean('/* #fff in a comment */ .a { color: currentColor; }');
});

test('literal colors fail, in declarations and custom properties', () => {
  flags('.a { color: #18181b; }', /literal color/);
  flags('.a { background: rgba(0, 0, 0, 0.1); }', /literal color/);
  flags(':root { --site-bg: light-dark(#fff, #000); }', /literal color/);
  flags('.a { border-color: white; }', /literal color/);
});

test('literal typography, border widths, radii and outlines fail', () => {
  flags('.a { font-size: 0.85rem; }', /literal font-size/);
  flags('.a { font-family: Inter, sans-serif; }', /literal font-family/);
  flags('.a { font-weight: 620; }', /literal font-weight/);
  flags('.a { font: 500 14px Inter; }', /font shorthand/);
  flags('.a { border: 1px solid var(--color-text-default); }', /border width/);
  flags('.a { border-bottom-width: 2px; }', /border width/);
  flags('.a { border-radius: 10px; }', /radius/);
  flags('.a { outline: 2px solid var(--color-text-default); }', /outline width/);
});

test('raw, component and unknown variables fail', () => {
  flags('.a { color: var(--color-brand-light-600); }', /raw token/);
  flags('.a { background: var(--button-container-background-accent-neutral-default); }', /render the component/);
  flags('.a { color: var(--colour-text); }', /neither a semantic token/);
});

test('implicit roles of native elements', () => {
  assert.equal(implicitRole('button', ' type="button"'), 'button');
  assert.equal(implicitRole('a', ' href="/x"'), 'link');
  assert.equal(implicitRole('a', ' name="x"'), null);
  assert.equal(implicitRole('input', ' type="checkbox"'), 'checkbox');
  assert.equal(implicitRole('input', ' type="search" class="x"'), 'searchbox');
  assert.equal(implicitRole('input', ' name="q"'), 'textbox');
  assert.equal(implicitRole('select', ' name="x"'), 'combobox');
  assert.equal(implicitRole('select', ' multiple'), 'listbox');
});

const components = [
  { id: 'button', name: 'Button', element: 'button', role: 'button', rootClass: 'ds-button' },
  { id: 'icon-button', name: 'Icon button', element: 'button', role: 'button', rootClass: 'ds-icon-button' },
  { id: 'select', name: 'Select', element: 'select', role: 'combobox', rootClass: 'ds-select', roleClass: 'ds-select__control' },
  { id: 'breadcrumb', name: 'Breadcrumb', element: 'nav', role: 'navigation', rootClass: 'ds-breadcrumb' },
];

test('a native control a component covers must be that component', () => {
  const problems = checkSiteMarkup('<p>\n<button type="button" class="site-copy">Copy</button></p>', components);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].line, 2);
  assert.match(problems[0].message, /Button \(button\), Icon button \(icon-button\)/);
  assert.equal(checkSiteMarkup('<select data-mode-switch={attribute}>', components).length, 1);
});

test('the component itself, other roles and uncovered elements pass', () => {
  assert.deepEqual(checkSiteMarkup('<button type="button" class="ds-button" data-size="small">Copy</button>', components), []);
  assert.deepEqual(checkSiteMarkup('<button class={`ds-icon-button ${x}`}>', components), []);
  assert.deepEqual(checkSiteMarkup('<button type="button" role="tab" class="site-explorer__tab" aria-selected={i === 0 ? "true" : "false"}>', components), []);
  assert.deepEqual(checkSiteMarkup('<select class="ds-select__control" name="x">', components), []);
  assert.deepEqual(checkSiteMarkup('<select multiple>', components), []);
  assert.deepEqual(checkSiteMarkup('<input type="checkbox" />', components), []);
  assert.deepEqual(checkSiteMarkup('<button>', []), []);
  // A landmark component does not claim every element with its role.
  assert.deepEqual(checkSiteMarkup('<nav class="site-tabs" aria-label="Sections">', components), []);
});
