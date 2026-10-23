import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../../../scripts/lib/dtcg.mjs';
import { figmaComponent } from '../../figma/src/plan.mjs';
import { BLUEPRINTS } from '../../figma/src/blueprints/index.mjs';
import { penpotPlan, penpotTokens, penpotComponent, tokensOf, referencesOf, hexColor, APPLIES, UNBOUND, APPROXIMATIONS, MANIFEST } from '../src/plan.mjs';
import { renderUi } from '../src/ui/ui.mjs';
import { PATHS, FILES, artifacts } from '../../../scripts/lib/paths.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const loaded = loadAll(path.join(ROOT, PATHS.tokens));
const tokenFile = JSON.parse(fs.readFileSync(path.join(ROOT, FILES.penpotTokens), 'utf8'));
const specOf = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, artifacts(id).spec), 'utf8'));
const planOf = (ids) => penpotPlan(loaded, ids.map(specOf), BLUEPRINTS, tokenFile);

test('hexColor and referencesOf read colors and references as Penpot writes them', () => {
  assert.deepEqual(hexColor({ r: 1, g: 0.5, b: 0, a: 0.1 }), { color: '#FF8000', opacity: 0.1 });
  assert.deepEqual(hexColor('#11223380'), { color: '#112233', opacity: 0.502 });
  assert.deepEqual(referencesOf({ fontFamily: '{body.family}', fontSize: '{body.size.md}', lineHeight: 1.2 }), ['body.family', 'body.size.md']);
  assert.deepEqual(referencesOf('{space.4} * 2'), ['space.4']);
});

test('penpotTokens keeps what the names reach, references first, in every set, with the themes', () => {
  const file = {
    Foundation: {
      grey: { 100: { $type: 'color', $value: '#eeeeee' }, 900: { $type: 'color', $value: '#111111' }, 500: { $type: 'color', $value: '#777777' } },
      bg: { $type: 'color', $value: '{grey.100}' },
      family: { $type: 'fontFamily', $value: 'Inter' },
      text: { $type: 'typography', $value: { fontFamily: '{family}', fontSize: '16px' } },
    },
    Component: { chip: { background: { $type: 'color', $value: '{bg}' }, label: { $type: 'typography', $value: '{text}' } } },
    'Mode/Light': {},
    'Mode/Dark': { bg: { $type: 'color', $value: '{grey.900}' } },
    $themes: [
      { name: 'Light', group: 'Mode', selectedTokenSets: { Foundation: 'enabled', Component: 'enabled', 'Mode/Light': 'enabled' } },
      { name: 'Dark', group: 'Mode', selectedTokenSets: { Foundation: 'enabled', Component: 'enabled', 'Mode/Dark': 'enabled' } },
    ],
    $metadata: { tokenSetOrder: ['Foundation', 'Component', 'Mode/Light', 'Mode/Dark'], activeThemes: ['Mode/Light'] },
  };
  const { sets, tokens, themes, active } = penpotTokens(file, ['chip.background', 'chip.label']);
  assert.deepEqual(sets, ['Foundation', 'Component', 'Mode/Light', 'Mode/Dark']);
  const order = tokens.map((t) => `${t.set}:${t.name}`);
  // grey.500 is reached by nothing; a reference always comes before the token reading it, in any set.
  assert.ok(!order.some((o) => o.endsWith('grey.500')));
  for (const [before, after] of [['grey.100', 'bg'], ['grey.900', 'bg'], ['bg', 'chip.background'], ['family', 'text'], ['text', 'chip.label']]) {
    assert.ok(order.findIndex((o) => o.endsWith(`:${before}`)) < order.findIndex((o) => o.endsWith(`:${after}`)), `${before} before ${after}`);
  }
  assert.deepEqual(order.filter((o) => o.endsWith(':bg')), ['Foundation:bg', 'Mode/Dark:bg']);
  assert.equal(tokens.find((t) => t.name === 'family').type, 'fontFamilies');
  assert.deepEqual(themes.map((t) => [t.group, t.name, t.sets]), [['Mode', 'Light', ['Foundation', 'Component', 'Mode/Light']], ['Mode', 'Dark', ['Foundation', 'Component', 'Mode/Dark']]]);
  assert.deepEqual(active, ['Mode/Light']);
  assert.throws(() => penpotTokens(file, ['chip.border']), /"chip.border", which the Penpot token file does not hold/);
});

test('every component plan binds tokens Penpot holds, to properties their type can drive', () => {
  const plan = planOf(Object.keys(BLUEPRINTS));
  const types = new Map(plan.tokens.tokens.map((t) => [t.name, t.type]));
  const reasons = new Set([UNBOUND.rootMin, ...Object.keys(APPLIES).flatMap((type) => ['fontSize', 'width', 'height'].map((p) => UNBOUND.type(type, p)))]);
  const check = (id, node) => {
    for (const [property, name] of Object.entries(node.bind ?? {})) {
      assert.ok(types.has(name), `${id}: ${name} is a token`);
      assert.ok(APPLIES[types.get(name)].includes(property), `${id}: a ${types.get(name)} token on ${property}`);
    }
    for (const name of [node.fill, node.stroke, node.typography, node.border?.color, node.border?.width, node.focusRing?.color, node.focusRing?.width].filter(Boolean)) {
      assert.ok(types.has(name), `${id}: ${name} is a token`);
      assert.ok(name in plan.values, `${id}: ${name} has a value`);
    }
    (node.children ?? []).forEach((c) => check(id, c));
  };
  for (const c of plan.components) {
    assert.deepEqual(c.uncovered, [], `${c.id}: slots neither bound nor listed in notDrawn`);
    c.variants.forEach((v) => check(c.id, v.root));
    for (const u of c.unbound) assert.ok(reasons.has(u.reason), `${c.id}: ${u.reason}`);
    for (const a of c.approximations) assert.ok(Object.values(APPROXIMATIONS).includes(a), `${c.id}: ${a}`);
    assert.equal(new Set(c.variants.map((v) => JSON.stringify(v.props))).size, c.variants.length, `${c.id}: variant properties are unique`);
  }
  // Every token of a drawn component the Penpot file holds is written, with what it references.
  const written = new Set(plan.tokens.tokens.map((t) => t.name));
  for (const t of tokensOf(tokenFile).filter((t) => t.set === 'Component')) assert.ok(written.has(t.name), t.name);
});

test('the Button plan binds, in each variant, the tokens the web reads', () => {
  const plan = planOf(['button']);
  const [button] = plan.components;
  const figma = figmaComponent(loaded, specOf('button'), BLUEPRINTS.button);
  assert.equal(button.variants.length, figma.variants.length);
  const first = button.variants[0];
  assert.deepEqual(first.props, { Emphasis: 'accent', Intent: 'neutral', Size: 'medium', 'Leading icon': 'false', 'Trailing icon': 'false', State: 'default' });
  assert.deepEqual([first.root.type, first.root.layout, first.root.justify, first.root.align], ['board', 'row', 'center', 'center']);
  assert.equal(first.root.fill, 'button.container.background.accent.neutral.default');
  assert.equal(first.root.bind.paddingLeft, 'button.container.padding-inline.medium');
  assert.equal(first.root.bind.columnGap, 'button.container.gap.medium');
  assert.equal(first.root.bind.borderRadiusTopLeft, 'button.container.border-radius.medium');
  assert.equal(first.root.bind.layoutItemMinH, 'button.container.min-height.medium');
  const label = first.root.children[0];
  assert.deepEqual([label.type, label.typography, label.fill], ['text', 'button.label.typography.medium', 'button.label.color.accent.neutral.default']);
  assert.deepEqual(plan.values['button.label.typography.medium'], { fontFamily: 'Inter', fontSize: 16, fontWeight: 500, letterSpacing: -0.48, lineHeight: 1 });
  assert.equal(plan.values['button.container.min-height.medium'], 36);
  assert.deepEqual(plan.values['button.container.background.accent.neutral.default'], { color: '#201E1F', opacity: 1 });

  const leading = button.variants.find((v) => v.props['Leading icon'] === 'true' && v.props.Size === 'small' && v.props.State === 'default' && v.props['Trailing icon'] === 'false');
  const icon = leading.root.children[0];
  assert.deepEqual([icon.type, icon.name, icon.glyph, icon.bind.width, icon.bind.fontFamilies], ['icon', 'icon-start', 'add', 'button.icon.size.small', 'button.icon.font-family']);
  // A sizing token cannot set a font size in Penpot: the glyph's size is its value.
  assert.equal(icon.set.fontSize, plan.values['button.icon.size.small']);
  assert.deepEqual(button.unbound.map((u) => u.reason).sort(), [UNBOUND.rootMin, UNBOUND.type('sizing', 'fontSize')].sort());

  const focus = button.variants.find((v) => v.props.State === 'focus-visible');
  assert.deepEqual(focus.root.focusRing, { width: 'button.container.outline-width.focus-visible', offset: 'button.container.outline-offset.focus-visible', color: 'button.container.outline-color.focus-visible' });
  assert.equal(first.root.focusRing, undefined);
  assert.deepEqual(button.properties.map((p) => p.name), ['Emphasis', 'Intent', 'Size', 'Leading icon', 'Trailing icon', 'State']);
  assert.deepEqual(button.textLayers, { 'Leading icon glyph': 'icon-start', Label: 'label', 'Trailing icon glyph': 'icon-end' });
});

test('penpotComponent turns a one-sided border, an arc and a hidden part into what Penpot draws', () => {
  const plan = planOf(['accordion', 'spinner', 'alert', 'checkbox-group']);
  const byId = Object.fromEntries(plan.components.map((c) => [c.id, c]));
  const walk = (node, fn) => { fn(node); (node.children ?? []).forEach((c) => walk(c, fn)); };
  const items = [];
  walk(byId.accordion.variants[0].root, (n) => n.border && items.push(n));
  assert.deepEqual(items[0].border, { side: 'bottom', width: 'accordion.item.border-width', color: 'accordion.item.border-color' });
  assert.equal(items[0].stroke, undefined);
  const arcs = [];
  walk(byId.spinner.variants[0].root, (n) => n.arc && arcs.push(n));
  assert.deepEqual([arcs[0].type, arcs[0].arc, arcs[0].stroke], ['ellipse', [0.625, 0.875], 'spinner.ring.color']);
  const hidden = [];
  walk(byId['checkbox-group'].variants[0].root, (n) => n.visibleProperty && hidden.push([n.visibleProperty, n.hidden]));
  assert.ok(hidden.some(([p, h]) => p === 'Show description' && h === true));
  walk(byId.alert.variants[0].root, (n) => n.visibleProperty === 'Show title' && assert.equal(n.hidden, false));
  assert.deepEqual(byId.accordion.approximations, [APPROXIMATIONS.side]);
});

// ---------------------------------------------------------------------------
// The plugin, run against a stand-in of the Penpot plugin API
// ---------------------------------------------------------------------------

/** The properties each token type drives (plugin API 1.5), and what each shape takes (Penpot's token attributes). */
const DRIVES = {
  borderRadius: ['borderRadiusTopLeft', 'borderRadiusTopRight', 'borderRadiusBottomRight', 'borderRadiusBottomLeft'],
  color: ['fill', 'strokeColor'],
  dimension: ['x', 'y', 'strokeWidth'],
  fontFamilies: ['fontFamilies'],
  fontSizes: ['fontSize'],
  fontWeights: ['fontWeight'],
  letterSpacing: ['letterSpacing'],
  number: ['rotation'],
  opacity: ['opacity'],
  sizing: ['width', 'height', 'layoutItemMinW', 'layoutItemMaxW', 'layoutItemMinH', 'layoutItemMaxH'],
  spacing: ['rowGap', 'columnGap', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom'],
  borderWidth: ['strokeWidth'],
  typography: ['typography'],
  shadow: ['shadow'],
};
const GENERIC = ['fill', 'strokeColor', 'strokeWidth', 'rotation', 'width', 'height', 'layoutItemMinW', 'layoutItemMaxW', 'layoutItemMinH', 'layoutItemMaxH', 'opacity', 'shadow', 'x', 'y'];
const TAKES = (shape) => [
  ...GENERIC,
  ...(['board', 'rectangle'].includes(shape.type) ? DRIVES.borderRadius : []),
  ...(shape.type === 'board' && shape.flex ? ['rowGap', 'columnGap', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'] : []),
  ...(shape.type === 'text' ? ['fontFamilies', 'fontSize', 'fontWeight', 'letterSpacing', 'typography', 'rotation'] : []),
];

/** Changes the stand-in received: every one is a commit in Penpot, what makes a run slow. */
const changes = { count: 0, quiet: 0 };
/** Runs the stand-in's own bookkeeping: what Penpot does inside one change is not another one. */
const quietly = (fn) => {
  changes.quiet += 1;
  try {
    return fn();
  } finally {
    changes.quiet -= 1;
  }
};

/** An object whose enumerated fields refuse a value Penpot refuses; every write is a change. */
function checked(target, rules) {
  return new Proxy(target, {
    set(obj, key, value) {
      if (!changes.quiet) changes.count += 1;
      // A variant's main component renamed `Size=small, State=hover` takes those properties (Penpot 2.18).
      if (key === 'name' && obj.isMain && obj.component.variants?.formula) obj.component.variants.formula(obj.component, value);
      if (rules[key] && !rules[key](value)) throw new Error(`invalid ${String(key)}: ${JSON.stringify(value)}`);
      obj[key] = value;
      return true;
    },
  });
}
const oneOf = (...values) => (v) => values.includes(v);
const number = (v) => typeof v === 'number' && Number.isFinite(v);
const numeric = (v) => typeof v === 'string' && Number.isFinite(Number(v));

/** A small stand-in of the Penpot plugin API: enough of it, with its checks, to run the plugin. */
function fakePenpot({ fonts, before219 = false, formula = true }) {
  let next = 0;
  const id = () => `id-${++next}`;
  const messages = [];
  const listeners = {};
  const flags = { naturalChildOrdering: false, throwValidationErrors: true };
  const file = { pages: [] };
  let current;

  const page = (name) => {
    const p = { id: id(), name, shapes: [], findShapes: ({ name: n, type } = {}) => p.shapes.filter((s) => (!n || s.name === n) && (!type || s.type === type)) };
    file.pages.push(p);
    return p;
  };
  current = page('Page 1');
  const onCurrentPage = (shape, what) => {
    if (shape.page !== current) throw new Error(`${what}: cannot modify a page that is not currently active`);
  };

  const strokeRules = (s) => oneOf('center', 'inner', 'outer')(s.strokeAlignment) && number(s.strokeWidth) && /^#[0-9A-F]{6}$/.test(s.strokeColor) && s.strokeOpacity >= 0 && s.strokeOpacity <= 1;
  const fillRules = (f) => /^#[0-9A-F]{6}$/.test(f.fillColor) && f.fillOpacity >= 0 && f.fillOpacity <= 1;

  const shape = (type, extra = {}) => {
    const s = checked({
      id: id(),
      type,
      name: '',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      children: [],
      parent: null,
      page: current,
      fills: type === 'board' ? [{ fillColor: '#FFFFFF', fillOpacity: 1 }] : [],
      strokes: [],
      tokens: {},
      hidden: false,
      borderRadiusTopLeft: 0,
      pluginData: {},
      resize(w, h) {
        changes.count += 1;
        if (!number(w) || !number(h) || w < 0 || h < 0) throw new Error(`invalid size ${w} x ${h}`);
        quietly(() => {
          this.width = w;
          this.height = h;
          if (this.type === 'text') this.growType = 'fixed';
        });
      },
      appendChild(child) {
        changes.count += 1;
        if (this.type !== 'board') throw new Error(`appendChild on a ${this.type}`);
        if (!flags.naturalChildOrdering) throw new Error('the plugin relies on naturalChildOrdering');
        onCurrentPage(this, 'appendChild');
        onCurrentPage(child, 'appendChild');
        quietly(() => {
          if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
          this.children.push(child);
          child.parent = this;
          child.layoutChild = this.flex ? checked({ absolute: false, minWidth: null, minHeight: null, maxWidth: null }, { horizontalSizing: oneOf('auto', 'fill', 'fix'), verticalSizing: oneOf('auto', 'fill', 'fix'), absolute: (v) => typeof v === 'boolean' }) : undefined;
        });
      },
      addFlexLayout() {
        changes.count += 1;
        quietly(() => { this.flex = checked({ rowGap: 0, columnGap: 0, topPadding: 0, rightPadding: 0, bottomPadding: 0, leftPadding: 0 }, {
          dir: oneOf('row', 'row-reverse', 'column', 'column-reverse'),
          wrap: oneOf('wrap', 'nowrap'),
          justifyContent: oneOf('start', 'center', 'end', 'space-between', 'space-around', 'space-evenly', 'stretch'),
          alignItems: oneOf('start', 'end', 'center', 'stretch'),
          horizontalSizing: oneOf('fix', 'auto'),
          verticalSizing: oneOf('fix', 'auto'),
          ...Object.fromEntries(['rowGap', 'columnGap', 'topPadding', 'rightPadding', 'bottomPadding', 'leftPadding'].map((k) => [k, number])),
        }); });
        return this.flex;
      },
      applyToken(token, properties) {
        changes.count += 1;
        onCurrentPage(this, 'applyToken');
        if (!token || !catalog.sets.some((set) => set.tokens.includes(token))) throw new Error('not a token of the catalog');
        for (let p of properties) {
          // Before Penpot 2.19, a font family token was applied to `fontFamily`, and `fontFamilies` refused.
          if (before219 && p === 'fontFamilies') throw new Error('unknown token property fontFamilies');
          if (before219 && p === 'fontFamily') p = 'fontFamilies';
          if (!DRIVES[token.type].includes(p)) throw new Error(`a ${token.type} token cannot be applied to ${p}`);
          if (!TAKES(this).includes(p)) throw new Error(`a ${this.type}${this.flex ? ' with a layout' : ''} takes no ${p} token`);
          if ((p === 'strokeColor' || p === 'strokeWidth') && !this.strokes.length) throw new Error(`${p} without a stroke`);
          this.tokens[p] = token.name;
          // Penpot writes the token's value, resolved in the active sets, into the property.
          quietly(() => applyValue(this, p, resolve(token.name)));
        }
      },
      setSharedPluginData(namespace, key, value) { this.pluginData[`${namespace}/${key}`] = value; },
      /** A copy of the tree, values and applied tokens included, in one change, at the top of the page. */
      clone() {
        onCurrentPage(this, 'clone');
        const count = changes.count;
        const copy = (source) => {
          const data = {};
          for (const [key, value] of Object.entries(source)) {
            if (['id', 'children', 'parent', 'page', 'flex', 'layoutChild'].includes(key) || typeof value === 'function') continue;
            data[key] = key === 'component' || !value || typeof value !== 'object' ? value : JSON.parse(JSON.stringify(value));
          }
          const c = shape(source.type, data);
          if (source.flex) Object.assign(c.addFlexLayout(), { ...source.flex });
          for (const child of source.children) {
            const cc = copy(child);
            c.children.push(cc);
            cc.parent = c;
            cc.layoutChild = child.layoutChild ? checked({ ...child.layoutChild }, {}) : undefined;
          }
          return c;
        };
        const c = quietly(() => copy(this));
        changes.count = count + 1;
        return c;
      },
      remove() {
        if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
        current.shapes.splice(current.shapes.indexOf(this), 1);
      },
      isVariantContainer() { return false; },
      ...extra,
    }, {
      fills: (list) => Array.isArray(list) && list.every(fillRules),
      strokes: (list) => Array.isArray(list) && list.every(strokeRules),
      x: number,
      y: number,
      opacity: (v) => number(v) && v >= 0 && v <= 1,
      growType: oneOf('fixed', 'auto-width', 'auto-height'),
      fontSize: numeric,
      lineHeight: numeric,
      letterSpacing: numeric,
      textDecoration: oneOf('underline', 'line-through', null),
      align: oneOf('left', 'center', 'right', 'justify'),
      verticalAlign: oneOf('top', 'center', 'bottom'),
      constraintsHorizontal: oneOf('left', 'right', 'leftright', 'center', 'scale'),
      constraintsVertical: oneOf('top', 'bottom', 'topbottom', 'center', 'scale'),
      d: (v) => typeof v === 'string' && /^M [-\d. ]+([LA] [-\d. ]+)*$/.test(v),
      characters: (v) => typeof v === 'string' && v.length > 0,
    });
    current.shapes.push(s);
    changes.count += 1;
    return s;
  };

  /** A token's value in the active sets (the later set wins), its references followed. */
  const resolve = (name) => {
    const found = catalog.sets.filter((s) => s.active).flatMap((s) => s.tokens.filter((t) => t.name === name)).at(-1);
    if (!found) throw new Error(`token "${name}" is in no active set`);
    const follow = (v) => {
      if (typeof v === 'string' && /^\{[^{}]+\}$/.test(v)) return resolve(v.slice(1, -1));
      if (v && typeof v === 'object' && !Array.isArray(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, follow(x)]));
      return v;
    };
    return follow(found.value);
  };
  const hex = (v) => {
    const m = String(v).match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/);
    if (!m) return { fillColor: String(v).toUpperCase(), fillOpacity: 1 };
    const h = (n) => Number(n).toString(16).padStart(2, '0').toUpperCase();
    return { fillColor: `#${h(m[1])}${h(m[2])}${h(m[3])}`, fillOpacity: m[4] === undefined ? 1 : Number(m[4]) };
  };
  const num = (v) => Number.parseFloat(v);
  const family = (v) => (Array.isArray(v) ? v[0] : String(v).split(',')[0].trim());
  const applyValue = (shape, property, value) => {
    const paddings = { paddingTop: 'topPadding', paddingRight: 'rightPadding', paddingBottom: 'bottomPadding', paddingLeft: 'leftPadding' };
    const limits = { layoutItemMinW: 'minWidth', layoutItemMinH: 'minHeight', layoutItemMaxW: 'maxWidth', layoutItemMaxH: 'maxHeight' };
    if (property === 'fill') shape.fills = [hex(value), ...shape.fills.slice(1)];
    else if (property === 'strokeColor') shape.strokes = shape.strokes.map((s) => ({ ...s, strokeColor: hex(value).fillColor, strokeOpacity: hex(value).fillOpacity }));
    else if (property === 'strokeWidth') shape.strokes = shape.strokes.map((s) => ({ ...s, strokeWidth: num(value) }));
    else if (paddings[property]) shape.flex[paddings[property]] = num(value);
    else if (property === 'rowGap' || property === 'columnGap') shape.flex[property] = num(value);
    else if (limits[property]) { if (shape.layoutChild) shape.layoutChild[limits[property]] = num(value); }
    else if (property === 'width') shape.resize(num(value), shape.height);
    else if (property === 'height') shape.resize(shape.width, num(value));
    else if (property.startsWith('borderRadius') || property === 'opacity') shape[property] = num(value);
    else if (property === 'fontFamilies') shape.fontFamily = family(value);
    else if (property === 'fontWeight') shape.fontWeight = String(value);
    else if (property === 'fontSize' || property === 'letterSpacing') shape[property] = String(num(value));
    else if (property === 'typography') {
      shape.fontFamily = family(value.fontFamily);
      shape.fontWeight = String(value.fontWeight);
      shape.fontSize = String(num(value.fontSize));
      shape.lineHeight = String(value.lineHeight);
      if (value.letterSpacing !== undefined) shape.letterSpacing = String(num(value.letterSpacing));
    }
  };

  /** A copy of a main component's tree, as component.instance() makes it. */
  const copyOf = (main) => {
    const copy = shape(main.type, { name: main.name, characters: main.characters, component: main.component });
    for (const child of main.children) {
      const c = copyOf(child);
      copy.children.push(c);
      c.parent = copy;
    }
    return copy;
  };

  const catalog = {
    sets: [],
    themes: [],
    addSet({ name }) {
      const set = {
        id: id(),
        name,
        active: false,
        tokens: [],
        addToken({ type, name: tokenName, value }) {
          if (!DRIVES[type]) throw new Error(`unknown token type ${type}`);
          if (!/^[a-zA-Z0-9_-][a-zA-Z0-9$_-]*(\.[a-zA-Z0-9$_-]+)*$/.test(tokenName)) throw new Error(`invalid token name ${tokenName}`);
          if (this.tokens.some((t) => t.name === tokenName)) throw new Error(`duplicate token ${tokenName}`);
          // Penpot resolves a new token against every set: a reference to a missing token fails.
          if (referencesOf(value).some((r) => !catalog.sets.some((s) => s.tokens.some((t) => t.name === r)))) return null;
          const token = { id: id(), name: tokenName, type, value, description: '' };
          this.tokens.push(token);
          return token;
        },
        toggleActive() { this.active = !this.active; },
      };
      catalog.sets.push(set);
      return set;
    },
    addTheme({ group, name }) {
      const theme = {
        id: id(),
        group,
        name,
        active: false,
        activeSets: [],
        addSet(set) { this.activeSets.push(set); },
        toggleActive() {
          catalog.themes.filter((t) => t.group === this.group).forEach((t) => { t.active = false; });
          this.active = true;
          this.activeSets.forEach((s) => { s.active = true; });
        },
      };
      catalog.themes.push(theme);
      return theme;
    },
  };

  const components = [];
  let closed;
  const penpot = {
    messages,
    closed: new Promise((resolve) => { closed = resolve; }),
    theme: 'light',
    flags,
    get currentFile() { return file; },
    get currentPage() { return current; },
    ui: {
      open(name, url) {
        if (url !== 'index.html') throw new Error('the window is index.html, next to the manifest (Penpot adds the theme)');
        setTimeout(() => listeners.message?.({ type: 'ready' }), 0);
      },
      sendMessage(message) {
        messages.push(structuredClone(message));
        // The window's Close button, once the summary is shown.
        if (message.type === 'finished') setTimeout(() => listeners.message?.({ type: 'close' }), 0);
      },
      onMessage(callback) { listeners.message = callback; },
    },
    on(type, callback) { listeners[type] = callback; },
    closePlugin() { closed(); },
    viewport: { zoomIntoView() {} },
    createPage() { return page(''); },
    async openPage(p) { current = p; },
    createBoard: () => shape('board'),
    createRectangle: () => shape('rectangle'),
    createEllipse: () => shape('ellipse'),
    createPath: () => shape('path', { d: 'M 0 0' }),
    createText(text) {
      if (!text) return null;
      return shape('text', { characters: text, growType: 'auto-width', fontFamily: 'sourcesanspro', fontWeight: '400' });
    },
    fonts: {
      findByName(name) {
        if (!fonts[name]) return null;
        return {
          name,
          variants: fonts[name].map((w) => ({ fontWeight: String(w), fontStyle: 'normal' })),
          applyToText(text, variant) {
            changes.count += 1;
            quietly(() => {
              text.fontFamily = name;
              text.fontWeight = variant ? variant.fontWeight : '400';
            });
          },
        };
      },
    },
    library: {
      local: {
        tokens: catalog,
        components,
        createComponent(shapes) {
          if (shapes.length !== 1 || shapes[0].type !== 'board' || shapes[0].parent) throw new Error('a component from one top-level board');
          const main = shapes[0];
          const component = {
            id: id(),
            name: '',
            variantProps: {},
            variants: null,
            mainInstance: () => main,
            instance: () => copyOf(main),
            isVariant() { return !!this.variants; },
            setVariantProperty(pos, value) {
              changes.count += 1;
              if (!this.variants) throw new Error('not a variant');
              if (pos < 0 || pos >= this.variants.properties.length) throw new Error(`no property at ${pos}`);
              if (typeof value !== 'string') throw new Error('a variant value is a string');
              this.variantProps[this.variants.properties[pos]] = value;
            },
          };
          changes.count += 1;
          quietly(() => {
            main.isMain = true;
            main.component = component;
          });
          components.push(component);
          return component;
        },
      },
    },
    createVariantFromComponents(mains) {
      if (!mains.every((m) => m.isMain && !m.component.variants && m.page === current)) throw new Error('main instances of the current page only');
      const list = mains.map((m) => m.component);
      const variants = {
        properties: ['Property 1'],
        variantComponents: () => list,
        addProperty() {
          const name = `Property ${this.properties.length + 1}`;
          this.properties.push(name);
          list.forEach((c) => { c.variantProps[name] = ''; });
        },
        formula: formula && ((component, text) => {
          if (!/^[^=,]+=[^=,]*(, [^=,]+=[^=,]*)*$/.test(text)) return;
          const pairs = text.split(', ').map((pair) => pair.split('='));
          for (const name of variants.properties) if (!pairs.some(([n]) => n === name)) component.variantProps[name] = '';
          for (const [name, value] of pairs) {
            if (!variants.properties.includes(name)) {
              variants.properties.push(name);
              list.forEach((c) => { c.variantProps[name] = ''; });
            }
            component.variantProps[name] = value;
          }
          // Penpot then removes the properties left empty in every variant.
          for (const name of [...variants.properties]) {
            if (list.every((c) => c.variantProps[name] === '')) {
              variants.properties.splice(variants.properties.indexOf(name), 1);
              list.forEach((c) => { delete c.variantProps[name]; });
            }
          }
        }),
        renameProperty(pos, name) {
          if (pos < 0 || pos >= this.properties.length) throw new Error(`no property at ${pos}`);
          const old = this.properties[pos];
          this.properties[pos] = name;
          list.forEach((c) => {
            c.variantProps[name] = c.variantProps[old];
            delete c.variantProps[old];
          });
        },
      };
      list.forEach((c) => {
        c.variants = variants;
        c.variantProps = { 'Property 1': '' };
      });
      const container = shape('board', { variants, isVariantContainer: () => true });
      quietly(() => mains.forEach((m) => {
        container.children.push(m);
        m.parent = container;
      }));
      return container;
    },
  };
  return { penpot, catalog, components, file };
}

function runPlugin(fake, ids = ['button']) {
  const plan = planOf(ids);
  const source = fs.readFileSync(path.join(ROOT, PATHS.penpot, 'src/plugin.js'), 'utf8');
  const logs = [];
  new Function('penpot', 'console', 'PLAN', source)(fake.penpot, { warn: (m) => logs.push(m) }, plan);
  return fake.penpot.closed.then(() => ({ logs, plan, summary: fake.penpot.messages.at(-1).summary }));
}

const FONTS = { Inter: [400, 500, 600], 'Material Symbols Outlined': [300, 400] };
const containersOf = (fake, name) => fake.file.pages.find((p) => p.name === name).shapes.filter((s) => s.isVariantContainer());

test('the plugin writes the tokens and draws the Button bound to them', async () => {
  const fake = fakePenpot({ fonts: FONTS });
  const { logs, plan, summary } = await runPlugin(fake);
  assert.deepEqual(logs, []);
  assert.equal(summary, `1 component drawn (${plan.components[0].variants.length} variants), ${plan.tokens.tokens.length} tokens.`);
  assert.deepEqual(fake.catalog.sets.map((s) => s.name), ['Foundation', 'Component', 'Mode/Light', 'Mode/Dark']);
  assert.equal(fake.catalog.sets.reduce((n, s) => n + s.tokens.length, 0), plan.tokens.tokens.length);
  assert.deepEqual(fake.catalog.themes.map((t) => [t.name, t.active, t.activeSets.map((s) => s.name)]), [
    ['Light', true, ['Foundation', 'Component', 'Mode/Light']],
    ['Dark', false, ['Foundation', 'Component', 'Mode/Dark']],
  ]);
  const component = fake.catalog.sets[1].tokens.find((t) => t.name === 'button.container.background.accent.neutral.default');
  assert.equal(component.value, '{global.bg.accent.neutral.default}');

  const [container] = containersOf(fake, 'Button');
  assert.equal(container.name, 'Button');
  assert.equal(container.pluginData['quantum/component'], JSON.stringify({ id: 'button', version: plan.components[0].version }));
  assert.deepEqual(container.variants.properties, ['Emphasis', 'Intent', 'Size', 'Leading icon', 'Trailing icon', 'State']);
  const variants = container.variants.variantComponents();
  assert.equal(variants.length, 720);
  assert.deepEqual(variants[0].variantProps, plan.components[0].variants[0].props);
  assert.equal(new Set(variants.map((c) => JSON.stringify(c.variantProps))).size, 720);

  const first = container.children[0];
  assert.equal(first.name, plan.components[0].variants[0].name);
  assert.deepEqual([first.flex.dir, first.flex.justifyContent, first.flex.alignItems], ['row', 'center', 'center']);
  assert.equal(first.tokens.fill, 'button.container.background.accent.neutral.default');
  assert.equal(first.tokens.paddingLeft, 'button.container.padding-inline.medium');
  assert.equal(first.tokens.layoutItemMinH, 'button.container.min-height.medium');
  assert.equal(first.flex.leftPadding, 12);
  assert.deepEqual(first.fills, [{ fillColor: '#201E1F', fillOpacity: 1 }]);
  const label = first.children.find((n) => n.name === 'label');
  assert.deepEqual([label.characters, label.fontFamily, label.fontWeight, label.fontSize, label.lineHeight], ['Button', 'Inter', '500', '16', '1']);
  assert.equal(label.tokens.typography, 'button.label.typography.medium');
  assert.equal(label.tokens.fill, 'button.label.color.accent.neutral.default');

  const focus = container.children.find((n) => n.name.endsWith('State=focus-visible'));
  const ring = focus.children.find((n) => n.name === 'focus-ring');
  assert.deepEqual([ring.layoutChild.absolute, ring.strokes[0].strokeAlignment, ring.tokens.strokeWidth, ring.tokens.strokeColor], [true, 'outer', 'button.container.outline-width.focus-visible', 'button.container.outline-color.focus-visible']);
  const icon = container.children.find((n) => n.name.includes('Leading icon=true')).children[0];
  assert.deepEqual([icon.type, icon.characters, icon.fontFamily, icon.tokens.width, icon.tokens.fontFamilies], ['text', 'add', 'Material Symbols Outlined', 'button.icon.size.medium', 'button.icon.font-family']);
});

test('the plugin updates the tokens in place and leaves an existing component alone', async () => {
  const fake = fakePenpot({ fonts: FONTS });
  await runPlugin(fake);
  const count = fake.catalog.sets.reduce((n, s) => n + s.tokens.length, 0);
  fake.penpot.messages.length = 0;
  fake.penpot.closed = new Promise((resolve) => { fake.penpot.closePlugin = resolve; });
  const { summary, logs } = await runPlugin(fake);
  assert.equal(fake.catalog.sets.reduce((n, s) => n + s.tokens.length, 0), count);
  assert.equal(fake.catalog.themes.length, 2);
  assert.match(summary, /no component drawn, 1 kept/);
  assert.match(logs[0], /"Button" already exists on the page "Button": kept as it is/);
  assert.equal(containersOf(fake, 'Button').length, 1);
});

test('without the icon font, the plugin draws placeholder icons and says so', async () => {
  const fake = fakePenpot({ fonts: { Inter: FONTS.Inter } });
  const { summary, logs } = await runPlugin(fake);
  assert.match(summary, /1 warning/);
  assert.match(logs[0], /The font "Material Symbols Outlined" is not among Penpot's fonts/);
  const [container] = containersOf(fake, 'Button');
  const icon = container.children.find((n) => n.name.includes('Leading icon=true')).children[0];
  assert.deepEqual([icon.type, icon.tokens.strokeColor, icon.tokens.width], ['board', 'button.label.color.accent.neutral.default', 'button.icon.size.medium']);
});

test('on Penpot 2.18, the plugin applies a font family token under its former property name', async () => {
  const fake = fakePenpot({ fonts: FONTS, before219: true });
  const { logs } = await runPlugin(fake);
  assert.deepEqual(logs, []);
  const icon = containersOf(fake, 'Button')[0].children.find((n) => n.name.includes('Leading icon=true')).children[0];
  assert.equal(icon.tokens.fontFamilies, 'button.icon.font-family');
});

test('the plugin draws every component, copies of the components they use included', async () => {
  const fake = fakePenpot({ fonts: FONTS });
  const { summary, logs, plan } = await runPlugin(fake, Object.keys(BLUEPRINTS));
  assert.deepEqual(logs, []);
  assert.doesNotMatch(summary, /warning|no component drawn|kept|failed/);
  // Every variant, drawn or a clone of another one, has the tokens, texts and visibility of its plan.
  const check = (id, shape, spec) => {
    const where = `${id}: ${shape.name}`;
    if (spec.type === 'instance') return;
    if (spec.fill) assert.equal(shape.tokens.fill, spec.fill, where);
    if (spec.stroke) assert.equal(shape.tokens.strokeColor, spec.stroke, where);
    for (const [property, name] of Object.entries(spec.bind ?? {})) {
      if (spec.type !== 'path' || !['width', 'height'].includes(property)) assert.equal(shape.tokens[property], name, `${where} ${property}`);
    }
    if (spec.typography) assert.equal(shape.tokens.typography, spec.typography, where);
    if (spec.text ?? spec.glyph) assert.equal(shape.characters, spec.text ?? spec.glyph, where);
    assert.equal(shape.hidden, !!spec.hidden, where);
    (spec.children ?? []).forEach((child, i) => check(id, shape.children[i], child));
  };
  for (const c of plan.components) {
    const [container] = containersOf(fake, c.page);
    assert.equal(container.variants.variantComponents().length, c.variants.length, c.id);
    c.variants.forEach((variant, i) => {
      assert.equal(container.children[i].name, variant.name);
      check(c.id, container.children[i], variant.root);
    });
  }
  // The dropdown's trigger is a copy of a Button variant, its label set.
  const [dropdown] = containersOf(fake, 'Dropdown');
  const trigger = dropdown.children[0].children.find((n) => n.component);
  assert.equal(trigger.component.variants, containersOf(fake, 'Button')[0].variants);
  // The spinner's arc is an open path in its ring; the accordion's border a line along its bottom.
  const [spinner] = containersOf(fake, 'Spinner');
  const arc = spinner.children[0].children[0].children.find((n) => n.name === 'arc');
  assert.deepEqual([arc.type, arc.tokens.strokeColor, arc.tokens.strokeWidth], ['path', 'spinner.ring.color', 'spinner.ring.border-width.medium']);
  assert.match(arc.d, /^M [-\d.]+ [-\d.]+ A /);
  const [accordion] = containersOf(fake, 'Accordion');
  const find = (s, name) => (s.name === name ? s : s.children.map((c) => find(c, name)).find(Boolean));
  const border = find(accordion.children[0], 'border-bottom');
  assert.deepEqual([border.type, border.layoutChild.absolute, border.tokens.strokeWidth], ['path', true, 'accordion.item.border-width']);
});

test('the plugin reports its progress to its window, then waits for Close', async () => {
  const fake = fakePenpot({ fonts: FONTS });
  const { plan } = await runPlugin(fake);
  const messages = fake.penpot.messages;
  assert.deepEqual([messages[0].type, messages[0].status], ['tokens', 'running']);
  const tokensDone = messages.findIndex((m) => m.type === 'tokens' && m.status === 'done');
  assert.ok(messages.slice(1, tokensDone).every((m) => m.type === 'tokens' && m.done > 0), 'progress while writing the tokens');
  const button = messages.filter((m) => m.type === 'component');
  assert.deepEqual([button[0].status, button[0].drawn], ['running', 0]);
  assert.ok(button.some((m) => m.status === 'running' && m.phase === 'drawing' && m.drawn > 0), 'progress while drawing');
  assert.ok(button.some((m) => m.phase === 'combining'), 'then while combining');
  assert.deepEqual([button.at(-1).status, button.at(-1).drawn, button.at(-1).total], ['done', plan.components[0].variants.length, plan.components[0].variants.length]);
  assert.equal(messages.at(-1).type, 'finished');
  assert.deepEqual(messages.at(-1).warnings, []);
});

test('a component that cannot be drawn fails alone; the others are drawn', async () => {
  const fake = fakePenpot({ fonts: FONTS });
  fake.penpot.createEllipse = () => { throw new Error('no ellipse today'); };
  const { summary } = await runPlugin(fake, ['badge', 'spinner']);
  const finals = fake.penpot.messages.filter((m) => m.type === 'component' && m.status !== 'running').map((m) => [m.id, m.status]);
  assert.deepEqual(finals, [['badge', 'done'], ['spinner', 'failed']]);
  assert.match(summary, /1 component drawn \(24 variants\), 1 failed, .* 1 warning,/);
});

test('the plugin window is built with the design system', () => {
  const plan = planOf(['button', 'badge']);
  const html = renderUi(plan, { fonts: '', css: '' });
  for (const c of ['tokens', 'button', 'badge']) assert.match(html, new RegExp(`class="qf-row" data-key="${c}"`));
  assert.match(html, /class="ds-progress-bar"/);
  assert.match(html, /<button [^>]*class="ds-button"[^>]*id="qf-close"|<button [^>]*id="qf-close"[^>]*class="ds-button/);
  assert.equal((html.match(/class="ds-badge"/g) ?? []).length, 3);
  assert.match(html, /parent\.postMessage\(\{ type: 'ready' \}, '\*'\)/);
});

test('the manifest asks for what the plugin does, and no more', () => {
  assert.equal(MANIFEST.version, 2);
  assert.equal(MANIFEST.code, 'plugin.js');
  assert.deepEqual(MANIFEST.permissions, ['content:read', 'content:write', 'library:read', 'library:write']);
});

test('penpotComponent refuses a token the Penpot file does not hold', () => {
  const figma = figmaComponent(loaded, specOf('badge'), BLUEPRINTS.badge);
  assert.throws(() => penpotComponent(figma, {}, new Map()), /badge: "badge\..+" has no Penpot token/);
});

test('the plugin draws a variant as a clone of the first one of its structure, writing what differs', async () => {
  const counts = {};
  for (const id of ['badge', 'button']) {
    const fake = fakePenpot({ fonts: FONTS });
    const before = changes.count;
    const { plan } = await runPlugin(fake, [id]);
    counts[id] = (changes.count - before) / plan.components[0].variants.length;
  }
  // About 95 changes per Button variant when every variant was drawn from scratch.
  assert.ok(counts.button < 20, `${counts.button} changes per Button variant`);
  assert.ok(counts.badge < 30, `${counts.badge} changes per Badge variant`);
});

test('where Penpot does not read properties from a name, the plugin sets each one', async () => {
  const fake = fakePenpot({ fonts: FONTS, formula: false });
  const { logs, plan } = await runPlugin(fake, ['badge']);
  assert.deepEqual(logs, []);
  const [container] = containersOf(fake, 'Badge');
  assert.deepEqual(container.variants.properties, plan.components[0].properties.map((p) => p.name));
  for (const [i, c] of container.variants.variantComponents().entries()) assert.deepEqual(c.variantProps, plan.components[0].variants[i].props);
});
