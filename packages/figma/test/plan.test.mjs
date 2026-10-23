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
  assert.equal(first.name, 'Emphasis=accent, Intent=neutral, Size=medium, Leading icon=false, Trailing icon=false, State=default');
  assert.deepEqual([first.row, first.column], [0, 0]);
  assert.equal(first.root.fills, 'button/container/background/accent/neutral/default');
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
  assert.equal(first.fills[0].boundVariables.color.id, fill.id);
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
