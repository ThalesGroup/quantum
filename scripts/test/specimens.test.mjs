import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DISPLAYS, specimenTokens, checkSpecimen, uncoveredTokens, nearestFamily, easingPath } from '../lib/specimens.mjs';

const tok = (path, tier, type) => ({ path, segments: path.split('.'), tier, type });
const tokens = [
  tok('space.4', 'raw', 'dimension'),
  tok('space.8', 'raw', 'dimension'),
  tok('space.inset.sm', 'semantic', 'dimension'),
  tok('font.body.family', 'raw', 'fontFamily'),
  tok('font.body.size.md', 'raw', 'dimension'),
  tok('font.mono.family', 'raw', 'fontFamily'),
  tok('font.line-height.tight', 'raw', 'number'),
  tok('color.ink', 'raw', 'color'),
  tok('button.container.min-height', 'component', 'dimension'),
];

test('every display of the schema enum is described', () => {
  for (const [id, d] of Object.entries(DISPLAYS)) assert.ok(d.description, id);
  assert.equal(DISPLAYS.value.types, null);
});

test('specimenTokens keeps the patterns, the tier and never component tokens', () => {
  assert.deepEqual(specimenTokens({ tokens: ['space.*'] }, tokens).map((t) => t.path), ['space.4', 'space.8', 'space.inset.sm']);
  assert.deepEqual(specimenTokens({ tokens: ['space.*'], tier: 'raw' }, tokens).map((t) => t.path), ['space.4', 'space.8']);
  assert.deepEqual(specimenTokens({ tokens: ['button.*'] }, tokens), []);
});

test('checkSpecimen reports empty patterns, component tokens and types the display cannot draw', () => {
  assert.deepEqual(checkSpecimen({ id: 'a', display: 'length', tokens: ['space.*'] }, tokens), []);
  assert.match(checkSpecimen({ id: 'b', display: 'length', tokens: ['nope.*'] }, tokens)[0], /matches no token/);
  assert.match(checkSpecimen({ id: 'c', display: 'length', tokens: ['button.*'] }, tokens)[0], /component tokens only/);
  assert.match(checkSpecimen({ id: 'd', display: 'palette', tokens: ['space.4'] }, tokens)[0], /dimension token; the "palette" display draws color/);
  assert.match(checkSpecimen({ id: 'e', display: 'length', tokens: ['space.inset.*'], tier: 'raw' }, tokens)[0], /no raw token/);
  assert.deepEqual(checkSpecimen({ id: 'f', display: 'value', tokens: ['color.ink', 'space.4'] }, tokens), []);
});

test('uncoveredTokens lists raw and semantic tokens no foundation presents or owns', () => {
  const foundations = [{ tokens: ['space.inset.*'], specimens: [{ tokens: ['space.*'], tier: 'raw' }, { tokens: ['font.*'] }] }];
  assert.deepEqual(uncoveredTokens(foundations, tokens), ['color.ink']);
});

test('nearestFamily finds the family token of the same group', () => {
  assert.equal(nearestFamily('font.body.size.md', tokens).path, 'font.body.family');
  // Sharing only the root segment is not enough to pick a family.
  assert.equal(nearestFamily('font.line-height.tight', tokens), null);
});

test('easingPath draws a cubic Bézier in a 100 x 100 box, y up', () => {
  assert.equal(easingPath([0.2, 0, 0, 1]), 'M 0 100 C 20 100, 0 0, 100 0');
});
