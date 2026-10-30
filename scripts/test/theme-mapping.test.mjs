import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadQuantum, checkMapping, assertMapping, checkTokenPath, specOptions, specStates, specParts, semanticOrigin, tokenTrace, pxNumber, pxToRem, ALLOWED_TIERS } from '../lib/theme-mapping.mjs';

const quantum = loadQuantum();

test('loadQuantum resolves every token per mode, default mode first, with the specs', () => {
  assert.deepEqual(quantum.modes, ['light', 'dark']);
  const light = quantum.light.get('global.bg.level.0.default');
  const dark = quantum.dark.get('global.bg.level.0.default');
  assert.equal(light.tier, 'semantic');
  assert.match(light.value, /^#[0-9a-f]{6}$/i);
  assert.notEqual(light.value, dark.value);
  const button = quantum.light.get('button.container.background.accent.brand.default');
  assert.equal(button.tier, 'component');
  assert.equal(button.alias, 'global.bg.accent.brand.default');
  assert.equal(button.value, quantum.light.get('global.bg.accent.brand.default').value);
  const typo = quantum.light.get('button.label.typography.medium');
  assert.equal(typo.value, null, 'a typography composite has no CSS text');
  assert.equal(typo.raw.fontSize.unit, 'px');
  assert.deepEqual(button.raw, quantum.light.get('global.bg.accent.brand.default').raw);
  assert.equal(quantum.specs.button.id, 'button');
  assert.equal(quantum.foundations.focus.id, 'focus');
  assert.deepEqual(quantum.modeDetails.map((m) => [m.id, m.default, m.scheme]), [['light', true, 'light'], ['dark', false, 'dark']]);
  assert.deepEqual(ALLOWED_TIERS, ['semantic', 'component']);
});

test('checkMapping accepts a mapping that names existing tokens, options, states and parts', () => {
  const problems = checkMapping(quantum, {
    tokens: { VARS: { primary: { token: 'global.bg.accent.brand.default' }, radius: { token: 'corner-radius.sm', modes: ['light'] } } },
    components: [{ quantum: 'button', configs: [{ set: { emphasis: 'accent', disabled: true } }, { state: 'hover' }, { part: 'icon' }] }],
  });
  assert.deepEqual(problems, []);
});

test('checkMapping reports an unknown or raw token, an unknown mode, option, property, state, part and component', () => {
  const problems = checkMapping(quantum, {
    tokens: [
      ['a', { token: 'global.bg.nowhere' }],
      ['b', { token: 'neutral.light.ash.500' }],
      ['c', { token: 'corner-radius.sm', modes: ['sepia'] }],
      ['d', {}],
    ],
    components: [
      { quantum: 'button', configs: [{ set: { emphasis: 'loud' } }, { set: { nope: 'x' } }, { set: { disabled: 'yes' } }, { state: 'asleep' }, { part: 'handle' }, { props: {} }] },
      { quantum: 'toaster', configs: [] },
    ],
  });
  const text = problems.join('\n');
  assert.equal(problems.length, 11, text);
  assert.match(text, /a: unknown Quantum token "global.bg.nowhere"/);
  assert.match(text, /b: "neutral.light.ash.500" is a raw token/);
  assert.match(text, /c: unknown mode "sepia"/);
  assert.match(text, /d: no token path/);
  assert.match(text, /button.emphasis has no option "loud" \(options: accent, subtle, ghost\)/);
  assert.match(text, /button has no property "nope"/);
  assert.match(text, /button.disabled is a boolean, got "yes"/);
  assert.match(text, /button has no state "asleep"/);
  assert.match(text, /button has no part "handle"/);
  assert.match(text, /names no property, state or part/);
  assert.match(text, /no Quantum component "toaster"/);
  assert.throws(() => assertMapping(quantum, { tokens: [['a', { token: 'nope' }]] }, 'x.mjs'), /x.mjs does not match the Quantum tokens and specs:\n {2}a: unknown Quantum token "nope"/);
});

test('spec helpers, checkTokenPath and semanticOrigin', () => {
  assert.deepEqual(specOptions(quantum.specs.button, 'emphasis'), ['accent', 'subtle', 'ghost']);
  assert.equal(specOptions(quantum.specs.button, 'nope'), null);
  assert.ok(specStates(quantum.specs.button).includes('hover'));
  assert.deepEqual(specParts(quantum.specs.button), ['container', 'icon', 'label']);
  assert.deepEqual(checkTokenPath(quantum, 'global.bg.level.0.default', 'x'), []);
  assert.deepEqual(checkTokenPath(quantum, 'neutral.light.ash.25', 'x'), ['x: "neutral.light.ash.25" is a raw token; map a semantic or component token']);
  assert.equal(semanticOrigin(quantum, 'button.container.background.accent.brand.default'), 'global.bg.accent.brand.default');
  assert.equal(semanticOrigin(quantum, 'global.bg.accent.brand.default'), 'global.bg.accent.brand.default');
});

test('tokenTrace, pxNumber and pxToRem', () => {
  assert.equal(tokenTrace(quantum.light.get('card.container.background.level-1')), 'card.container.background.level-1 (= global.bg.level.1.default)');
  assert.equal(tokenTrace(quantum.light.get('global.bg.level.1.default')), 'global.bg.level.1.default');
  assert.equal(pxNumber('12px'), 12);
  assert.equal(pxNumber('0.6px'), 0.6);
  assert.equal(pxNumber('1.5'), null);
  assert.equal(pxNumber({ value: 4, unit: 'px' }), 4);
  assert.equal(pxNumber(4), 4);
  assert.equal(pxToRem('12px'), '0.75rem');
  assert.equal(pxToRem(4), '0.25rem');
  assert.equal(pxToRem('16px'), '1rem');
  assert.equal(pxToRem('0px'), '0rem');
  assert.equal(pxToRem('cubic-bezier(0.2, 0, 0, 1)'), 'cubic-bezier(0.2, 0, 0, 1)');
});
