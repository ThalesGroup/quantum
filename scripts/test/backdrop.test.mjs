import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fillOf, fillsOf, backdropOf, missingFills } from '../lib/backdrop.mjs';

test('fillOf pairs a role read on a fill with that fill at rest', () => {
  assert.equal(fillOf('global.icon.on-accent.brand.default'), 'global.bg.accent.brand.default');
  assert.equal(fillOf('global.text.on-subtle.functional.success.default'), 'global.bg.subtle.functional.success.default');
  assert.equal(fillOf('global.icon.on-accent.neutral.secondary'), 'global.bg.accent.neutral.default');
  assert.equal(fillOf('global.border.on-sunken.brand.default'), 'global.bg.sunken.brand.default');
  assert.equal(fillOf('global.icon.on-base.brand.default'), null);
  assert.equal(fillOf('global.bg.accent.brand.default'), null);
  assert.equal(fillOf(null), null);
});

test('fillsOf skips the fills a component draws itself', () => {
  // A chip draws its accent fill and reads the role on it: no backdrop. Its subtle label reads a fill it does not draw.
  const fills = fillsOf([
    { path: 'chip.container.background.accent', semantic: 'global.bg.accent.brand.default' },
    { path: 'chip.label.color.accent', semantic: 'global.text.on-accent.brand.default' },
    { path: 'chip.label.color.subtle', semantic: 'global.text.on-subtle.brand.default' },
    { path: 'chip.label.color.base', semantic: 'global.text.on-base.brand.default' },
  ]);
  assert.deepEqual(fills, { 'chip.label.color.subtle': 'global.bg.subtle.brand.default' });
});

test('backdropOf follows the active-token rule', () => {
  const spec = {
    id: 'glyph',
    properties: [
      { id: 'color', type: 'enum', default: 'brand', affects: ['container'], options: [{ value: 'brand' }, { value: 'neutral' }] },
      { id: 'surface', type: 'enum', default: 'base', affects: ['container'], options: [{ value: 'base' }, { value: 'accent' }, { value: 'sunken' }] },
    ],
    states: [{ id: 'default', trigger: 'interaction' }],
  };
  const rows = [
    ['glyph.container.color.brand', 'global.icon.on-base.brand.default'],
    ['glyph.container.color.neutral', 'global.icon.on-base.neutral.secondary'],
    ['glyph.container.color.accent.brand', 'global.icon.on-accent.brand.default'],
    ['glyph.container.color.accent.neutral', 'global.icon.on-accent.neutral.secondary'],
    ['glyph.container.color.sunken.brand', 'global.icon.on-sunken.brand.default'],
  ];
  const tokens = rows.map(([path]) => ({ path, segments: path.split('.') }));
  const fills = fillsOf(rows.map(([path, semantic]) => ({ path, semantic })));
  assert.equal(backdropOf(spec, tokens, fills, {}), null);
  assert.equal(backdropOf(spec, tokens, fills, { surface: 'accent' }), 'global.bg.accent.brand.default');
  assert.equal(backdropOf(spec, tokens, fills, { surface: 'accent', color: 'neutral' }), 'global.bg.accent.neutral.default');
  assert.equal(backdropOf(spec, tokens, fills, { surface: 'sunken' }), 'global.bg.sunken.brand.default');
  // No neutral token of its own on sunken: the on-base one applies, on a level.
  assert.equal(backdropOf(spec, tokens, fills, { surface: 'sunken', color: 'neutral' }), null);
});

test('missingFills lists the roles whose fill does not exist', () => {
  const byPath = new Map([
    ['global.icon.on-accent.brand.default', { path: 'global.icon.on-accent.brand.default', tier: 'semantic' }],
    ['global.bg.accent.brand.default', { path: 'global.bg.accent.brand.default', tier: 'semantic' }],
    ['global.icon.on-subtle.lime.default', { path: 'global.icon.on-subtle.lime.default', tier: 'semantic' }],
  ]);
  assert.deepEqual(missingFills(byPath), [{ role: 'global.icon.on-subtle.lime.default', fill: 'global.bg.subtle.lime.default' }]);
});
