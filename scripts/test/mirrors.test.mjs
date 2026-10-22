import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRRORS, originalPath, mirrorsOf, checkMirror } from '../lib/mirrors.mjs';

const MIRROR = { component: 'icon-button', of: 'button', paths: [['icon.color.', 'label.color.'], ['container.min-width.', 'container.min-height.']], ignore: ['container.gap.*', 'label.typography.*'] };
const tok = (path, value) => ({ path, segments: path.split('.'), value });
const context = (tokens, platform = null, mode = null) => ({ platform, mode, index: { all: tokens, byPath: new Map(tokens.map((t) => [t.path, t])) } });
const semantic = [tok('text.primary', '#111'), tok('icon.primary', '{text.primary}'), tok('space.28', '28px'), tok('space.32', '32px')];
const button = [tok('button.label.color.subtle', '{text.primary}'), tok('button.container.min-height.small', '{space.28}'), tok('button.container.gap.small', '{space.28}'), tok('button.label.typography.small', 'x')];
const iconButton = (side = '{space.28}') => [tok('icon-button.icon.color.subtle', '{icon.primary}'), tok('icon-button.container.min-height.small', side), tok('icon-button.container.min-width.small', side)];

test('every mirror names its original and maps paths by prefix', () => {
  for (const m of MIRRORS) assert.ok(m.component && m.of && Array.isArray(m.paths) && Array.isArray(m.ignore));
  assert.deepEqual(mirrorsOf('button').map((m) => m.component), ['icon-button']);
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
  assert.deepEqual(reverse, ['icon-button.container.box-shadow has no counterpart button.container.box-shadow in button']);
});

test('colors and lengths read as hex and px', () => {
  const color = (hex, alpha = 1) => ({ colorSpace: 'srgb', components: [0, 0, 0], alpha, hex });
  const ctx = context([tok('button.label.color.subtle', color('#0E0D0D')), tok('icon-button.icon.color.subtle', color('#B6B4B4', 0.1)), tok('button.container.min-height.small', { value: 28, unit: 'px' }), tok('icon-button.container.min-height.small', { value: 28, unit: 'px' }), tok('icon-button.container.min-width.small', { value: 28, unit: 'px' })]);
  assert.deepEqual(checkMirror(MIRROR, [ctx]).map((p) => p.message), ['icon-button.icon.color.subtle is #B6B4B4 at 10 % but button.label.color.subtle is #0E0D0D [base]: icon-button renders the same as button']);
});

test('a component without tokens is reported', () => {
  assert.match(checkMirror(MIRROR, [context([...semantic, ...button])])[0].message, /icon-button has no tokens/);
});
