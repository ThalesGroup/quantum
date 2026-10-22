import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validKey, validPath, COLLECTIONS, knownPaths, recreate, available } from '../figma-library.mjs';
import { PATHS } from '../lib/paths.mjs';

const byOut = (out) => COLLECTIONS.find((c) => c.out === out);
const tokens = (out) => new Map(recreate(byOut(`${PATHS.tokensSrc}/${out}`)));
/** The tests that read the export skip without it: it is local and never committed. */
const needsExport = { skip: !available && `no Figma library export in ${PATHS.rawContent}/` };

test('validKey only changes what a path or a CSS variable cannot carry', () => {
  assert.equal(validKey('⚠️ai'), 'ai');
  assert.equal(validKey('AI'), 'ai');
  assert.equal(validKey('semiBold'), 'semi-bold');
  assert.equal(validKey('drop shadow'), 'drop-shadow');
  assert.equal(validKey('Number'), 'number');
  assert.equal(validKey('functionnal'), 'functionnal', 'typos are kept');
  assert.equal(validKey('on-subtle'), 'on-subtle');
  assert.equal(validKey('25'), '25');
});

test('validPath renames the base brand identity, whose CSS variable would collide with the mapped one', () => {
  assert.equal(validPath(['brand', 'identity', 'marine-blue']), 'brand.identity-base.marine-blue');
  assert.equal(validPath(['brand-identity', 'marine-blue']), 'brand-identity.marine-blue');
  assert.equal(validPath(['brand', 'light', '600']), 'brand.light.600');
});

test('every path stays unique and every CSS variable distinct', needsExport, () => {
  const paths = [...knownPaths()];
  const vars = paths.map((p) => p.replace(/\./g, '-'));
  assert.equal(new Set(vars).size, vars.length);
});

test('aliases keep their target, made valid', needsExport, () => {
  const mapped = tokens('semantic/colors-mapped.tokens.json');
  assert.equal(mapped.get('global.bg.level.0.default').$value, '{global.bg.base.neutral.1}');
  assert.equal(mapped.get('global.bg.base.neutral.1').$value, '{light-switch.base.25}');
  assert.equal(mapped.get('global.bg.accent.brand.default').$value, '{brand.light.600}');
  assert.equal(mapped.get('ai.bg.accent.default').$value, '{global.bg.accent.brand.default}');
  assert.equal(tokens('raw/palette-switch.tokens.json').get('light-switch.base.25').$value, '{neutral.light.ash.25}');
});

test('composed colors and aliases to missing colors keep their literal value and say why', needsExport, () => {
  const mapped = tokens('semantic/colors-mapped.tokens.json');
  const subtle = mapped.get('global.bg.subtle.neutral.default');
  assert.equal(subtle.$value.hex, '#B6B4B4');
  assert.ok(Math.abs(subtle.$value.alpha - 0.1) < 1e-6);
  assert.match(subtle.$description, /light-switch\.base\.400 at opacity\.10/);
  const broken = [...mapped.values()].find((t) => /does not contain/.test(t.$description ?? ''));
  assert.equal(typeof broken.$value, 'object');
});

test('numbers become DTCG dimensions, fractions, weights and families', needsExport, () => {
  const dim = tokens('semantic/dimension.tokens.json');
  assert.deepEqual(dim.get('space.4'), { $type: 'dimension', $value: { value: 4, unit: 'px' } });
  assert.deepEqual(dim.get('stroke-width.sm').$value, { value: 0.6, unit: 'px' });
  const effect = tokens('semantic/effect.tokens.json');
  assert.equal(effect.get('opacity.10').$value, 0.1);
  assert.equal(effect.get('drop-shadow.number').$type, 'number');
  const type = tokens('semantic/typography.tokens.json');
  assert.deepEqual(type.get('heading.weight.semi-bold'), { $type: 'fontWeight', $value: 600 });
  assert.deepEqual(type.get('body.family'), { $type: 'fontFamily', $value: 'Inter' });
  assert.deepEqual(type.get('mono.size.xs').$value, { value: 12, unit: 'px' });
});

test('the dark mode keeps only the tokens whose value differs from light', needsExport, () => {
  const light = tokens('semantic/colors-mapped.tokens.json');
  const dark = tokens('modes/dark/colors-mapped.tokens.json');
  assert.ok(dark.size > 0 && dark.size < light.size);
  for (const [p, t] of dark) assert.notDeepEqual(t.$value, light.get(p)?.$value, p);
  assert.equal(dark.has('global.bg.accent.functional.error.default'), false, 'same alias in both modes');
  assert.equal(dark.get('global.bg.accent.brand.default').$value, '{brand.dark.200}');
});
