/**
 * A component as a Penpot component with variants bound to Penpot design tokens: the plan that the
 * Penpot plugin of packages/penpot/src/plugin.js draws (`pnpm penpot:export`). Pure, zero-dependency.
 *
 * Tokens are the Penpot token file the token build publishes (packages/tokens/dist/penpot/tokens.json:
 * the sets Foundation, Component and one per mode, one theme per mode), kept to the tokens the drawn
 * components reach and to every token they reference, in every set. A token keeps its name (its
 * path), its Penpot type and its value, references included, so the chain component -> semantic ->
 * raw survives in Penpot; the plugin creates them in an order where a reference always exists first.
 *
 * Components are drawn from the blueprints of @quantum-ds/figma (packages/figma/src/blueprints/,
 * format in packages/figma/src/plan.mjs), expanded by the same engine over every configuration of
 * the spec: every variant binds the tokens the web reads. Each Figma field is then translated to the
 * Penpot token property that drives it (`PROPERTIES`). A field Penpot cannot bind to the token's type
 * (`APPLIES`, as the plugin API 1.5 has it) is set to the token's value instead, and listed in the
 * component's `unbound` with the reason.
 */
import { pluginPlan, rgba } from '../../figma/src/plan.mjs';

/** The Penpot token sets, in their order: the token file's own. */
export const SET_ORDER = (file) => file.$metadata?.tokenSetOrder ?? Object.keys(file).filter((k) => !k.startsWith('$'));

/** Type names of the token file -> the plugin API's (it reads both; it documents these). */
const TYPE_NAMES = { fontFamily: 'fontFamilies', fontWeight: 'fontWeights' };

/** Penpot token type -> the shape properties a token of that type can be applied to (plugin API 1.5). */
export const APPLIES = {
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
};

/** Figma field of the Figma plan -> the Penpot property it is (a gap follows the layout direction). */
const PROPERTIES = {
  paddingTop: 'paddingTop',
  paddingRight: 'paddingRight',
  paddingBottom: 'paddingBottom',
  paddingLeft: 'paddingLeft',
  itemSpacing: (node) => (node.layout === 'column' ? 'rowGap' : 'columnGap'),
  topLeftRadius: 'borderRadiusTopLeft',
  topRightRadius: 'borderRadiusTopRight',
  bottomRightRadius: 'borderRadiusBottomRight',
  bottomLeftRadius: 'borderRadiusBottomLeft',
  strokeWeight: 'strokeWidth',
  minWidth: 'layoutItemMinW',
  minHeight: 'layoutItemMinH',
  maxWidth: 'layoutItemMaxW',
  width: 'width',
  height: 'height',
  opacity: 'opacity',
  fontFamily: 'fontFamilies',
  fontWeight: 'fontWeight',
  fontSize: 'fontSize',
};

/** A border on one side only (Figma's per-side stroke weight): its side. */
const SIDES = { strokeTopWeight: 'top', strokeRightWeight: 'right', strokeBottomWeight: 'bottom', strokeLeftWeight: 'left' };

const NODE_TYPES = { frame: 'board', text: 'text', icon: 'icon', ellipse: 'ellipse', vector: 'path', instance: 'instance' };
const DIRECTIONS = { HORIZONTAL: 'row', VERTICAL: 'column' };
// Penpot has no baseline alignment: the end of the cross axis comes closest for one-line texts.
const ALIGN = { MIN: 'start', CENTER: 'center', MAX: 'end', SPACE_BETWEEN: 'space-between', BASELINE: 'end' };
const SIZING = { HUG: 'auto', FILL: 'fill' };

/** Why a field is set to its token's value rather than bound to the token, by kind. */
export const UNBOUND = {
  type: (type, property) => `a ${type} token cannot drive ${property} in Penpot: set to its value`,
  rootMin: 'Penpot honours a minimum size inside a layout only: the component itself is given that size when its content is smaller',
};

/** Why a part is drawn otherwise than in Figma, by kind. */
export const APPROXIMATIONS = {
  baseline: 'Penpot has no baseline alignment: aligned to the end of the row',
  side: 'Penpot strokes every side (plugin API 1.5): a border on one side is a line along that side, bound to the border color and width',
  arc: 'Penpot has no partial ellipse: the arc is an open path, bound to the stroke color and width',
};

/** A token path from a Figma variable name (`button/container/gap/medium`). */
const pathOf = (name) => name.split('/').join('.');

/** `#RRGGBB` and an opacity, Penpot's color, from a resolved color. */
export function hexColor(value) {
  const { r, g, b, a } = typeof value === 'object' && 'r' in value ? value : rgba(value);
  const hex = (c) => Math.round(c * 255).toString(16).padStart(2, '0').toUpperCase();
  return { color: `#${hex(r)}${hex(g)}${hex(b)}`, opacity: +a.toFixed(4) };
}

/** Every token of a Penpot token file: [set name, token name] -> { type, value, description }. */
export function tokensOf(file) {
  const out = [];
  const walk = (set, node, prefix) => {
    for (const [key, child] of Object.entries(node ?? {})) {
      if (!child || typeof child !== 'object') continue;
      const name = prefix ? `${prefix}.${key}` : key;
      if ('$value' in child) out.push({ set, name, type: TYPE_NAMES[child.$type] ?? child.$type, value: child.$value, description: child.description ?? '' });
      else walk(set, child, name);
    }
  };
  for (const set of SET_ORDER(file)) walk(set, file[set], '');
  return out;
}

/** The token names a value references (`{a.b}`), a typography or shadow composite included. */
export function referencesOf(value) {
  if (typeof value === 'string') return [...value.matchAll(/\{([^{}]+)\}/g)].map((m) => m[1]);
  if (Array.isArray(value)) return value.flatMap(referencesOf);
  if (value && typeof value === 'object') return Object.values(value).flatMap(referencesOf);
  return [];
}

/**
 * The Penpot tokens a set of token names needs: those tokens and every token they reference, in
 * every set, ordered so that a referenced name exists before a token reading it (Penpot resolves a
 * token when it is created). Returns { sets, tokens, themes, active }: `sets` the set names in
 * order, `tokens` `{ set, name, type, value, description }`, `themes` `{ group, name, description,
 * sets }` and `active` the themes active by default.
 */
export function penpotTokens(file, names) {
  const all = tokensOf(file);
  const byName = new Map();
  for (const t of all) byName.set(t.name, [...(byName.get(t.name) ?? []), t]);
  const ordered = [];
  const state = new Map();
  const visit = (name, trail = []) => {
    const entries = byName.get(name);
    if (!entries) throw new Error(`${trail.at(-1) ?? 'a component'} references "${name}", which the Penpot token file does not hold`);
    if (state.get(name) === 'done') return;
    if (state.get(name) === 'visiting') throw new Error(`Token reference cycle: ${[...trail, name].join(' -> ')}`);
    state.set(name, 'visiting');
    for (const t of entries) for (const ref of referencesOf(t.value)) visit(ref, [...trail, name]);
    state.set(name, 'done');
    ordered.push(...entries);
  };
  [...names].sort().forEach((n) => visit(n));
  const used = new Set(ordered.map((t) => t.set));
  const sets = SET_ORDER(file).filter((s) => used.has(s) || (file.$themes ?? []).some((th) => th.selectedTokenSets?.[s] === 'enabled'));
  const themes = (file.$themes ?? []).map((th) => ({
    group: th.group ?? '',
    name: th.name,
    description: th.description ?? '',
    sets: Object.entries(th.selectedTokenSets ?? {}).filter(([, s]) => s === 'enabled').map(([s]) => s),
  }));
  const active = file.$metadata?.activeThemes ?? [];
  return { sets, tokens: ordered, themes, active };
}

/**
 * The Penpot plan of one component of a Figma plugin plan (packages/figma/src/plan.mjs): the same
 * variants, grid and properties, each node translated to Penpot. `values` is the Figma plan's
 * resolved value of each variable; `types` maps a token name to its Penpot type.
 */
export function penpotComponent(component, values, types) {
  const unbound = new Map();
  const approximations = new Set();
  const textLayers = {};
  const booleans = Object.fromEntries(component.properties.filter((p) => p.kind === 'BOOLEAN').map((p) => [p.name, p.default]));
  const penpotValues = {};

  const typeOf = (path) => {
    const type = types.get(path);
    if (!type) throw new Error(`${component.id}: "${path}" has no Penpot token`);
    return type;
  };
  /** The Penpot value of a variable, kept by token path for the plugin. */
  const valueOf = (name) => {
    const path = pathOf(name);
    if (!(path in penpotValues)) {
      const v = values[name];
      penpotValues[path] = v && typeof v === 'object' && 'r' in v ? hexColor(v) : typeOf(path) === 'opacity' ? +(v / 100).toFixed(4) : v;
    }
    return path;
  };
  const note = (reason, path) => unbound.set(reason, (unbound.get(reason) ?? new Set()).add(path));

  const translate = (node, isRoot) => {
    const out = { type: NODE_TYPES[node.type], name: node.name };
    if (node.layout) {
      out.layout = DIRECTIONS[node.layout];
      out.justify = ALIGN[node.align?.primary ?? 'MIN'];
      out.align = ALIGN[node.align?.counter ?? 'MIN'];
      if (node.align?.counter === 'BASELINE') approximations.add(APPROXIMATIONS.baseline);
    }
    for (const key of ['width', 'height']) if (node[key] !== undefined) out[key] = SIZING[node[key]] ?? node[key];
    if (node.absolute) out.absolute = node.absolute;
    if (node.arc) {
      out.arc = node.arc;
      approximations.add(APPROXIMATIONS.arc);
    }
    if (node.path) out.path = node.path;
    if (node.strokeCap) out.strokeCap = node.strokeCap.toLowerCase();
    if (node.textDecoration === 'UNDERLINE') out.textDecoration = 'underline';
    if (node.visibleProperty) {
      // Penpot components have no boolean property: the layer shows as the property's default, and a copy shows or hides it.
      out.hidden = booleans[node.visibleProperty] === false;
      out.visibleProperty = node.visibleProperty;
    }
    if (node.fills) out.fill = valueOf(node.fills);
    if (node.strokes) out.stroke = valueOf(node.strokes);
    const bind = {};
    const set = {};
    for (const [field, name] of Object.entries(node.bind ?? {})) {
      if (SIDES[field]) {
        out.border = { side: SIDES[field], width: valueOf(name), color: out.stroke };
        delete out.stroke;
        approximations.add(APPROXIMATIONS.side);
        continue;
      }
      const path = valueOf(name);
      if (node.type === 'icon' && field === 'lineHeight') {
        // The glyph box is the icon size: one line of it.
        set.lineHeight = 1;
        continue;
      }
      const property = typeof PROPERTIES[field] === 'function' ? PROPERTIES[field](out) : PROPERTIES[field];
      if (!property) throw new Error(`${component.id}: no Penpot property for the Figma field "${field}"`);
      const type = typeOf(path);
      if (!APPLIES[type]?.includes(property)) {
        set[property] = penpotValues[path];
        note(UNBOUND.type(type, property), path);
        continue;
      }
      bind[property] = path;
      if (isRoot && (property === 'layoutItemMinW' || property === 'layoutItemMinH')) note(UNBOUND.rootMin, path);
    }
    for (const [field, value] of Object.entries(node.set ?? {})) {
      const property = SIDES[field] ? null : typeof PROPERTIES[field] === 'function' ? PROPERTIES[field](out) : PROPERTIES[field];
      if (property) set[property] = value;
    }
    if (Object.keys(bind).length) out.bind = bind;
    if (Object.keys(set).length) out.set = set;
    if (node.typography) {
      // The Figma plan binds one variable per member (`…/typography/medium/font-size`): Penpot binds the typography token.
      const path = pathOf(node.typography.fontSize).replace(/\.font-size$/, '');
      if (typeOf(path) !== 'typography') throw new Error(`${component.id}: "${path}" is not a typography token`);
      out.typography = path;
      const member = (m) => (node.typography[m] ? values[node.typography[m]] : undefined);
      penpotValues[path] ??= {
        fontFamily: member('fontFamily'),
        fontSize: member('fontSize'),
        fontWeight: member('fontWeight'),
        letterSpacing: member('letterSpacing') ?? 0,
        // Penpot's line height is relative, as a unitless CSS one: a pixel one becomes relative to the size.
        lineHeight: node.typography.lineHeight == null ? 1.2 : node.typography.lineHeight.unit === 'PERCENT' ? node.typography.lineHeight.value / 100 : +(node.typography.lineHeight.value / member('fontSize')).toFixed(4),
      };
    }
    if (node.focusRing) {
      out.focusRing = { width: valueOf(node.focusRing.strokeWeight), offset: valueOf(node.focusRing.offset), color: valueOf(node.focusRing.stroke) };
    }
    for (const key of ['text', 'glyph']) if (node[key] !== undefined) out[key] = node[key];
    if (node.textProperty) {
      out.textProperty = node.textProperty;
      textLayers[node.textProperty] ??= node.name;
    }
    if (node.type === 'instance') {
      out.component = node.component;
      out.variant = Object.fromEntries(Object.entries(node.variant).map(([k, v]) => [k, String(v)]));
      if (node.texts) out.texts = node.texts;
    }
    if (node.children) out.children = node.children.map((c) => translate(c, false));
    return out;
  };

  const variants = component.variants.map((v) => ({
    name: v.name,
    props: Object.fromEntries(v.name.split(', ').map((pair) => pair.split('='))),
    row: v.row,
    column: v.column,
    root: translate(v.root, true),
  }));
  return {
    id: component.id,
    name: component.name,
    version: component.version,
    description: component.description,
    page: component.page,
    properties: component.properties.filter((p) => p.kind === 'VARIANT').map((p) => ({ name: p.name, values: p.values })),
    grid: component.grid,
    variants,
    uses: component.uses,
    textLayers,
    notDrawn: component.notDrawn,
    uncovered: component.uncovered,
    unbound: [...unbound].map(([reason, paths]) => ({ reason, tokens: [...paths].sort() })),
    approximations: [...approximations],
    values: penpotValues,
  };
}

/** The manifest of the plugin (packages/penpot/dist/manifest.json), served next to plugin.js. */
export const MANIFEST = {
  name: 'Quantum components',
  description: 'Draws the Quantum components as components with variants, bound to Penpot tokens recreated from @quantum-ds/tokens.',
  code: 'plugin.js',
  // Version 2: `code` resolves next to the manifest, and an invalid change throws.
  version: 2,
  permissions: ['content:read', 'content:write', 'library:read', 'library:write'],
};

/**
 * The plan of the plugin: every component (after the components its instances use), the Penpot
 * tokens they reach, and the value of every bound token (by name) in the default mode.
 * `file` is the Penpot token file (packages/tokens/dist/penpot/tokens.json).
 */
export function penpotPlan(loaded, specs, blueprints, file) {
  const figma = pluginPlan(loaded, specs, blueprints);
  const all = tokensOf(file);
  const types = new Map(all.map((t) => [t.name, t.type]));
  const components = figma.components.map((c) => penpotComponent(c, figma.values, types));
  // Every token of the drawn components the Penpot file holds (it leaves out durations and easings).
  const ids = new Set(components.map((c) => c.id));
  const names = new Set(all.filter((t) => ids.has(t.name.split('.')[0]) && t.set === 'Component').map((t) => t.name));
  for (const c of components) for (const name of Object.keys(c.values)) names.add(name);
  return {
    tokens: penpotTokens(file, names),
    values: Object.assign({}, ...components.map((c) => c.values)),
    components: components.map(({ values: _, ...c }) => c),
  };
}
