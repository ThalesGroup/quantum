import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRRORS, originalPath, mirrorsOf, checkMirror } from '../lib/mirrors.mjs';

const MIRROR = { component: 'icon-button', of: 'button', paths: [['icon.color.', 'label.color.'], ['container.min-width.', 'container.min-height.']], ignore: ['container.gap.*', 'label.typography.*'], own: [] };
const tok = (path, value) => ({ path, segments: path.split('.'), value });
const context = (tokens, platform = null, mode = null) => ({ platform, mode, index: { all: tokens, byPath: new Map(tokens.map((t) => [t.path, t])) } });
const semantic = [tok('text.primary', '#111'), tok('icon.primary', '{text.primary}'), tok('space.28', '28px'), tok('space.32', '32px')];
const button = [tok('button.label.color.subtle', '{text.primary}'), tok('button.container.min-height.small', '{space.28}'), tok('button.container.gap.small', '{space.28}'), tok('button.label.typography.small', 'x')];
const iconButton = (side = '{space.28}') => [tok('icon-button.icon.color.subtle', '{icon.primary}'), tok('icon-button.container.min-height.small', side), tok('icon-button.container.min-width.small', side)];

test('every mirror names its original and maps paths by prefix', () => {
  for (const m of MIRRORS) assert.ok(m.component && m.of && Array.isArray(m.paths) && Array.isArray(m.ignore) && Array.isArray(m.own));
  assert.deepEqual(mirrorsOf('button').map((m) => m.component), ['icon-button']);
  assert.deepEqual(mirrorsOf('text-field').map((m) => m.component), ['number-field', 'search-field', 'textarea']);
  assert.deepEqual(mirrorsOf('icon-button'), []);
  assert.equal(originalPath(MIRROR, 'icon.color.ghost.brand.default'), 'label.color.ghost.brand.default');
  assert.equal(originalPath(MIRROR, 'container.min-width.large'), 'container.min-height.large');
  assert.equal(originalPath(MIRROR, 'container.border-radius.large'), 'container.border-radius.large');
});

test('the same resolved values pass, through different aliases', () => {
  assert.deepEqual(checkMirror(MIRROR, [context([...semantic, ...button, ...iconButton()])]), []);
});

test('a different value fails once per token, naming the context', () => {
  const light = context([...semantic, ...button, ...iconButton('{space.32}')]);
  const problems = checkMirror(MIRROR, [light, context(light.index.all, 'ios', 'dark')]).map((p) => p.message);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /icon-button\.container\.min-height\.small is 32px but button\.container\.min-height\.small is 28px \[base\]/);
  assert.match(problems[1], /min-width\.small/);
});

test('a value that differs in one mode only fails in that mode', () => {
  const dark = [...semantic.filter((t) => t.path !== 'icon.primary'), tok('icon.primary', '#eee'), ...button, ...iconButton()];
  const problems = checkMirror(MIRROR, [context([...semantic, ...button, ...iconButton()]), context(dark, null, 'dark')]).map((p) => p.message);
  assert.deepEqual(problems.length, 1);
  assert.match(problems[0], /icon-button\.icon\.color\.subtle .*\[base \/ dark\]/);
});

test('tokens without a counterpart fail, unless the original lists them in ignore', () => {
  const extraMirror = [...iconButton(), tok('icon-button.container.box-shadow', 'none')];
  const extraOriginal = [...button, tok('button.container.box-shadow', 'none'), tok('button.container.gap.large', '{space.32}')];
  const problems = checkMirror(MIRROR, [context([...semantic, ...extraOriginal, ...extraMirror.filter((t) => !t.path.endsWith('box-shadow'))])]).map((p) => p.message);
  assert.deepEqual(problems, ['button.container.box-shadow has no counterpart in icon-button: add the token, or list it in ignore (scripts/lib/mirrors.mjs) when it places what icon-button lacks']);
  const reverse = checkMirror(MIRROR, [context([...semantic, ...button, ...extraMirror])]).map((p) => p.message);
  assert.deepEqual(reverse, ['icon-button.container.box-shadow has no counterpart button.container.box-shadow in button: add the token to button, or list it in own (scripts/lib/mirrors.mjs) when it places what button lacks']);
});

test('own lists what only the mirror has: not compared, never hiding a token the original has', () => {
  const withOwn = { ...MIRROR, own: ['icon.glyph.*', 'container.box-shadow'] };
  const glyph = [tok('icon-button.icon.glyph.small', '{space.28}'), tok('icon-button.icon.glyph.large', '{space.32}'), tok('icon-button.container.box-shadow', 'none')];
  // Own tokens of the mirror need no counterpart, whatever their value.
  assert.deepEqual(checkMirror(withOwn, [context([...semantic, ...button, ...iconButton(), ...glyph])]), []);
  // An own token the original also has is compared again: listing it is an error.
  const both = checkMirror(withOwn, [context([...semantic, ...button, tok('button.container.box-shadow', 'none'), ...iconButton(), ...glyph])]).map((p) => p.message);
  assert.deepEqual(both, ['icon-button.container.box-shadow is listed in own (scripts/lib/mirrors.mjs) but button has button.container.box-shadow: drop it from own so the two are compared', 'button.container.box-shadow has no counterpart in icon-button: add the token, or list it in ignore (scripts/lib/mirrors.mjs) when it places what icon-button lacks']);
  // A pattern that matches nothing is stale.
  const stale = checkMirror({ ...MIRROR, own: ['icon.glyph.*'] }, [context([...semantic, ...button, ...iconButton()])]).map((p) => p.message);
  assert.deepEqual(stale, ['own "icon.glyph.*" of icon-button (scripts/lib/mirrors.mjs) matches no token: remove it']);
  // The shared tokens of a mirror with own tokens are still compared.
  const differ = checkMirror(withOwn, [context([...semantic, ...button, ...iconButton('{space.32}'), ...glyph])]).map((p) => p.message);
  assert.equal(differ.length, 2);
  assert.match(differ[0], /min-height\.small is 32px but button\.container\.min-height\.small is 28px/);
});

test('differs lists what both have but the mirror sets on purpose: not compared, never without a counterpart', () => {
  const withDiffers = { ...MIRROR, differs: ['container.gap.*'] };
  const gap = (v) => tok('icon-button.container.gap.small', v);
  // A different value is accepted for a differs token, the rest is still compared.
  assert.deepEqual(checkMirror({ ...withDiffers, ignore: ['label.typography.*'] }, [context([...semantic, ...button, ...iconButton(), gap('{space.32}')])]), []);
  const still = checkMirror({ ...withDiffers, ignore: ['label.typography.*'] }, [context([...semantic, ...button, ...iconButton('{space.32}'), gap('{space.32}')])]).map((p) => p.message);
  assert.equal(still.length, 2);
  assert.match(still[0], /min-height\.small is 32px/);
  // Without a counterpart it belongs in own.
  const lone = checkMirror({ ...MIRROR, differs: ['icon.glyph.*'] }, [context([...semantic, ...button, ...iconButton(), tok('icon-button.icon.glyph.small', '{space.28}')])]).map((p) => p.message);
  assert.deepEqual(lone, ['icon-button.icon.glyph.small is listed in differs (scripts/lib/mirrors.mjs) but button has no button.icon.glyph.small: list it in own when it places what button lacks']);
  // A pattern that matches nothing is stale.
  const stale = checkMirror({ ...MIRROR, differs: ['icon.glyph.*'] }, [context([...semantic, ...button, ...iconButton()])]).map((p) => p.message);
  assert.deepEqual(stale, ['differs "icon.glyph.*" of icon-button (scripts/lib/mirrors.mjs) matches no token: remove it']);
});

test('a mirror without an own list still works', () => {
  const { own, ...noOwn } = MIRROR;
  assert.deepEqual(checkMirror(noOwn, [context([...semantic, ...button, ...iconButton()])]), []);
});

test('the field family: each mirror is the Text field with its own tokens and its missing parts declared', () => {
  const byId = Object.fromEntries(MIRRORS.map((m) => [m.component, m]));
  assert.deepEqual(byId['number-field'].own.concat(byId['number-field'].ignore), []);
  assert.deepEqual(byId['textarea'].own, []);
  // Its block padding is larger than the field's minimum on purpose (decisions rows-and-resize, grows-with-text-size).
  assert.deepEqual(byId['textarea'].differs, ['control.padding-block.*']);
  // No leading icon in a multi-line field, and no shortest input line: a textarea scrolls inside its padding (value-line-not-clipped).
  assert.deepEqual(byId['textarea'].ignore, ['icon.*', 'control.padding-inline-start.*', 'control.line-height']);
  // The search glyph is the Text field's leading icon: compared like the rest.
  assert.deepEqual(byId['search-field'].own, []);
  // Its severities are the Text field's (#103 step 26): only the read-only fill has no counterpart.
  assert.deepEqual(byId['search-field'].ignore, ['control.background.readonly']);
  // The Select is not mirrored yet (it comes with the complex controls).
  assert.equal(byId.select, undefined);
  const field = [tok('space.8', '8px'), tok('space.28', '28px'), tok('text-field.control.padding-inline.small', '{space.8}'), tok('text-field.control.border-color.error', '{space.8}'), tok('text-field.message.color.error', '{space.8}'), tok('text-field.control.background.readonly', '{space.8}'), tok('text-field.control.padding-inline-start.small', '{space.28}'), tok('text-field.icon.size.small', '{space.8}')];
  const search = [tok('search-field.control.padding-inline.small', '{space.8}'), tok('search-field.control.border-color.error', '{space.8}'), tok('search-field.message.color.error', '{space.8}'), tok('search-field.control.padding-inline-start.small', '{space.28}'), tok('search-field.icon.size.small', '{space.8}')];
  assert.deepEqual(checkMirror(byId['search-field'], [context([...field, ...search])]), []);
  const wider = search.map((t) => (t.path === 'search-field.control.padding-inline.small' ? tok(t.path, '{space.28}') : t));
  assert.match(checkMirror(byId['search-field'], [context([...field, ...wider])])[0].message, /search-field\.control\.padding-inline\.small is 28px but text-field\.control\.padding-inline\.small is 8px/);
});

test('colors and lengths read as hex and px', () => {
  const color = (hex, alpha = 1) => ({ colorSpace: 'srgb', components: [0, 0, 0], alpha, hex });
  const ctx = context([tok('button.label.color.subtle', color('#0E0D0D')), tok('icon-button.icon.color.subtle', color('#B6B4B4', 0.1)), tok('button.container.min-height.small', { value: 28, unit: 'px' }), tok('icon-button.container.min-height.small', { value: 28, unit: 'px' }), tok('icon-button.container.min-width.small', { value: 28, unit: 'px' })]);
  assert.deepEqual(checkMirror(MIRROR, [ctx]).map((p) => p.message), ['icon-button.icon.color.subtle is #B6B4B4 at 10 % but button.label.color.subtle is #0E0D0D [base]: icon-button renders the same as button']);
});

test('a component without tokens is reported', () => {
  assert.match(checkMirror(MIRROR, [context([...semantic, ...button])])[0].message, /icon-button has no tokens/);
});
