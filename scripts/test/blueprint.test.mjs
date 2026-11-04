import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBlueprint, renderBlueprint, PIECES } from '../lib/blueprint.mjs';

const doc = { size: [13, 2], parts: [{ box: [0, 0, 6, 2], fill: true }, { text: [1, 1, 4], strong: true }, { box: [7, 0, 6, 2] }, { text: [8, 1, 4] }] };
const messages = (d) => checkBlueprint(d).map((p) => p.message);

test('a blueprint places known pieces in whole or half cells inside its size', () => {
  assert.deepEqual(messages(doc), []);
  assert.deepEqual(messages({ size: [3, 3], parts: [{ glyph: [0, 0], name: 'star', size: 3 }, { ring: [0, 0, 3] }] }), []);
  assert.match(messages({ size: [2, 2] })[0], /"parts"/);
  assert.match(messages({ size: [2.5, 2], parts: [{ via: [0, 0] }] })[0], /"size"/);
  assert.match(messages({ size: [4, 2], parts: [{ blob: [0, 0] }] })[0], /no piece/);
  assert.match(messages({ size: [4, 2], parts: [{ box: [0, 0, 2] }] })[0], /box takes \[x, y, width, height\]/);
  assert.match(messages({ size: [4, 2], parts: [{ box: [0.3, 0, 2, 2] }] })[0], /half cells/);
  assert.match(messages({ size: [4, 2], parts: [{ box: [3, 0, 2, 2] }] })[0], /outside the drawing/);
  assert.match(messages({ size: [4, 2], parts: [{ box: [0, 0, 2, 2], color: 'red' }] })[0], /no option "color"/);
  assert.match(messages({ size: [4, 2], parts: [{ box: [0, 0, 2, 2], radius: 'lg' }] })[0], /"radius" must be xs or pill or round/);
  assert.match(messages({ size: [4, 2], parts: [{ glyph: [0, 0], name: 'rocket' }] })[0], /"name" must be/);
  assert.match(messages({ size: [4, 2], parts: [{ track: [0, 1, 4], value: 2 }] })[0], /between 0 and 1/);
  assert.match(messages({ size: [4, 2], parts: [], extra: true })[0], /unknown key "extra"/);
});

test('every piece documents its place', () => {
  for (const [name, piece] of Object.entries(PIECES)) assert.ok(Array.isArray(piece.at) && piece.at[0] === 'x' && piece.at[1] === 'y', name);
});

test('the drawing is in screen pixels, its strokes on the pixel grid, its grid from its corner', () => {
  const thumb = renderBlueprint(doc, { cell: 10, uid: 'button-10' });
  assert.match(thumb, /^<svg class="site-bp__svg"[^>]* width="130" height="20" viewBox="0 0 130 20"/);
  // A one-pixel outline sits on half pixels, inside its box.
  assert.match(thumb, /<rect x="0.5" y="0.5" width="59" height="19" rx="1.5" class="site-bp__line" stroke-width="1"\/>/);
  // Hairlines at every cell size: a page head's outline is one pixel too.
  assert.match(renderBlueprint(doc, { cell: 20, uid: 'button-20' }), /<rect x="0.5" y="0.5" width="119" height="39" rx="3.5" class="site-bp__line" stroke-width="1"\/>/);
  // A label is a thin bar on whole pixels.
  assert.match(renderBlueprint(doc, { cell: 20, uid: 'button-20' }), /<rect x="20" y="18" width="80" height="4" rx="1" class="site-bp__ink"\/>/);
  assert.match(thumb, /<pattern id="site-bp-button-10-minor" width="10" height="10" patternUnits="userSpaceOnUse"><path class="site-bp__grid" d="M.5 0 V10 M0 .5 H10"\/>/);
  assert.match(thumb, /fill="url\(#site-bp-button-10-hatch\)"/);
  assert.doesNotMatch(thumb, /stroke-dasharray="\d+ \d+ \d+ \d+"/, 'no centre marks on a thumbnail');
  assert.match(renderBlueprint(doc, { cell: 20, uid: 'b', construction: true }), /stroke-dasharray="10 5 2.5 5"/);
  // A checkbox is a case of the grid: its outline is its cell's.
  assert.match(renderBlueprint({ size: [1, 1], parts: [{ check: [0, 0], on: true }] }, { cell: 10, uid: 'c' }), /<rect x="0.5" y="0.5" width="9" height="9" rx="0" class="site-bp__line" stroke-width="1"\/>/);
  // Colors are classes of the site's stylesheet, never values.
  assert.doesNotMatch(thumb, /(fill|stroke)="(#|rgb|white|black)/);
});
