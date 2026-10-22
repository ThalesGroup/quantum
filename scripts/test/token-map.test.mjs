import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTokenPath, effectiveStates, activeTokens, checkTokenMap, kindOf, matchesTokenPattern, aliasChain } from '../lib/token-map.mjs';

const spec = {
  id: 'chip',
  properties: [
    { id: 'variant', type: 'enum', default: 'default', affects: ['container'], options: [{ value: 'default' }, { value: 'strong' }] },
    { id: 'tone', type: 'enum', default: 'neutral', affects: ['container', 'label'], options: [{ value: 'neutral' }, { value: 'error' }] },
    { id: 'size', type: 'enum', default: 'md', affects: ['container'], options: [{ value: 'sm' }, { value: 'md' }] },
    { id: 'disabled', type: 'boolean', default: false },
  ],
  states: [
    { id: 'default', trigger: 'interaction' },
    { id: 'hover', trigger: 'interaction' },
    { id: 'focus-visible', trigger: 'interaction' },
    { id: 'disabled', trigger: 'property', property: 'disabled' },
  ],
};

const tok = (path) => ({ path, segments: path.split('.') });
const tokens = [
  'chip.container.background.default.neutral.default',
  'chip.container.background.default.neutral.hover',
  'chip.container.background.default.error.default',
  'chip.container.background.strong.neutral.default',
  'chip.container.background.strong.error.default',
  'chip.container.background.default.disabled',
  'chip.container.background.strong.disabled',
  'chip.container.min-height.sm',
  'chip.container.min-height.md',
  'chip.container.outline-width.focus-visible',
  'chip.container.transition.duration',
  'chip.label.color.neutral.default',
  'chip.label.color.error.default',
].map(tok);

const active = (props, state) => activeTokens(spec, tokens, props, state).map((a) => a.token.path);

test('parseTokenPath reads options, then the state, then keys, positionally', () => {
  // `default` is first the variant option, then the state once the variant is set.
  assert.deepEqual(parseTokenPath(spec, 'chip.container.background.default.neutral.default'.split('.')), {
    component: 'chip', part: 'container', property: 'background', keys: [], options: { variant: 'default', tone: 'neutral' }, state: 'default', slot: 'container.background', specificity: 2,
  });
  const t = parseTokenPath(spec, 'chip.container.transition.duration'.split('.'));
  assert.deepEqual([t.keys, t.slot, t.state], [['duration'], 'container.transition.duration', null]);
  assert.equal(parseTokenPath(spec, 'chip.container.background.strong.disabled'.split('.')).state, 'disabled');
  // `variant` does not affect the label: there `default` can only be the state.
  const label = parseTokenPath(spec, 'chip.label.color.neutral.default'.split('.'));
  assert.deepEqual([label.options, label.state], [{ tone: 'neutral' }, 'default']);
});

test('effectiveStates: forced state plus boolean-set states, latest declared first', () => {
  assert.deepEqual(effectiveStates(spec, {}, 'default'), []);
  assert.deepEqual(effectiveStates(spec, {}, 'hover'), ['hover']);
  assert.deepEqual(effectiveStates(spec, { disabled: true }, 'hover'), ['disabled', 'hover']);
  assert.deepEqual(effectiveStates(spec, { disabled: true }, 'focus-visible'), ['disabled', 'focus-visible']);
});

test('activeTokens at rest: spec defaults, one token per slot, state-only slots inactive', () => {
  assert.deepEqual(active({}, 'default'), [
    'chip.container.background.default.neutral.default',
    'chip.container.min-height.md',
    'chip.container.transition.duration',
    'chip.label.color.neutral.default',
  ]);
});

test('activeTokens: a state without its own token falls back to default', () => {
  const a = activeTokens(spec, tokens, { tone: 'error' }, 'hover');
  const bg = a.find((x) => x.parsed.slot === 'container.background');
  assert.equal(bg.token.path, 'chip.container.background.default.error.default');
  assert.equal(bg.via, 'default');
  assert.ok(active({}, 'hover').includes('chip.container.background.default.neutral.hover'));
});

test('activeTokens: an option missing from the path matches every value of its property', () => {
  assert.ok(active({ variant: 'strong', tone: 'error' }, 'disabled').includes('chip.container.background.strong.disabled'));
  assert.ok(active({ tone: 'error' }, 'disabled').includes('chip.container.background.default.disabled'));
});

test('activeTokens: the boolean disabled wins over a forced interaction state, slot by slot', () => {
  const paths = active({ disabled: true }, 'focus-visible');
  assert.ok(paths.includes('chip.container.background.default.disabled'));
  // No disabled outline token: the slot falls through to the next state that has one.
  assert.ok(paths.includes('chip.container.outline-width.focus-visible'));
  // No disabled label color: default.
  assert.ok(paths.includes('chip.label.color.neutral.default'));
});

test('activeTokens: the token naming the most options wins in its slot', () => {
  const more = [...tokens, tok('chip.container.background.default.neutral.disabled')];
  const paths = activeTokens(spec, more, {}, 'disabled').map((a) => a.token.path);
  assert.ok(paths.includes('chip.container.background.default.neutral.disabled'));
  assert.ok(!paths.includes('chip.container.background.default.disabled'));
});

test('checkTokenMap: unreachable and ambiguous tokens', () => {
  assert.deepEqual(checkTokenMap(spec, tokens), { unreachable: [], ambiguous: [] });
  // Two one-option tokens of the same slot naming different properties tie.
  const tied = [...tokens, tok('chip.container.min-height.neutral')];
  assert.deepEqual(checkTokenMap(spec, tied).ambiguous.map((a) => a.pair), [
    'chip.container.min-height.neutral / chip.container.min-height.sm',
    'chip.container.min-height.md / chip.container.min-height.neutral',
  ]);
  // A stateless token in a slot that always has a default token is never reached.
  const shadowed = [...tokens, tok('chip.label.color')];
  assert.deepEqual(checkTokenMap(spec, shadowed).unreachable, ['chip.label.color']);
});

test('kindOf: color type first, then the property table, then the DTCG type', () => {
  assert.equal(kindOf('border-color', 'color'), 'color');
  assert.equal(kindOf('outline-color', 'color'), 'color');
  assert.equal(kindOf('border-radius', 'dimension'), 'border');
  assert.equal(kindOf('opacity', 'number'), 'color');
  assert.equal(kindOf('padding-inline', 'dimension'), 'spacing');
  assert.equal(kindOf('min-height', 'dimension'), 'size');
  assert.equal(kindOf('fill', 'number'), 'typography');
  assert.equal(kindOf('transition', 'duration'), 'motion');
  assert.equal(kindOf('elevation', 'shadow'), 'other');
});

test('matchesTokenPattern: exact path or prefix glob', () => {
  assert.ok(matchesTokenPattern('button.icon.*', 'button.icon.size.medium'));
  assert.ok(!matchesTokenPattern('button.icon.*', 'button.iconic'));
  assert.ok(matchesTokenPattern('focus.ring.width', 'focus.ring.width'));
  assert.ok(!matchesTokenPattern('focus.ring', 'focus.ring.width'));
});

test('aliasChain follows aliases down to the literal and stops on cycles', () => {
  const byPath = new Map([
    ['c.x', { path: 'c.x', tier: 'component', value: '{s.y}' }],
    ['s.y', { path: 's.y', tier: 'semantic', value: '{r.z}' }],
    ['r.z', { path: 'r.z', tier: 'raw', value: '#000' }],
    ['a', { path: 'a', tier: 'raw', value: '{b}' }],
    ['b', { path: 'b', tier: 'raw', value: '{a}' }],
  ]);
  assert.deepEqual(aliasChain('c.x', byPath).map((l) => l.tier), ['component', 'semantic', 'raw']);
  assert.equal(aliasChain('a', byPath).length, 2);
});

test('instance enum properties of a repeated part name options of its tokens', () => {
  const spec = {
    properties: [{ id: 'intent', type: 'enum', default: 'neutral', affects: ['trigger'], options: [{ value: 'neutral' }, { value: 'error' }] }],
    anatomy: [{ id: 'trigger' }, { id: 'item', repeatable: true, properties: [{ id: 'intent', type: 'enum', default: 'neutral', affects: ['item'], options: [{ value: 'neutral' }, { value: 'error' }] }] }],
    states: [{ id: 'default', trigger: 'interaction' }, { id: 'hover', trigger: 'interaction' }],
  };
  const p = parseTokenPath(spec, ['menu', 'item', 'background', 'error', 'hover']);
  assert.deepEqual(p.options, { 'item.intent': 'error' });
  assert.equal(p.state, 'hover');
  const tokens = ['neutral.default', 'neutral.hover', 'error.default', 'error.hover'].map((s) => ({ path: `menu.item.background.${s}`, segments: ['menu', 'item', 'background', ...s.split('.')] }));
  assert.deepEqual(activeTokens(spec, tokens, {}, 'hover').map((a) => a.token.path), ['menu.item.background.neutral.hover']);
  assert.deepEqual(checkTokenMap(spec, tokens).unreachable, []);
});
