import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATHS } from '../lib/paths.mjs';
import { tierFromTrees, indexTiers, modeFromTrees, loadAll } from '../lib/dtcg.mjs';
import { checkSyntax, syntaxTheme, planSyntaxOutputs } from '../lib/syntax-theme.mjs';

const raw = { color: { $type: 'color', violet: { $value: '#7534a9' }, ink: { $value: '#0e0d0d' }, paper: { $value: '#fdfcfc' }, grey: { $value: '#4c4a4a' } }, space: { $type: 'dimension', 4: { $value: '16px' } } };
const semantic = {
  color: {
    $type: 'color',
    text: { default: { $value: '{color.ink}' } },
    surface: { $value: '{color.paper}' },
    code: { keyword: { $value: '{color.violet}' }, comment: { $value: '{color.grey}' } },
  },
  gap: { $type: 'dimension', $value: '{space.4}' },
};
const syntax = {
  output: 'dist/shiki-theme.json',
  name: 'quantum',
  foreground: 'color.text.default',
  background: 'color.surface',
  covers: 'color.code.*',
  rules: [
    { token: 'color.code.comment', scopes: ['comment', 'punctuation.definition.comment'] },
    { token: 'color.code.keyword', scopes: ['keyword', 'storage.type'] },
    { token: 'color.text.default', scopes: ['keyword.operator', 'meta.function-call entity.name.function'] },
  ],
};
const load = (cfg = syntax, css = {}) => ({
  ...indexTiers({ tiers: [{ name: 'raw', mayReference: [] }, { name: 'semantic', mayReference: ['raw'] }], css, syntax: cfg }, [tierFromTrees('raw', [raw]), tierFromTrees('semantic', [semantic])]),
  platforms: [],
  modes: [modeFromTrees('light', [], { default: true, scheme: 'light' }), modeFromTrees('dark', [], { scheme: 'dark' })],
});

test('syntaxTheme maps scopes to the CSS variables of the tokens, one theme for every mode', () => {
  const theme = syntaxTheme(load());
  assert.equal(theme.name, 'quantum');
  assert.equal(theme.type, 'light', 'the scheme of the default mode');
  assert.deepEqual(theme.colors, { 'editor.foreground': 'var(--color-text-default)', 'editor.background': 'var(--color-surface)' });
  assert.deepEqual(theme.tokenColors[1], { name: 'color.code.keyword', scope: ['keyword', 'storage.type'], settings: { foreground: 'var(--color-code-keyword)' } });
  assert.equal(syntaxTheme(load(syntax, { prefix: 'ds' })).tokenColors[0].settings.foreground, 'var(--ds-color-code-comment)', 'follows the css prefix');
});

test('planSyntaxOutputs writes the theme as JSON, and nothing without a syntax section', () => {
  const out = planSyntaxOutputs(load(), (p) => path.resolve('/repo/tokens', p));
  assert.deepEqual([...out.keys()], ['/repo/tokens/dist/shiki-theme.json']);
  assert.equal(JSON.parse(out.get('/repo/tokens/dist/shiki-theme.json')).tokenColors.length, 3);
  assert.equal(planSyntaxOutputs(load(null), (p) => p).size, 0);
  assert.deepEqual(checkSyntax(load(null)), []);
});

test('checkSyntax accepts a valid configuration', () => {
  assert.deepEqual(checkSyntax(load()), []);
});

test('checkSyntax: unknown, non-color and raw tokens, duplicate and malformed scopes, uncovered tokens', () => {
  const messages = (cfg) => checkSyntax(load(cfg)).map((p) => `${p.token}: ${p.message}`);
  assert.match(messages({ ...syntax, rules: [...syntax.rules, { token: 'color.code.nope', scopes: ['x'] }] }).join('\n'), /color\.code\.nope: syntax: rule token names an unknown token/);
  assert.match(messages({ ...syntax, foreground: 'gap' }).join('\n'), /gap: syntax: foreground must be a color token/);
  assert.match(messages({ ...syntax, background: 'color.paper' }).join('\n'), /must be a semantic token, not a raw token/);
  assert.match(messages({ ...syntax, rules: [...syntax.rules, { token: 'color.code.keyword', scopes: ['comment'] }] }).join('\n'), /scope "comment" is already mapped to color\.code\.comment/);
  assert.match(messages({ ...syntax, rules: [...syntax.rules, { token: 'color.code.keyword', scopes: ['bad..scope'] }] }).join('\n'), /is not a TextMate scope selector/);
  assert.match(messages({ ...syntax, rules: syntax.rules.slice(1) }).join('\n'), /color\.code\.comment: syntax: token matches covers "color\.code\.\*" but no rule maps a scope to it/);
});

test('the repository theme maps every code color', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const loaded = loadAll(path.join(root, PATHS.tokens));
  assert.deepEqual(checkSyntax(loaded), []);
  const [[file, text]] = planSyntaxOutputs(loaded, (p) => path.resolve(root, PATHS.tokens, p));
  assert.equal(file, path.join(root, PATHS.shikiTheme));
  assert.equal(JSON.parse(text).tokenColors.length, loaded.config.syntax.rules.length);
});
