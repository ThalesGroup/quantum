import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXT_SIZE_RULES, checkTextSizeRules } from '../lib/text-size-rules.mjs';

const typo = (path, fontSize) => [path, { path, value: { fontFamily: '{body.family}', fontSize, fontWeight: '{body.weight.regular}', lineHeight: '{font.line-height.tight}', letterSpacing: '{font.letter-spacing.normal}' } }];
const RULE = [{ token: 'text-field.control.typography', follows: 'button.label.typography', sizes: ['small', 'medium', 'large'], why: 'a field takes the Button text size' }];
const same = [
  typo('button.label.typography.small', '{body.size.sm}'), typo('button.label.typography.medium', '{body.size.md}'), typo('button.label.typography.large', '{body.size.md}'), typo('button.label.typography.xsmall', '{body.size.xs}'),
  typo('text-field.control.typography.small', '{body.size.sm}'), typo('text-field.control.typography.medium', '{body.size.md}'), typo('text-field.control.typography.large', '{body.size.md}'),
];

test('the Text field value text follows the Button label size, size for size', () => {
  assert.deepEqual(TEXT_SIZE_RULES.map((r) => [r.token, r.follows, r.sizes]), [['text-field.control.typography', 'button.label.typography', ['small', 'medium', 'large']]]);
  assert.deepEqual(checkTextSizeRules(RULE, new Map(same)), []);
});

test('a size whose font size token differs fails, naming both tokens', () => {
  const tokens = new Map([...same, typo('text-field.control.typography.large', '{body.size.lg}')]);
  const problems = checkTextSizeRules(RULE, tokens).map((p) => p.message);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /text-field\.control\.typography\.large takes font size \{?body\.size\.lg\}? but button\.label\.typography\.large takes \{?body\.size\.md\}?/);
  assert.match(problems[0], /text-field\.control\.typography\.large/);
  assert.match(problems[0], /button\.label\.typography\.large/);
});

test('only the font size is compared: weight, line height and letter spacing are the field\'s own', () => {
  const tokens = new Map(same);
  const t = tokens.get('text-field.control.typography.small');
  tokens.set(t.path, { ...t, value: { ...t.value, fontWeight: '{body.weight.medium}', lineHeight: '{font.line-height.compact}' } });
  assert.deepEqual(checkTextSizeRules(RULE, tokens), []);
});

test('a missing token or a literal font size fails', () => {
  const missing = new Map(same.filter(([p]) => p !== 'button.label.typography.small'));
  assert.match(checkTextSizeRules(RULE, missing)[0].message, /button\.label\.typography\.small does not exist/);
  const literal = new Map([...same, typo('text-field.control.typography.medium', { value: 16, unit: 'px' })]);
  assert.equal(checkTextSizeRules(RULE, literal).length, 1);
});
