import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flatten } from '../lib/dtcg.mjs';
import { toSpecs, fromSpecs, tokensToTree, EXT } from '../lib/specs-bridge.mjs';
import { loadSpecsSchema } from '../lib/specs-schema.mjs';

const { validate } = loadSpecsSchema();

const spec = {
  id: 'chip',
  name: 'Chip',
  version: '0.1.0',
  status: 'draft',
  role: 'togglebutton',
  summary: 'Fixture for the Specs bridge.',
  anatomy: [
    { id: 'container', role: 'container', required: true, description: 'Root.' },
    { id: 'icon', role: 'icon', required: false },
    { id: 'label', role: 'label', required: true },
  ],
  properties: [
    { id: 'tone', name: 'Tone', type: 'enum', default: 'neutral', affects: ['container', 'label'], options: [{ value: 'neutral', description: 'Default.' }, { value: 'accent' }] },
    { id: 'label', name: 'Label', type: 'string', required: true, bindsTo: 'label' },
    { id: 'icon', name: 'Icon', type: 'icon', bindsTo: 'icon' },
    { id: 'hint', name: 'Hint', type: 'string', description: 'String prop with no example and no part.' },
    { id: 'selected', name: 'Selected', type: 'boolean', default: false },
    { id: 'disabled', name: 'Disabled', type: 'boolean', default: false },
  ],
  states: [
    { id: 'default', trigger: 'interaction', description: 'Rest.' },
    { id: 'hover', trigger: 'interaction', inputs: ['pointer'] },
    { id: 'long-press', trigger: 'interaction', platforms: ['ios', 'android'], description: 'Scoped to touch platforms; kept in the state prop extensions.' },
    { id: 'selected', trigger: 'property', property: 'selected' },
    { id: 'disabled', trigger: 'property', property: 'disabled' },
  ],
  layout: { direction: 'horizontal', align: 'center', wrap: false, notes: ['Kept in the sidecar.'] },
  accessibility: { ariaRole: 'button', keyboard: [{ key: 'Enter', action: 'Activates.', refs: ['apg'], platforms: ['web'] }], guidelines: [{ text: 'Hit region of 44 pt.', refs: ['hig'], platforms: ['ios'] }] },
  content: { guidelines: ['Verb first.', { text: 'Title-style capitalization.', platforms: ['ios'] }] },
  examples: [
    { id: 'accent', name: 'Accent', description: 'Kept in the sidecar.', props: { tone: 'accent', label: 'Tag' } },
    { id: 'haptic', name: 'Haptic', platforms: ['ios'], props: { tone: 'accent', label: 'Tap' } },
  ],
  tokens: { source: 'tokens/components/chip.tokens.json', prefix: 'chip' },
  implementations: { web: { element: 'button' } },
  decisions: [{ id: 'accent-tone', date: '2026-09-29', version: '0.1.0', area: 'variant', status: 'active', text: 'Kept in the sidecar.', tokens: ['chip.container.background.accent.*'] }],
  changelog: [{ version: '0.1.0', date: '2026-09-29', note: 'Fixture.' }],
};

const alias = (p) => ({ $value: `{${p}}` });
const tokens = {
  chip: {
    container: {
      background: {
        $type: 'color',
        neutral: { default: alias('c.n'), hover: alias('c.n-h'), selected: alias('c.n-s'), disabled: alias('c.n-d') },
        accent: { default: alias('c.a'), hover: alias('c.a-h'), selected: alias('c.a-s'), disabled: alias('c.a-d') },
      },
      'padding-inline': { $type: 'dimension', ...alias('s.inline') },
      'padding-block': { $type: 'dimension', ...alias('s.block') },
      'outline-color': { $type: 'color', hover: alias('c.focus') },
    },
    label: { color: { $type: 'color', neutral: { default: { ...alias('c.t'), $description: 'Carried by the sidecar.' } } } },
    icon: { size: { $type: 'dimension', ...alias('s.icon') } },
  },
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const flat = (tree) => Object.fromEntries(flatten(tree).map((t) => [t.path, { value: t.value, type: t.type, ...(t.description ? { description: t.description } : {}) }]));
const flatMap = (m) => Object.fromEntries([...m].map(([p, t]) => [p, { value: t.value, type: t.type, ...(t.description ? { description: t.description } : {}) }]));

test('export validates against the pinned Specs schema', () => {
  const { component } = toSpecs(spec, tokens);
  assert.ok(validate(component), JSON.stringify(validate.errors?.slice(0, 5)));
});

test('platform scopes on states, examples, statements and content survive the round trip', () => {
  const { component, sidecar } = toSpecs(spec, tokens);
  assert.deepEqual(component.props.state.$extensions[EXT].states.find((s) => s.id === 'long-press').platforms, ['ios', 'android']);
  assert.deepEqual(sidecar.examples.haptic, { platforms: ['ios'] });
  const back = fromSpecs(clone(component), clone(sidecar));
  assert.deepEqual(back.spec.states, spec.states);
  assert.deepEqual(back.spec.examples, spec.examples);
  assert.deepEqual(back.spec.accessibility, spec.accessibility);
  assert.deepEqual(back.spec.content, spec.content);
});

test('a string prop without examples still matches exactly one Specs prop type', () => {
  const { component } = toSpecs(spec, tokens);
  assert.deepEqual(component.props.hint.examples, []);
});

test('round trip with the sidecar is lossless for spec and tokens', () => {
  const { component, sidecar } = toSpecs(spec, tokens);
  const back = fromSpecs(clone(component), clone(sidecar));
  assert.deepEqual(back.spec, spec);
  assert.deepEqual(flatMap(back.tokens), flat(tokens));
  assert.deepEqual(flat(tokensToTree(back.tokens)), flat(tokens));
});

test('states map to a state prop, booleans and invalid combinations', () => {
  const { component } = toSpecs(spec, tokens);
  assert.deepEqual(component.props.state.enum, ['default', 'hover', 'long-press']);
  assert.deepEqual(component.invalidPropCombinations, [{ selected: true, state: 'hover' }, { selected: true, state: 'long-press' }, { disabled: true, state: 'hover' }, { disabled: true, state: 'long-press' }]);
  const configs = component.variants.map((v) => v.configuration);
  assert.ok(configs.some((c) => c.tone === 'accent' && c.selected === true));
  assert.ok(configs.some((c) => c.tone === 'neutral' && c.state === 'hover'));
});

test('tokens with no Specs style travel in the sidecar', () => {
  const { sidecar } = toSpecs(spec, tokens);
  assert.deepEqual(sidecar.tokens.residue.map((t) => t.path), ['chip.container.outline-color.hover']);
  assert.equal(sidecar.tokens.meta['chip.label.color.neutral.default'].description, 'Carried by the sidecar.');
});

test('padding-inline and padding-block share one Specs Sides object', () => {
  const { component } = toSpecs(spec, tokens);
  const padding = component.default.elements.container.styles.padding;
  assert.deepEqual(Object.keys(padding).sort(), ['bottom', 'end', 'start', 'top']);
  assert.equal(padding.start.$token, 's.inline');
  assert.equal(padding.top.$token, 's.block');
});

test('import without extensions or sidecar infers structure and token paths', () => {
  const { component } = toSpecs(spec, tokens);
  const bare = JSON.parse(JSON.stringify(component), (k, v) => (k === '$extensions' ? undefined : v));
  assert.ok(!JSON.stringify(bare).includes(EXT));
  const { spec: back, tokens: backTokens } = fromSpecs(bare);
  assert.deepEqual(back.anatomy.map((p) => [p.id, p.role]), [['container', 'container'], ['icon', 'icon'], ['label', 'label']]);
  assert.deepEqual(back.states.map((s) => [s.id, s.trigger]), [['default', 'interaction'], ['hover', 'interaction'], ['long-press', 'interaction'], ['selected', 'property'], ['disabled', 'property']]);
  // A token set only for the default option and state carries no evidence that it varies,
  // so without io.quantum paths it imports under its unqualified path.
  const rename = { 'chip.label.color.neutral.default': 'chip.label.color' };
  const expressible = Object.fromEntries(Object.entries(flat(tokens)).filter(([p]) => !p.includes('outline')).map(([p, t]) => [rename[p] ?? p, { value: t.value, type: t.type }]));
  assert.deepEqual(flatMap(backTokens), expressible);
});

test('an option value equal to a state id reads as option first, then as state', () => {
  // Same shape as the `pnpm new:component` scaffold: variant `default` next to state `default`.
  const clash = {
    ...spec,
    properties: spec.properties.map((p) => (p.id === 'tone' ? { ...p, default: 'default', options: [{ value: 'default' }, { value: 'subtle' }] } : p)),
    examples: [{ id: 'subtle', name: 'Subtle', props: { tone: 'subtle', label: 'Tag' } }],
  };
  const clashTokens = {
    chip: {
      container: {
        background: {
          $type: 'color',
          default: { default: alias('c.d'), hover: alias('c.d-h') },
          subtle: { default: alias('c.s'), hover: alias('c.s-h') },
        },
      },
      label: { color: { $type: 'color', default: { default: alias('c.t') }, subtle: { default: alias('c.t-s') } } },
    },
  };
  const { component, sidecar } = toSpecs(clash, clashTokens);
  assert.ok(validate(component), JSON.stringify(validate.errors?.slice(0, 5)));
  assert.deepEqual(sidecar.tokens.residue, []);
  assert.equal(component.default.elements.container.styles.backgroundColor.$token, 'c.d');
  const subtle = component.variants.find((v) => JSON.stringify(v.configuration) === JSON.stringify({ tone: 'subtle' }));
  assert.equal(subtle?.elements.container.styles.backgroundColor.$token, 'c.s');
  assert.equal(subtle?.elements.label.styles.textColor.$token, 'c.t-s');
  const back = fromSpecs(clone(component), clone(sidecar));
  assert.deepEqual(back.spec, clash);
  assert.deepEqual(flatMap(back.tokens), flat(clashTokens));
});

test('a property named "state" is refused with an actionable message', () => {
  const clash = { ...spec, properties: [...spec.properties, { id: 'state', type: 'string' }] };
  assert.throws(() => toSpecs(clash, tokens), /reserved by the Specs bridge/);
});

test('list properties: part instances stay out of Specs props and their tokens go to the sidecar', () => {
  const menu = {
    ...clone(spec),
    id: 'menu',
    anatomy: [
      { id: 'container', role: 'container', required: true },
      { id: 'item', role: 'action', required: true, repeatable: true, properties: [{ id: 'label', type: 'string', required: true, bindsTo: 'item-label' }, { id: 'tone', type: 'enum', default: 'neutral', affects: ['item-label'], options: [{ value: 'neutral' }, { value: 'accent' }] }] },
      { id: 'item-label', role: 'label', required: true, parent: 'item' },
    ],
    properties: [
      { id: 'tone', type: 'enum', default: 'neutral', affects: ['container'], options: [{ value: 'neutral' }, { value: 'accent' }] },
      { id: 'items', type: 'list', required: true, of: ['item'] },
      { id: 'disabled', type: 'boolean', default: false },
    ],
    // A boolean-set state listed before an interaction state keeps its place.
    states: [{ id: 'default', trigger: 'interaction' }, { id: 'disabled', trigger: 'property', property: 'disabled', parts: ['item'] }, { id: 'hover', trigger: 'interaction', parts: ['item'] }],
    examples: [{ id: 'two', name: 'Two', props: { tone: 'accent', items: [{ label: 'One' }, { label: 'Two', tone: 'accent' }] } }],
    tokens: { source: 'tokens/components/menu.tokens.json', prefix: 'menu' },
  };
  delete menu.decisions;
  const tree = { menu: { container: { background: { $type: 'color', accent: alias('c.a'), neutral: alias('c.n') } }, 'item-label': { color: { $type: 'color', accent: { hover: alias('c.t') } } } } };
  const { component, sidecar } = toSpecs(menu, tree);
  assert.ok(validate(component), JSON.stringify(validate.errors?.slice(0, 5)));
  assert.deepEqual(component.instanceExamples.two.propConfigurations, { tone: 'accent' });
  assert.deepEqual(sidecar.tokens.residue.map((t) => t.path), ['menu.item-label.color.accent.hover']);
  const back = fromSpecs(clone(component), clone(sidecar));
  assert.deepEqual(back.spec.states.map((s) => s.id), ['default', 'disabled', 'hover']);
  assert.deepEqual(back.spec.examples[0].props, menu.examples[0].props);
  assert.deepEqual(flatMap(back.tokens), flat(tree));
});
