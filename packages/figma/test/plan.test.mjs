import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll, indexTiers, tierFromTrees, modeFromTrees, cssDeclarations } from '../../../scripts/lib/dtcg.mjs';
import { checkSiteCss } from '../../../scripts/lib/site-check.mjs';
import { renderUi } from '../src/ui/ui.mjs';
import { figmaVariables, figmaComponent, pluginPlan, rgba, px, variableName } from '../src/plan.mjs';
import { BLUEPRINTS } from '../src/blueprints/index.mjs';
import { PATHS, artifacts } from '../../../scripts/lib/paths.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const loaded = loadAll(path.join(ROOT, PATHS.tokens));
const button = JSON.parse(fs.readFileSync(path.join(ROOT, artifacts('button').spec), 'utf8'));


/** The first node named `name` in a plan node's subtree. */
const findNode = (node, name) => {
  for (const child of node?.children ?? []) {
    if (child.name === name) return child;
    const found = findNode(child, name);
    if (found) return found;
  }
  return undefined;
};

test('rgba and px convert resolved DTCG values to Figma units', () => {
  assert.deepEqual(rgba({ colorSpace: 'srgb', components: [1, 0.5, 0], alpha: 0.10000000149011612 }), { r: 1, g: 0.5, b: 0, a: 0.1 });
  assert.deepEqual(rgba('#ff000080'), { r: 1, g: 0, b: 0, a: 128 / 255 });
  assert.throws(() => rgba({ colorSpace: 'display-p3', components: [1, 0, 0] }), /no Figma equivalent/);
  assert.equal(px({ value: 1.5, unit: 'rem' }), 24);
  assert.equal(px({ value: 12, unit: 'px' }), 12);
});

test('figmaVariables keeps aliases, one collection per tier, the modes on the modal tier only', () => {
  const config = {
    tiers: [
      { name: 'raw', mayReference: [] },
      { name: 'semantic', mayReference: ['raw'], modal: true },
      { name: 'component', mayReference: ['semantic'] },
    ],
  };
  const tiers = [
    tierFromTrees('raw', [{ grey: { $type: 'color', 100: { $value: '#eeeeee' }, 900: { $value: '#111111' } }, step: { $type: 'dimension', 4: { $value: { value: 4, unit: 'px' } } } }]),
    tierFromTrees('semantic', [{ bg: { $type: 'color', $value: '{grey.100}' }, space: { $type: 'dimension', $value: '{step.4}' }, fast: { $type: 'duration', $value: { value: 100, unit: 'ms' } } }]),
    tierFromTrees('component', [{ chip: { container: { background: { $value: '{bg}' }, gap: { $value: '{space}' }, transition: { $value: '{fast}' } } } }]),
  ];
  const index = indexTiers(config, tiers);
  const set = {
    ...index,
    platforms: [],
    modes: [modeFromTrees('light', [], { default: true }), modeFromTrees('dark', [{ bg: { $value: '{grey.900}' } }])],
  };
  const { collections, variables, skipped } = figmaVariables(set, ['chip.container.background', 'chip.container.gap', 'chip.container.transition']);
  const byName = Object.fromEntries(variables.map((v) => [v.name, v]));
  assert.deepEqual(collections.map((c) => [c.key, c.modes]), [['raw', ['Value']], ['semantic', ['Light', 'Dark']], ['component', ['Value']]]);
  assert.deepEqual(byName['chip/container/background'].values, { Value: { alias: 'bg' } });
  assert.deepEqual(byName.bg.values, { Light: { alias: 'grey/100' }, Dark: { alias: 'grey/900' } });
  assert.equal(byName['grey/900'].values.Value.r, 0x11 / 255);
  assert.equal(byName['step/4'].values.Value, 4);
  assert.equal(byName['grey/100'].hidden, true);
  assert.deepEqual(byName['grey/100'].scopes, []);
  assert.deepEqual(byName['chip/container/background'].scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  assert.deepEqual(byName['chip/container/gap'].scopes, ['GAP']);
  assert.equal(byName['chip/container/gap'].codeSyntax.WEB, 'var(--chip-container-gap)');
  // A duration has no Figma variable, nor does a token aliasing it.
  assert.deepEqual(skipped, ['chip/container/transition']);
});

const specOf = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, artifacts(id).spec), 'utf8'));
const componentIds = fs.readdirSync(path.join(ROOT, PATHS.specs, 'components')).map((f) => f.replace(/\.spec\.json$/, '')).sort();

test('every component has a blueprint', () => {
  assert.deepEqual(Object.keys(BLUEPRINTS).sort(), componentIds);
});

test('every blueprint draws or lists every token slot of its component', () => {
  for (const id of Object.keys(BLUEPRINTS)) {
    const plan = figmaComponent(loaded, specOf(id), BLUEPRINTS[id]);
    assert.deepEqual(plan.uncovered, [], `${id}: slots neither bound nor listed in notDrawn`);
    assert.equal(new Set(plan.variants.map((v) => v.name)).size, plan.variants.length, `${id}: variant names are unique`);
    assert.equal(plan.grid.rows * plan.grid.columns, plan.variants.length, `${id}: one grid cell per variant`);
    const names = new Set(plan.variables.variables.map((v) => v.name));
    for (const name of Object.keys(plan.values)) assert.ok(names.has(name), `${id}: ${name}`);
  }
});

test('the Button plan binds, in each variant, the tokens the web reads', () => {
  const plan = figmaComponent(loaded, button, BLUEPRINTS.button);
  const enums = button.properties.filter((p) => p.type === 'enum');
  assert.equal(plan.variants.length, enums.reduce((n, p) => n * p.options.length, 1) * button.states.length * 4);

  // The default variant comes first: Figma's default variant is the top-left one.
  const first = plan.variants[0];
  assert.equal(first.name, 'Emphasis=subtle, Intent=neutral, Size=medium, Leading icon=false, Trailing icon=false, State=default');
  assert.deepEqual([first.row, first.column], [0, 0]);
  assert.equal(first.root.fills, 'button/container/background/subtle/neutral/default');
  assert.equal(first.root.bind.paddingLeft, 'button/container/padding-inline/medium');
  assert.equal(first.root.children[0].typography.fontSize, 'button/label/typography/medium/font-size');
  assert.deepEqual(first.root.children[0].typography.lineHeight, { unit: 'PERCENT', value: 100 });
  assert.equal(first.root.focusRing, undefined);

  const find = (name) => plan.variants.find((v) => v.name === name);
  const leading = find('Emphasis=accent, Intent=neutral, Size=small, Leading icon=true, Trailing icon=false, State=default');
  assert.equal(leading.root.bind.paddingLeft, 'button/container/padding-inline/icon-side/small');
  assert.equal(leading.root.bind.paddingRight, 'button/container/padding-inline/label-side/small');
  const icon = leading.root.children[0];
  assert.deepEqual([icon.name, icon.bind.fontSize, icon.fills], ['icon-start', 'button/icon/size/small', 'button/label/color/accent/neutral/default']);
  const both = find('Emphasis=accent, Intent=neutral, Size=small, Leading icon=true, Trailing icon=true, State=default');
  assert.equal(both.root.bind.paddingRight, 'button/container/padding-inline/icon-side/small');

  const disabled = find('Emphasis=ghost, Intent=error, Size=large, Leading icon=false, Trailing icon=false, State=disabled');
  assert.equal(disabled.root.fills, 'button/container/background/ghost/disabled');
  const focus = find('Emphasis=subtle, Intent=brand, Size=medium, Leading icon=false, Trailing icon=false, State=focus-visible');
  assert.equal(focus.root.fills, 'button/container/background/subtle/brand/default');
  assert.equal(focus.root.focusRing.strokeWeight, 'button/container/outline-width/focus-visible');

  assert.deepEqual(plan.properties.filter((p) => p.kind === 'TEXT').map((p) => p.name).sort(), ['Label', 'Leading icon glyph', 'Trailing icon glyph']);
  assert.equal(plan.values[variableName('button.container.min-height.medium')], 36);
  for (const name of plan.variables.variables.map((v) => v.name)) assert.doesNotMatch(name, /[.{}$]/, name);
  assert.deepEqual(plan.variables.skipped, ['button/container/transition/duration', 'button/container/transition/easing']);
});

test('the fields\' placeholder colors are text fills, their start paddings and margins gaps', () => {
  const scopes = (id) => Object.fromEntries(figmaComponent(loaded, specOf(id), BLUEPRINTS[id]).variables.variables.map((v) => [v.name, v.scopes]));
  const tf = scopes('text-field');
  assert.deepEqual(tf['text-field/control/placeholder-color/default'], ['TEXT_FILL']);
  assert.deepEqual(tf['text-field/icon/placeholder-color/default'], ['TEXT_FILL']);
  assert.deepEqual(tf['text-field/control/padding-inline-start/medium'], ['GAP']);
  assert.deepEqual(tf['text-field/icon/margin-inline'], ['GAP']);
  assert.deepEqual(tf['text-field/asterisk/margin-inline-start/medium'], ['GAP']);
});

test('the Text field draws its outline flush, a severity at its own width at rest and at the focus width when focused', () => {
  const plan = figmaComponent(loaded, specOf('text-field'), BLUEPRINTS['text-field']);
  const ring = (severity, state) => plan.variants.find((v) => v.name === `Size=medium, Severity icon=message, Severity=${severity}, Content=value, Leading icon=false, State=${state}`).root.children.find((c) => c.name === 'control-row').children.find((c) => c.name === 'control').focusRing;
  assert.deepEqual(ring('none', 'focus-visible'), { strokeWeight: 'text-field/control/outline-width/focus-visible', offset: -0.6, stroke: 'text-field/control/outline-color/focus-visible' });
  assert.deepEqual(ring('error', 'default'), { strokeWeight: 'text-field/control/outline-width/error', offset: -0.6, stroke: 'text-field/control/outline-color/error' });
  assert.deepEqual(ring('warning', 'focus-visible'), { strokeWeight: 'text-field/control/outline-width/focus-visible', offset: -0.6, stroke: 'text-field/control/outline-color/warning' });
  assert.equal(ring('none', 'default'), undefined);
  assert.equal(ring('success', 'disabled'), undefined);
});

test('the Text field draws the severity icon after the control or at the start of the message, for every severity', () => {
  const plan = figmaComponent(loaded, specOf('text-field'), BLUEPRINTS['text-field']);
  const variant = (size, place, state) => plan.variants.find((v) => v.name === `Size=${size}, Severity icon=${place}, Severity=error, Content=value, Leading icon=false, State=${state}`).root;
  const iconIn = (node) => findNode(node, 'severity-icon');
  const row = (root) => root.children.find((c) => c.name === 'control-row');
  const msg = (root) => root.children.find((c) => c.name === 'message');
  const after = variant('small', 'after-control', 'default');
  assert.equal(iconIn(row(after)).bind.width, 'text-field/severity-icon/size/after-control/small');
  assert.equal(iconIn(row(after)).fills, 'text-field/severity-icon/color/error');
  assert.equal(row(after).bind.itemSpacing, 'text-field/severity-icon/gap/after-control');
  assert.equal(iconIn(msg(after)), undefined);
  const inMessage = variant('large', 'message', 'default');
  assert.equal(iconIn(msg(inMessage)).bind.width, 'text-field/severity-icon/size/message');
  assert.equal(msg(inMessage).bind.itemSpacing, 'text-field/severity-icon/gap/message');
  assert.equal(iconIn(row(inMessage)), undefined);
  assert.equal(iconIn(row(variant('medium', 'none', 'default'))), undefined);
  assert.equal(iconIn(msg(variant('medium', 'none', 'default'))), undefined);
  // Warning and success draw their own glyph in their own color (decision severity-icon-glyphs).
  const sev = (severity, place) => plan.variants.find((v) => v.name === `Size=medium, Severity icon=${place}, Severity=${severity}, Content=value, Leading icon=false, State=default`).root;
  assert.equal(iconIn(row(sev('warning', 'after-control'))).glyph, 'warning');
  assert.equal(iconIn(row(sev('warning', 'after-control'))).fills, 'text-field/severity-icon/color/warning');
  assert.equal(iconIn(msg(sev('success', 'message'))).glyph, 'check_circle');
  assert.equal(iconIn(msg(sev('success', 'message'))).fills, 'text-field/severity-icon/color/success');
});

test('the fields draw the message and the severity icon of the severity property, not only of the severity states', () => {
  for (const id of ['text-field', 'number-field', 'textarea']) {
    const plan = figmaComponent(loaded, specOf(id), BLUEPRINTS[id]);
    const find = (severity, state, place = 'message') => plan.variants.find((v) => v.name.includes(`Severity icon=${place}, Severity=${severity},`) && v.name.endsWith(`State=${state}`) && !v.name.includes('Leading icon=true')).root;
    const msg = (root) => root.children.find((c) => c.name === 'message');
    const icon = (node) => findNode(node, 'severity-icon');
    // The severity property alone, in any state: the message and its icon, as the template draws them.
    for (const state of ['default', 'hover', 'focus-visible', 'readonly', 'disabled']) {
      assert.ok(msg(find('error', state)), `${id}: Severity=error, State=${state} draws the message`);
      assert.equal(icon(msg(find('error', state))).glyph, 'error', `${id}: Severity=error, State=${state}`);
    }
    assert.equal(icon(msg(find('success', 'focus-visible'))).glyph, 'check_circle');
    const row = find('warning', 'default', 'after-control').children.find((c) => c.name === 'control-row');
    assert.equal(icon(row).glyph, 'warning');
    // No severity: no message.
    assert.equal(msg(find('none', 'default')), undefined);
  }
});

test('the fields center the message\'s icon on its first line: a frame as tall as the line, computed from message.typography', () => {
  // Small 14 px x 1.5 = 21, medium and large 16 px x 1.5 = 24: the web's calc(font-size * line-height).
  for (const id of ['text-field', 'number-field', 'textarea']) {
    const plan = figmaComponent(loaded, specOf(id), BLUEPRINTS[id]);
    for (const [size, height] of [['small', 21], ['medium', 24], ['large', 24]]) {
      const root = plan.variants.find((v) => v.name.startsWith(`Size=${size}, Severity icon=message, Severity=error,`) && v.name.endsWith('State=default')).root;
      const line = findNode(root.children.find((c) => c.name === 'message'), 'severity-icon-line');
      assert.equal(line.height, height, `${id} ${size}`);
      assert.deepEqual(line.align, { primary: 'CENTER', counter: 'CENTER' });
      assert.equal(line.children[0].name, 'severity-icon');
    }
    const none = plan.variants.find((v) => v.name.includes('Severity icon=none, Severity=error,')).root;
    assert.equal(findNode(none, 'severity-icon-line'), undefined);
  }
});

test('the Textarea sets its after-control icon level with the first line, below control.padding-block', () => {
  const plan = figmaComponent(loaded, specOf('textarea'), BLUEPRINTS.textarea);
  for (const size of ['small', 'medium', 'large']) {
    const root = plan.variants.find((v) => v.name.startsWith(`Size=${size}, Severity icon=after-control, Severity=warning,`) && v.name.endsWith('State=default')).root;
    const row = root.children.find((c) => c.name === 'control-row');
    assert.equal(row.align.counter, 'MIN');
    const inset = row.children.find((c) => c.name === 'severity-icon-inset');
    assert.equal(inset.bind.paddingTop, `textarea/control/padding-block/${size}`);
    assert.equal(inset.children[0].glyph, 'warning');
  }
  const none = plan.variants.find((v) => v.name.includes('Severity icon=after-control, Severity=none,')).root;
  assert.equal(findNode(none, 'severity-icon-inset'), undefined);
  // The Text field keeps its icon centered on the control, without the inset.
  const tf = figmaComponent(loaded, specOf('text-field'), BLUEPRINTS['text-field']);
  const row = tf.variants.find((v) => v.name.includes('Severity icon=after-control, Severity=error,')).root.children.find((c) => c.name === 'control-row');
  assert.equal(row.align.counter, 'CENTER');
  assert.equal(findNode(row, 'severity-icon-inset'), undefined);
});

test('State leaves out a state an enum axis sets: no variant names a severity twice or two of them', () => {
  for (const [id, blueprint] of Object.entries(BLUEPRINTS)) {
    const spec = specOf(id);
    const plan = figmaComponent(loaded, spec, blueprint);
    const state = plan.properties.find((p) => p.name === 'State');
    const axes = new Map(plan.properties.filter((p) => p.kind === 'VARIANT').map((p) => [p.name, p.values]));
    for (const s of spec.states.filter((s) => s.trigger === 'property' && s.value !== undefined)) {
      const property = spec.properties.find((p) => p.id === s.property);
      if (!axes.has(property.name)) continue;
      assert.ok(!state.values.includes(s.id), `${id}: State repeats ${property.name}=${s.value}`);
      assert.ok(axes.get(property.name).includes(String(s.value)), `${id}: ${property.name} draws ${s.value}`);
    }
  }
  const counts = { 'text-field': 720, 'number-field': 720, textarea: 360, select: 48, checkbox: 24, 'checkbox-group': 40, 'radio-group': 40, 'search-field': 24 };
  for (const [id, count] of Object.entries(counts)) assert.equal(figmaComponent(loaded, specOf(id), BLUEPRINTS[id]).variants.length, count, id);
  const plan = figmaComponent(loaded, specOf('text-field'), BLUEPRINTS['text-field']);
  assert.deepEqual(plan.properties.find((p) => p.name === 'State').values, ['default', 'hover', 'focus-visible', 'readonly', 'disabled']);
  assert.equal(new Set(plan.variants.map((v) => JSON.stringify(v.root))).size, 552);
  // The group's message follows the Severity axis, and the severity reaches every option.
  const group = figmaComponent(loaded, specOf('checkbox-group'), BLUEPRINTS['checkbox-group']);
  const g = (severity) => group.variants.find((v) => v.name === `Orientation=vertical, Size=medium, Severity=${severity}, State=default`).root;
  assert.ok(g('error').children.some((c) => c.name === 'message'));
  assert.ok(!g('none').children.some((c) => c.name === 'message'));
});

test('the Text field draws its leading icon over the start of the control, in the color of the text beside it', () => {
  const plan = figmaComponent(loaded, specOf('text-field'), BLUEPRINTS['text-field']);
  const root = (content, icon, state = 'default') => plan.variants.find((v) => v.name === `Size=small, Severity icon=message, Severity=none, Content=${content}, Leading icon=${icon}, State=${state}`).root;
  const row = (r) => r.children.find((c) => c.name === 'control-row');
  const glyph = (r) => row(r).children.find((c) => c.name === 'field')?.children.find((c) => c.name === 'icon-inset').children[0];
  const control = (r) => row(r).children.find((c) => c.name === 'field').children.find((c) => c.name === 'control');
  assert.equal(row(root('value', false)).children.find((c) => c.name === 'field'), undefined);
  assert.equal(glyph(root('value', true)).fills, 'text-field/icon/color/default');
  assert.equal(glyph(root('placeholder', true)).fills, 'text-field/icon/placeholder-color/default');
  assert.equal(glyph(root('placeholder', true, 'disabled')).fills, 'text-field/icon/placeholder-color/disabled');
  assert.equal(glyph(root('value', true)).bind.width, 'text-field/icon/size/small');
  assert.equal(control(root('value', true)).bind.paddingLeft, 'text-field/control/padding-inline-start/small');
});

test('the Icon draws its current color as neutral on each surface', () => {
  const icon = JSON.parse(fs.readFileSync(path.join(ROOT, artifacts('icon').spec), 'utf8'));
  const plan = figmaComponent(loaded, icon, BLUEPRINTS.icon);
  const glyph = (name) => plan.variants.find((v) => v.name === name).root.children[0];
  for (const surface of ['base', 'accent', 'subtle']) {
    const current = glyph(`Size=medium, Color=current, Surface=${surface}, State=default`);
    assert.ok(current.fills, `${surface}: current is bound`);
    assert.equal(current.fills, glyph(`Size=medium, Color=neutral, Surface=${surface}, State=default`).fills, surface);
  }
  assert.equal(glyph('Size=medium, Color=current, Surface=base, State=default').fills, 'icon/container/color/neutral');
});

test('a checked box in error binds the token for both states, its brand fill', () => {
  const find = (node, f) => (f(node) ? node : (node.children ?? []).map((c) => find(c, f)).find(Boolean));
  const fillOf = (v) => find(v.root, (n) => typeof n.fills === 'string' && n.fills.includes('/control/background/')).fills;
  for (const id of ['checkbox', 'checkbox-group', 'radio-group']) {
    const plan = figmaComponent(loaded, specOf(id), BLUEPRINTS[id]);
    const inError = plan.variants.filter((v) => /Severity=error/.test(v.name));
    const checked = inError.filter((v) => /State=checked/.test(v.name));
    assert.equal(checked.length, id === 'checkbox' ? 2 : 4, id);
    for (const v of checked) assert.equal(fillOf(v), `${id}/control/background/checked-error`, v.name);
    for (const v of inError.filter((v) => /State=indeterminate/.test(v.name))) assert.equal(fillOf(v), `${id}/control/background/indeterminate-error`, v.name);
    // An empty box in error keeps the error fill; the brand value is the checked fill's.
    assert.equal(fillOf(inError.find((v) => /State=default/.test(v.name))), `${id}/control/background/error`, id);
    assert.deepEqual(plan.values[`${id}/control/background/checked-error`], plan.values[`${id}/control/background/checked`], id);
  }
});

test('the fields draw the required mark with a BOOLEAN and a TEXT, markedFields out of the variant axes, never the asterisk', () => {
  const counts = { 'text-field': 720, 'number-field': 720, textarea: 360, 'search-field': 24 };
  for (const [id, count] of Object.entries(counts)) {
    const plan = figmaComponent(loaded, specOf(id), BLUEPRINTS[id]);
    assert.equal(plan.variants.length, count, `${id}: markedFields adds no variant`);
    assert.ok(!plan.properties.some((p) => p.name === 'Marked fields'), `${id}: no Marked fields axis`);
    assert.deepEqual(plan.properties.find((p) => p.name === 'Mark text'), { name: 'Mark text', kind: 'TEXT', default: '(optional)' });
    assert.deepEqual(plan.properties.find((p) => p.name === 'Mark'), { name: 'Mark', kind: 'BOOLEAN', default: id !== 'search-field' });
    assert.ok(!JSON.stringify(plan.variants).includes('"name":"asterisk"'), `${id}: the asterisk is not drawn`);
    assert.ok(plan.notDrawn.some((n) => n.slot === 'asterisk'), `${id}: the asterisk is listed as not drawn`);
  }
  const plan = figmaComponent(loaded, specOf('text-field'), BLUEPRINTS['text-field']);
  const row = (size, state = 'default') => plan.variants.find((v) => v.name === `Size=${size}, Severity icon=message, Severity=none, Content=value, Leading icon=false, State=${state}`).root.children.find((c) => c.name === 'label-row');
  const mark = (size, state) => row(size, state).children.find((c) => c.name === 'mark');
  assert.deepEqual(row('small').children.map((c) => c.name), ['label', 'mark']);
  assert.equal(mark('small').visibleProperty, 'Mark');
  assert.equal(mark('small').fills, 'text-field/mark/color/default');
  assert.equal(mark('small', 'disabled').fills, 'text-field/mark/color/disabled');
  assert.equal(mark('large').typography.fontWeight, 'text-field/mark/typography/large/font-weight');
  // The word space: a quarter of the mark's font size, as the web measures it (3.5 px at 14 px, 4 px at 16 px).
  assert.equal(row('small').set.itemSpacing, 3.5);
  assert.equal(row('medium').set.itemSpacing, 4);
});

test('figmaComponent refuses a fixed property that is no enum of the spec, or a value that is not one of its options', () => {
  const blueprint = { root: { type: 'frame' }, fixed: { tone: 'loud' } };
  assert.throws(() => figmaComponent(loaded, button, blueprint), /fixed names "tone", which is no enum property/);
  assert.throws(() => figmaComponent(loaded, button, { root: { type: 'frame' }, fixed: { size: 'huge' } }), /fixed sets size to "huge"/);
});

test('figmaComponent refuses a slot the component has no token for', () => {
  const blueprint = { root: { type: 'frame', bind: { fill: 'container.backgroud' } } };
  assert.throws(() => figmaComponent(loaded, button, blueprint), /"container.backgroud", which no token of the component has/);
});

// ---------------------------------------------------------------------------
// The plugin, run against a stand-in of the Figma plugin API
// ---------------------------------------------------------------------------

const SCOPES = {
  FLOAT: ['ALL_SCOPES', 'TEXT_CONTENT', 'CORNER_RADIUS', 'WIDTH_HEIGHT', 'GAP', 'OPACITY', 'COLOR_OPACITY', 'STROKE_FLOAT', 'EFFECT_FLOAT', 'FONT_WEIGHT', 'FONT_SIZE', 'LINE_HEIGHT', 'LETTER_SPACING', 'PARAGRAPH_SPACING', 'PARAGRAPH_INDENT'],
  COLOR: ['ALL_SCOPES', 'ALL_FILLS', 'FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR', 'EFFECT_COLOR'],
  STRING: ['ALL_SCOPES', 'TEXT_CONTENT', 'FONT_FAMILY', 'FONT_STYLE'],
};

/** A small stand-in of the Figma plugin API: enough of it, with its checks, to run the plugin. */
function fakeFigma({ fonts }) {
  let next = 0;
  const id = () => `${++next}:0`;
  const loadedFonts = new Set();
  const collections = [];
  const variables = [];

  const node = (type, extra = {}) => ({
    id: id(),
    type,
    name: '',
    children: [],
    bound: {},
    width: 10,
    height: 10,
    setBoundVariable(field, variable) {
      if (!variable || !variables.includes(variable)) throw new Error(`not a variable for ${field}`);
      this.bound[field] = variable.name;
    },
    appendChild(child) {
      this.children.push(child);
      child.parent = this;
    },
    resize(w, h) { this.width = w; this.height = h; },
    resizeWithoutConstraints(w, h) { this.width = w; this.height = h; },
    setSharedPluginData() {},
    ...extra,
  });
  const text = () => {
    const t = node('TEXT');
    let characters = '';
    Object.defineProperty(t, 'characters', {
      get: () => characters,
      set(v) {
        if (!loadedFonts.has(JSON.stringify(t.fontName))) throw new Error('font not loaded');
        characters = v;
      },
    });
    return t;
  };
  const page = node('PAGE', { name: 'Page 1', async loadAsync() {} });

  const messages = [];
  const figma = {
    messages,
    showUI(html, options) {
      if (typeof html !== 'string' || !options.themeColors) throw new Error('showUI: the window and its theme colors');
    },
    ui: {
      onmessage: null,
      postMessage(message) {
        messages.push(message);
        // The window's Close button, once the summary is shown.
        if (message.type === 'finished') setTimeout(() => figma.ui.onmessage({ type: 'close' }), 0);
      },
    },
    notify() {},
    root: { children: [page] },
    currentPage: page,
    viewport: { scrollAndZoomIntoView() {} },
    async setCurrentPageAsync(p) { figma.currentPage = p; },
    async loadFontAsync(font) {
      if (!(fonts[font.family] ?? []).includes(font.style)) throw new Error('no such font');
      loadedFonts.add(JSON.stringify(font));
    },
    createPage() {
      const p = node('PAGE', { async loadAsync() {} });
      figma.root.children.push(p);
      return p;
    },
    createComponent: () => node('COMPONENT', {
      createInstance() {
        const properties = this.parent?.properties ?? {};
        const componentProperties = Object.fromEntries(Object.entries(properties).map(([name, p]) => [`${name}#0:1`, { type: p.type, value: p.value }]));
        return node('INSTANCE', {
          mainComponent: this,
          componentProperties,
          setProperties(change) {
            for (const [key, value] of Object.entries(change)) {
              if (!(key in componentProperties)) throw new Error(`no property ${key}`);
              componentProperties[key].value = value;
            }
          },
        });
      },
    }),
    createFrame: () => node('FRAME'),
    createEllipse: () => node('ELLIPSE'),
    createVector: () => node('VECTOR'),
    createText: text,
    combineAsVariants(nodes, parent) {
      for (const n of nodes) n.variantProperties = Object.fromEntries(n.name.split(', ').map((pair) => pair.split('=')));
      const set = node('COMPONENT_SET', {
        properties: {},
        addComponentProperty(name, type, value) {
          this.properties[name] = { type, value };
          return `${name}#0:1`;
        },
      });
      nodes.forEach((n) => set.appendChild(n));
      parent.appendChild(set);
      return set;
    },
    variables: {
      async getLocalVariableCollectionsAsync() { return [...collections]; },
      async getLocalVariablesAsync() { return [...variables]; },
      createVariableCollection(name) {
        const c = {
          id: id(),
          name,
          modes: [{ modeId: id(), name: 'Mode 1' }],
          renameMode(modeId, n) { this.modes.find((m) => m.modeId === modeId).name = n; },
          addMode(n) {
            const modeId = id();
            this.modes.push({ modeId, name: n });
            return modeId;
          },
        };
        collections.push(c);
        return c;
      },
      createVariable(name, collection, type) {
        if (typeof collection !== 'object') throw new Error('pass the collection, not its id');
        if (variables.some((v) => v.variableCollectionId === collection.id && v.name === name)) throw new Error(`duplicate variable ${name}`);
        let scopes = ['ALL_SCOPES'];
        const v = {
          id: id(),
          name,
          resolvedType: type,
          variableCollectionId: collection.id,
          valuesByMode: {},
          codeSyntax: {},
          get scopes() { return scopes; },
          set scopes(list) {
            if (list.some((s) => !SCOPES[type].includes(s))) throw new Error(`invalid scopes ${list} for ${type}`);
            if (list.includes('ALL_SCOPES') && list.length > 1) throw new Error('ALL_SCOPES must be alone');
            scopes = list;
          },
          setValueForMode(modeId, value) {
            if (!collection.modes.some((m) => m.modeId === modeId)) throw new Error('unknown mode');
            const ok = value?.type === 'VARIABLE_ALIAS'
              || (type === 'COLOR' && ['r', 'g', 'b', 'a'].every((k) => typeof value[k] === 'number'))
              || (type === 'FLOAT' && typeof value === 'number')
              || (type === 'STRING' && typeof value === 'string');
            if (!ok) throw new Error(`invalid ${type} value for ${name}: ${JSON.stringify(value)}`);
            this.valuesByMode[modeId] = value;
          },
          setVariableCodeSyntax(platform, syntax) { this.codeSyntax[platform] = syntax; },
        };
        variables.push(v);
        return v;
      },
      createVariableAlias: (v) => ({ type: 'VARIABLE_ALIAS', id: v.id }),
      setBoundVariableForPaint(paint, field, v) {
        if (!variables.includes(v)) throw new Error('not a variable');
        return { ...paint, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: v.id } } };
      },
    },
  };
  return { figma, collections, variables, page };
}

function runPlugin(fake, ids = ['button']) {
  const plan = pluginPlan(loaded, ids.map(specOf), BLUEPRINTS);
  const source = fs.readFileSync(path.join(ROOT, PATHS.figma, 'src/plugin.js'), 'utf8');
  const logs = [];
  const closed = new Promise((resolve) => { fake.figma.closePlugin = resolve; });
  new Function('figma', 'console', 'PLAN', '__html__', source)(fake.figma, { warn: (m) => logs.push(m) }, plan, '<!doctype html>');
  return closed.then((message) => ({ message, logs, plan }));
}

const FONTS = { Inter: ['Regular', 'Medium', 'Semi Bold'], 'Material Symbols Outlined': ['Light'] };

test('the plugin creates the variables and draws the Button bound to them', async () => {
  const fake = fakeFigma({ fonts: FONTS });
  const { message, logs, plan } = await runPlugin(fake);
  assert.deepEqual(logs, []);
  assert.equal(fake.figma.root.children.find((p) => p.name === 'Button').children.length, 1);
  assert.equal(message, `Quantum: 1 component drawn (${plan.components[0].variants.length} variants), ${plan.variables.variables.length} variables.`);
  assert.deepEqual(fake.collections.map((c) => [c.name, c.modes.map((m) => m.name)]), [
    ['Quantum / Raw', ['Value']],
    ['Quantum / Semantic', ['Light', 'Dark']],
    ['Quantum / Components', ['Value']],
  ]);
  const byName = new Map(fake.variables.map((v) => [v.name, v]));
  const fill = byName.get('button/container/background/accent/neutral/default');
  assert.equal(Object.values(fill.valuesByMode)[0].id, byName.get('global/bg/accent/neutral/default').id);
  assert.equal(fill.codeSyntax.WEB, 'var(--button-container-background-accent-neutral-default)');

  const page = fake.figma.root.children.find((p) => p.name === 'Button');
  const set = page.children[0];
  assert.equal(set.type, 'COMPONENT_SET');
  assert.deepEqual(Object.keys(set.properties), ['Leading icon glyph', 'Label', 'Trailing icon glyph']);
  const first = set.children[0];
  assert.equal(first.minHeight, 36);
  assert.equal(first.bound.minHeight, 'button/container/min-height/medium');
  assert.equal(first.bound.paddingLeft, 'button/container/padding-inline/medium');
  assert.equal(first.fills[0].boundVariables.color.id, byName.get('button/container/background/subtle/neutral/default').id);
  const label = first.children.find((n) => n.name === 'label');
  assert.equal(label.characters, 'Button');
  assert.deepEqual(label.componentPropertyReferences, { characters: 'Label#0:1' });
  assert.equal(label.bound.fontSize, 'button/label/typography/medium/font-size');
  const focus = set.children.find((n) => n.name.includes('State=focus-visible'));
  assert.equal(focus.children.find((n) => n.name === 'focus-ring').bound.strokeWeight, 'button/container/outline-width/focus-visible');
});

test('the plugin updates the variables in place and leaves an existing component set alone', async () => {
  const fake = fakeFigma({ fonts: FONTS });
  await runPlugin(fake);
  const count = fake.variables.length;
  const { message } = await runPlugin(fake);
  assert.equal(fake.variables.length, count);
  assert.match(message, /no component drawn, 1 kept/);
  assert.equal(fake.figma.root.children.find((p) => p.name === 'Button').children.length, 1);
});

test('without the icon font, the plugin draws placeholder icons and says so', async () => {
  const fake = fakeFigma({ fonts: { Inter: FONTS.Inter } });
  const { message, logs } = await runPlugin(fake);
  assert.match(message, /1 warning/);
  assert.match(logs[0], /The font "Material Symbols Outlined" is not available/);
});

test('the plugin draws every component, instances of the components they use included', async () => {
  const fake = fakeFigma({ fonts: FONTS });
  const { message, logs, plan } = await runPlugin(fake, Object.keys(BLUEPRINTS));
  assert.deepEqual(logs, []);
  assert.doesNotMatch(message, /warning|no component drawn|kept|failed/);
  for (const c of plan.components) {
    const page = fake.figma.root.children.find((p) => p.name === c.page);
    assert.equal(page.children[0].children.length, c.variants.length, c.id);
  }
});

test('the plugin reports its progress to its window, then waits for Close', async () => {
  const fake = fakeFigma({ fonts: FONTS });
  const { plan } = await runPlugin(fake);
  const messages = fake.figma.messages;
  assert.deepEqual(messages.slice(0, 2).map((m) => [m.type, m.status]), [['variables', 'running'], ['variables', 'done']]);
  const button = messages.filter((m) => m.type === 'component');
  assert.deepEqual([button[0].status, button[0].drawn], ['running', 0]);
  assert.ok(button.some((m) => m.status === 'running' && m.drawn > 0), 'progress while drawing');
  assert.deepEqual([button.at(-1).status, button.at(-1).drawn, button.at(-1).total], ['done', plan.components[0].variants.length, plan.components[0].variants.length]);
  assert.equal(messages.at(-1).type, 'finished');
  assert.deepEqual(messages.at(-1).warnings, []);
});

test('a component that cannot be drawn fails alone; the others are drawn', async () => {
  const fake = fakeFigma({ fonts: FONTS });
  const createEllipse = fake.figma.createEllipse;
  fake.figma.createEllipse = () => { throw new Error('no ellipse today'); };
  const { message } = await runPlugin(fake, ['badge', 'spinner']);
  fake.figma.createEllipse = createEllipse;
  const finals = fake.figma.messages.filter((m) => m.type === 'component' && m.status !== 'running').map((m) => [m.id, m.status]);
  assert.deepEqual(finals, [['badge', 'done'], ['spinner', 'failed']]);
  assert.match(message, /1 component drawn \(24 variants\), 1 failed, .* 1 warning,/);
});

test('the plugin window is built with the design system', () => {
  const plan = pluginPlan(loaded, ['button', 'badge'].map(specOf), BLUEPRINTS);
  const html = renderUi(plan, { fonts: '', css: '' });
  for (const c of ['variables', 'button', 'badge']) assert.match(html, new RegExp(`class="qf-row" data-key="${c}"`));
  assert.match(html, /class="ds-progress-bar"/);
  assert.match(html, /<button [^>]*class="ds-button"[^>]*id="qf-close"|<button [^>]*id="qf-close"[^>]*class="ds-button/);
  assert.equal((html.match(/class="ds-badge"/g) ?? []).length, 3);
  // Its own layout follows the docs site's rules: semantic tokens only.
  const vars = { raw: new Set(), semantic: new Set(), component: new Set() };
  for (const tier of loaded.tiers) for (const t of tier.tokens) {
    try {
      for (const [name] of cssDeclarations(t, loaded.byPath, loaded.config.css)) vars[tier.name]?.add(name);
    } catch { /* reported by validate */ }
  }
  const css = fs.readFileSync(path.join(ROOT, PATHS.figma, 'src/ui/ui.css'), 'utf8');
  assert.deepEqual(checkSiteCss(css, vars, { own: /^--qf-/, who: 'the plugin window' }).filter((p) => p.level === 'error'), []);
});
