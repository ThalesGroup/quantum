import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, composite, contrastRatio, formatRatio, matchPaths, evaluateContrast } from '../lib/contrast.mjs';
import { tierFromTrees, indexTiers } from '../lib/dtcg.mjs';

const near = (actual, expected, eps = 0.01) => assert.ok(Math.abs(actual - expected) < eps, `${actual} !~ ${expected}`);

test('parseColor reads hex, rgb() and DTCG 2024 color objects', () => {
  assert.deepEqual(parseColor('#fff'), { r: 1, g: 1, b: 1, a: 1 });
  near(parseColor('#00000080').a, 0.5);
  assert.deepEqual(parseColor('rgb(255 0 0 / 50%)'), { r: 1, g: 0, b: 0, a: 0.5 });
  assert.deepEqual(parseColor({ colorSpace: 'srgb', components: [0, 0.5, 1], alpha: 0.2, hex: '#0080ff' }), { r: 0, g: 0.5, b: 1, a: 0.2 });
  assert.throws(() => parseColor('papayawhip'), /unsupported/);
});

test('contrastRatio follows the WCAG definition', () => {
  near(contrastRatio(parseColor('#000'), parseColor('#fff')), 21);
  near(contrastRatio(parseColor('#fff'), parseColor('#fff')), 1);
  // WCAG 1.4.11 example: grey #949494 on white is 3:1.
  near(contrastRatio(parseColor('#949494'), parseColor('#fff')), 3.03);
  // Order does not matter.
  near(contrastRatio(parseColor('#fff'), parseColor('#767676')), contrastRatio(parseColor('#767676'), parseColor('#fff')), 1e-9);
});

test('translucent colors are composited before measuring', () => {
  const half = composite(parseColor('#00000080'), parseColor('#fff'));
  near(half.r, 0.498);
  // Half-transparent black on white is measured as mid grey, not black.
  near(contrastRatio(parseColor('#00000080'), parseColor('#fff')), contrastRatio(half, parseColor('#fff')), 1e-9);
});

test('formatRatio truncates so a ratio never rounds up past a threshold', () => {
  assert.equal(formatRatio(2.999), '2.99:1');
  assert.equal(formatRatio(4.5), '4.50:1');
});

const fixture = () => {
  const raw = tierFromTrees('raw', [{ c: { $type: 'color', white: { $value: '#ffffff' }, black: { $value: '#000000' }, grey: { $value: '#aaaaaa' } } }]);
  const semantic = tierFromTrees('semantic', [{ color: { $type: 'color', surface: { a: { $value: '{c.white}' }, b: { $value: '{c.grey}' } }, ring: { $value: '{c.black}' } } }]);
  return indexTiers({ tiers: [{ name: 'raw', references: [] }, { name: 'semantic', references: ['raw'] }] }, [raw, semantic]);
};

test('matchPaths expands group patterns', () => {
  const index = fixture();
  assert.deepEqual(matchPaths('color.surface.*', index).sort(), ['color.surface.a', 'color.surface.b']);
  assert.deepEqual(matchPaths('color.ring', index), ['color.ring']);
  assert.deepEqual(matchPaths('color.nope', index), []);
});

test('evaluateContrast reports every background in every context', () => {
  const index = fixture();
  const rows = evaluateContrast([{ id: 'ring', foreground: 'color.ring', backgrounds: ['color.surface.*'], minimum: 10 }], [{ platform: null, mode: 'light', index }]);
  assert.equal(rows.length, 2);
  const byBg = Object.fromEntries(rows.map((r) => [r.background, r]));
  assert.equal(byBg['color.surface.a'].pass, true);
  assert.equal(byBg['color.surface.b'].pass, false);
  assert.equal(byBg['color.surface.a'].fg, '#000000');
  const missing = evaluateContrast([{ id: 'x', foreground: 'color.ring', backgrounds: ['color.none.*'], minimum: 3 }], [{ platform: null, mode: null, index }]);
  assert.match(missing[0].error, /no background/);
});

test('translucent backgrounds are measured over each surface of `on`', () => {
  const raw = tierFromTrees('raw', [{ c: { $type: 'color', white: { $value: '#ffffff' }, black: { $value: '#000000' }, veil: { $value: '#ffffff33' } } }]);
  const semantic = tierFromTrees('semantic', [{ color: { $type: 'color', surface: { light: { $value: '{c.white}' }, dark: { $value: '{c.black}' } }, tint: { $value: '{c.veil}' }, solid: { $value: '{c.black}' }, text: { $value: '{c.white}' } } }]);
  const index = indexTiers({ tiers: [{ name: 'raw', references: [] }, { name: 'semantic', references: ['raw'] }] }, [raw, semantic]);
  const ctx = [{ platform: null, mode: null, index }];
  const rows = evaluateContrast([{ id: 't', foreground: 'color.text', backgrounds: ['color.tint', 'color.solid'], on: ['color.surface.*'], minimum: 4.5 }], ctx);
  // The translucent tint gives one row per surface; the opaque fill ignores the surfaces.
  assert.deepEqual(rows.map((r) => [r.background, r.surface]), [['color.tint', 'color.surface.light'], ['color.tint', 'color.surface.dark'], ['color.solid', null]]);
  const [onLight, onDark] = rows;
  near(onLight.ratio, 1);
  assert.equal(onLight.pass, false);
  assert.ok(onDark.ratio > 4.5 && onDark.pass);
  // The background shown is the color people see: the tint composited over the surface.
  assert.equal(onDark.bg, '#333333');
  const missing = evaluateContrast([{ id: 'm', foreground: 'color.text', backgrounds: ['color.tint'], on: ['color.none.*'], minimum: 3 }], ctx);
  assert.match(missing[0].error, /no surface/);
});

test('a pair without minimum is measured and never fails', () => {
  const index = fixture();
  const [row] = evaluateContrast([{ id: 'm', foreground: 'color.ring', backgrounds: ['color.surface.b'] }], [{ platform: null, mode: null, index }]);
  assert.equal(row.minimum, null);
  assert.equal(row.pass, true);
  assert.ok(row.ratio > 1);
});
