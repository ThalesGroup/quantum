import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classNames, screenComponents, checkSections, checkSource, checkScreenMeta, checkScreenHtml, checkScreenSource, checkScreensCssSelectors, definedScreenClasses, loadScreens } from '../lib/screens.mjs';
import { checkSiteCss, checkSiteMarkup } from '../lib/site-check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const errors = (problems) => problems.filter((p) => p.level === 'error').map((p) => p.message);
const screen = (html, extra = {}) => ({ id: 'acme/login', source: 'acme', block: 'login', file: 'screens/acme/login.screen.mjs', html, meta: null, ...extra });
const VIEWPORT = '<div class="scr-viewport"><div class="scr-screen">';

test('components are found by their root class only', () => {
  const html = '<div class="ds-icon-button"><span class="ds-icon-button__icon"></span></div><span class="ds-badge x"></span>';
  assert.deepEqual([...classNames(html)], ['ds-icon-button', 'ds-icon-button__icon', 'ds-badge', 'x']);
  assert.deepEqual(screenComponents(html, ['badge', 'icon', 'icon-button']), ['badge', 'icon-button']);
});

test('sections need unique kebab ids, names and descriptions', () => {
  assert.deepEqual(errors(checkSections([{ id: 'login', name: 'Login', description: 'Sign in.' }])), []);
  assert.equal(errors(checkSections([{ id: 'login', name: 'Login', description: 'x' }, { id: 'login', name: 'Again', description: 'y' }])).length, 1);
  assert.equal(errors(checkSections([{ id: 'Log In', name: 'Login' }])).length, 2);
});

test('a source records its links, commit and licence, with the licence file', () => {
  const source = {
    dir: 'screens/acme', id: 'acme', name: 'Acme', description: 'Blocks.', url: 'https://acme.test', repository: 'https://github.com/acme/ui', commit: '0123abc',
    license: { id: 'MIT', name: 'MIT License', url: 'https://acme.test/LICENSE', copyright: 'Copyright (c) 2023 Acme', file: 'LICENSE.md' },
    changes: ['Rebuilt with the design system.'],
  };
  assert.deepEqual(errors(checkSource(source)), []);
  assert.ok(errors(checkSource(source, { exists: () => false })).some((m) => /license.file/.test(m)));
  assert.ok(errors(checkSource({ ...source, id: 'other', license: { ...source.license, copyright: '' } })).length >= 2);
});

test('screen meta: block = file name, a known section, changes and gaps', () => {
  const meta = { block: 'login', name: 'Login', section: 'login', description: 'A login page.', changes: [], gaps: [{ text: 'No Link', issues: [91] }] };
  assert.deepEqual(errors(checkScreenMeta(screen('', { meta }), new Set(['login']))), []);
  assert.equal(errors(checkScreenMeta(screen('', { meta: { ...meta, block: 'signup', section: 'nope' } }), new Set(['login']))).length, 2);
  assert.ok(errors(checkScreenMeta(screen('', { meta: { ...meta, gaps: [{ text: 'x', issues: ['#91'] }] } }), new Set(['login']))).length);
  assert.ok(errors(checkScreenMeta(screen(''), new Set())).some((m) => /export meta/.test(m)));
});

test('screen HTML: root, unique ids, no literal color, data-only styles, known classes', () => {
  const defined = new Set(['scr-viewport', 'scr-screen', 'scr-chart']);
  const ok = `${VIEWPORT}<span class="ds-badge" data-color="current"></span><svg class="scr-chart" fill="none" style="--scr-value: 40%"></svg></div></div>`;
  assert.deepEqual(errors(checkScreenHtml(screen(ok), { definedClasses: defined, components: ['badge'] })), []);
  assert.ok(errors(checkScreenHtml(screen('<main></main>'), {})).some((m) => /screen\(/.test(m)));
  assert.ok(errors(checkScreenHtml(screen(`${VIEWPORT}<i id="a"></i><b id="a"></b>`))).some((m) => /appears 2 times/.test(m)));
  assert.ok(errors(checkScreenHtml(screen(`${VIEWPORT}<path fill="#ff0000"/>`))).some((m) => /literal color/.test(m)));
  assert.ok(errors(checkScreenHtml(screen(`${VIEWPORT}<p style="color: var(--x)"></p>`))).some((m) => /style attribute/.test(m)));
  assert.ok(errors(checkScreenHtml(screen(`${VIEWPORT}<p class="scr-nope btn"></p>`), { definedClasses: defined })).length === 2);
  assert.ok(checkScreenHtml(screen(VIEWPORT), {}).some((p) => p.level === 'warn' && /no design system component/.test(p.message)));
});

test('screen sources never write a ds-* class; screens.css never selects one', () => {
  assert.deepEqual(errors(checkScreenSource("import { ds } from '../lib/ds.mjs';\nds.button({ label: 'Go' }); // ds-button comes from the template", 'a.mjs')), []);
  assert.equal(errors(checkScreenSource("el('button', { class: 'ds-button' })", 'a.mjs')).length, 1);
  assert.deepEqual(errors(checkScreensCssSelectors('.scr-form > * { gap: 1rem } .scr-chart:has(input:checked) .scr-plot { display: grid }', 'screens.css')), []);
  assert.equal(errors(checkScreensCssSelectors('.scr-form .ds-button { inline-size: 100% }', 'screens.css')).length, 1);
  assert.deepEqual([...definedScreenClasses('.scr-a, .scr-b:hover > .scr-c__d { color: red } /* .scr-no */')], ['scr-a', 'scr-b', 'scr-c__d']);
});

test('screens.css follows the site rules with its own --scr-* variables', () => {
  const vars = { semantic: new Set(['--space-8']), raw: new Set(['--brand-light-600']), component: new Set(['--button-container-gap']) };
  assert.deepEqual(checkSiteCss('.a { --scr-x: 2rem; gap: var(--space-8); inline-size: var(--scr-x); }', vars, { own: /^--(scr-|_)/, who: 'screens.css' }), []);
  assert.ok(checkSiteCss('.a { color: var(--brand-light-600); }', vars, { own: /^--(scr-|_)/, who: 'screens.css' })[0].message.includes('screens.css reads semantic tokens only'));
  assert.ok(checkSiteCss('.a { gap: var(--site-gap); }', vars, { own: /^--(scr-|_)/, who: 'screens.css' }).length === 1);
});

test('rendered HTML: a control carrying a component part class is that component', () => {
  const components = [{ id: 'button', name: 'Button', element: 'button', role: 'button', rootClass: 'ds-button' }, { id: 'dropdown', name: 'Dropdown', element: 'button', role: 'button', rootClass: 'ds-dropdown', roleClass: 'ds-dropdown__trigger' }];
  const item = '<button type="button" class="ds-dropdown__item" data-part="item">Edit</button>';
  assert.equal(checkSiteMarkup(item, components).length, 1);
  assert.deepEqual(checkSiteMarkup(item, components, { parts: true }), []);
  assert.equal(checkSiteMarkup('<button class="scr-fake">Go</button>', components, { parts: true }).length, 1);
});

test('the repository screens load and render', async () => {
  const data = await loadScreens(root);
  assert.deepEqual(errors(data.problems), []);
  assert.ok(data.screens.length > 0);
  for (const s of data.screens) assert.ok(s.html.startsWith('<div class="scr-viewport">'), s.file);
});
