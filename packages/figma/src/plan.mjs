/**
 * A component as a Figma component set bound to Figma variables: the plan that the Figma plugin
 * of packages/figma/src/plugin.js draws (`pnpm figma:export`). Pure, zero-dependency.
 *
 * Variables mirror the token tiers, one collection each (COLLECTIONS): raw (hidden from
 * publishing, no scope), semantic (one mode per token mode, light then dark) and component. Each
 * token becomes one variable named after its path (`button/container/gap/medium`), a typography
 * token one variable per member (`…/typography/medium/font-size`), as in the CSS; aliases stay
 * variable aliases, so the chain component -> semantic -> raw survives in Figma. A variable's web
 * code syntax is the token's CSS custom property. Only the tokens a component reaches are exported.
 *
 * A component is drawn from its blueprint (packages/figma/src/blueprints/<id>.mjs, format below),
 * expanded over every configuration of its spec with the active-token rule of scripts/lib/token-map.mjs:
 * every variant binds exactly the tokens the web implementation reads for that configuration. A binding is a variable name;
 * `values` holds the resolved value of each one in the default mode, which the plugin sets first.
 */
import { cssVarName, isAlias, aliasPath, resolveContext, resolveValue } from '../../../scripts/lib/dtcg.mjs';
import { activeTokens, parseTokenPath } from '../../../scripts/lib/token-map.mjs';

/** Figma variable collection of each token tier. */
export const COLLECTIONS = {
  raw: 'Quantum / Raw',
  semantic: 'Quantum / Semantic',
  component: 'Quantum / Components',
};

/** The mode of a collection that has a single one. */
export const SINGLE_MODE = 'Value';

/** Typography members, as the CSS splits them (member -> CSS segment, DTCG type). */
const TYPOGRAPHY_MEMBERS = {
  fontFamily: { segment: 'font-family', type: 'fontFamily' },
  fontSize: { segment: 'font-size', type: 'dimension' },
  fontWeight: { segment: 'font-weight', type: 'fontWeight' },
  lineHeight: { segment: 'line-height', type: 'number' },
  letterSpacing: { segment: 'letter-spacing', type: 'dimension' },
};

/** DTCG type -> Figma variable type; a type missing here (duration, cubicBezier, shadow…) has no Figma variable. */
const VARIABLE_TYPES = { color: 'COLOR', dimension: 'FLOAT', number: 'FLOAT', fontWeight: 'FLOAT', fontFamily: 'STRING' };

/** Component token property -> the Figma fields a variable may be applied to (its scopes). */
const COMPONENT_SCOPES = {
  background: ['FRAME_FILL', 'SHAPE_FILL'],
  'border-color': ['STROKE_COLOR'],
  'outline-color': ['STROKE_COLOR'],
  color: ['TEXT_FILL'],
  'border-width': ['STROKE_FLOAT'],
  'outline-width': ['STROKE_FLOAT'],
  'border-radius': ['CORNER_RADIUS'],
  'padding-inline': ['GAP'],
  'padding-block': ['GAP'],
  gap: ['GAP'],
  'outline-offset': ['GAP'],
  'min-height': ['WIDTH_HEIGHT'],
  size: ['WIDTH_HEIGHT', 'FONT_SIZE', 'LINE_HEIGHT'],
  'font-family': ['FONT_FAMILY'],
  'font-size': ['FONT_SIZE'],
  'font-weight': ['FONT_WEIGHT'],
  'letter-spacing': ['LETTER_SPACING'],
  // No Figma field takes them: a unitless line height (Figma reads pixels), the icon font's axes.
  opacity: ['OPACITY'],
  'line-height': [],
  fill: [],
  grade: [],
  'optical-size': [],
};

/** Figma variable name of a token path (or of its segments). */
export const variableName = (pathOrSegments) => (Array.isArray(pathOrSegments) ? pathOrSegments : pathOrSegments.split('.')).join('/');

const title = (id) => id.charAt(0).toUpperCase() + id.slice(1);

/** A resolved length in pixels (rem and em at 16 px), the unit of Figma. */
export function px(value) {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') return value.unit === 'rem' || value.unit === 'em' ? value.value * 16 : value.value;
  return Number.parseFloat(value);
}

/** A resolved color as Figma's RGBA (channels 0-1). */
export function rgba(value) {
  if (typeof value === 'string') {
    const hex = value.trim().match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
    if (!hex) throw new Error(`Color "${value}" is not #rrggbb or #rrggbbaa`);
    const channel = (i) => parseInt(hex[1].slice(i, i + 2), 16) / 255;
    return { r: channel(0), g: channel(2), b: channel(4), a: hex[2] ? parseInt(hex[2], 16) / 255 : 1 };
  }
  if ((value?.colorSpace ?? 'srgb') !== 'srgb') throw new Error(`Color space "${value?.colorSpace}" has no Figma equivalent`);
  const [r, g, b] = value.components.map((c) => (c === 'none' ? 0 : c));
  return { r, g, b, a: value.alpha === undefined ? 1 : +value.alpha.toFixed(4) };
}

/** Whether a token path names an opacity, which Figma reads as a percentage (0-100). */
const isOpacity = (segments) => segments.includes('opacity');

/** A resolved scalar as the value of a Figma variable of a DTCG type (`segments`: the token's path, for opacities). */
export function figmaValue(type, value, segments = []) {
  if (type === 'number' && isOpacity(segments)) return +(value * 100).toFixed(4);
  switch (type) {
    case 'color': return rgba(value);
    case 'dimension': return px(value);
    case 'fontFamily': return Array.isArray(value) ? value[0] : value;
    default: return value;
  }
}

/**
 * The Figma variables a set of token paths needs: those tokens, and every token they alias, in
 * every mode. Returns { collections, variables, skipped }: `collections` lists each tier's
 * collection with its modes; each variable has a name, a collection key, a Figma type, a value
 * per mode (a literal or `{ alias: <variable name> }`), its scopes and its web code syntax;
 * `skipped` lists the tokens Figma has no variable type for (durations, easings).
 */
export function figmaVariables(loaded, paths) {
  const modes = loaded.modes?.length ? [...loaded.modes].sort((a, b) => b.default - a.default) : [{ id: 'default', default: true }];
  const contexts = modes.map((m) => ({ mode: m, index: loaded.modes?.length ? resolveContext(loaded, { mode: m.id }) : loaded }));
  const tierOf = (path) => loaded.byPath.get(path)?.tier;
  const modal = new Set(loaded.config.tiers.filter((t) => t.modal).map((t) => t.name));
  const modeNames = (tier) => (modal.has(tier) ? modes.map((m) => title(m.id)) : [SINGLE_MODE]);

  const variables = new Map();
  const skipped = new Set();

  /** Source value of `path` (or of one typography member) in a context: a literal, or the alias it holds. */
  const sourceOf = (index, path, member) => {
    const value = index.byPath.get(path).value;
    if (!member) return value;
    // A whole-token alias of a typography token: the member aliases the same member of its target.
    return isAlias(value) ? { member: [aliasPath(value), member] } : value[member];
  };

  /** Adds the variable of `path` (or of one typography member) and what it aliases; returns its name, or null when skipped. */
  const visit = (path, member = null) => {
    const token = loaded.byPath.get(path);
    if (!token) throw new Error(`Unknown token "${path}"`);
    const segments = member ? [...token.segments, TYPOGRAPHY_MEMBERS[member].segment] : token.segments;
    const name = variableName(segments);
    if (variables.has(name)) return name;
    if (skipped.has(name)) return null;
    const dtcgType = member ? TYPOGRAPHY_MEMBERS[member].type : token.type;
    if (dtcgType === 'typography') throw new Error(`"${path}" is a typography token: export its members`);
    const type = VARIABLE_TYPES[dtcgType];
    if (!type) {
      skipped.add(name);
      return null;
    }
    const tier = tierOf(path);
    const variable = {
      name,
      collection: tier,
      type,
      values: {},
      scopes: tier === 'raw' ? [] : tier === 'component' ? COMPONENT_SCOPES[member ? TYPOGRAPHY_MEMBERS[member].segment : token.segments[2]] ?? ['ALL_SCOPES'] : ['ALL_SCOPES'],
      codeSyntax: { WEB: `var(${cssVarName(segments)})` },
      description: token.description ?? '',
      hidden: tier === 'raw',
    };
    variables.set(name, variable);
    const tierModes = modeNames(tier);
    for (const [i, { index }] of contexts.entries()) {
      if (!modal.has(tier) && i > 0) break;
      const source = sourceOf(index, path, member);
      const target = source?.member ? visit(...source.member) : isAlias(source) ? visit(aliasPath(source)) : undefined;
      if (target === null) {
        // An alias to a token Figma cannot hold: the variable cannot exist either.
        variables.delete(name);
        skipped.add(name);
        return null;
      }
      variable.values[tierModes[i]] = target ? { alias: target } : figmaValue(dtcgType, resolveValue(source, index.byPath), segments);
    }
    return name;
  };

  for (const path of paths) {
    const token = loaded.byPath.get(path);
    if (token?.type === 'typography') Object.keys(TYPOGRAPHY_MEMBERS).filter((m) => resolveValue(token.value, loaded.byPath)[m] !== undefined).forEach((m) => visit(path, m));
    else visit(path);
  }

  const used = new Set([...variables.values()].map((v) => v.collection));
  const collections = loaded.config.tiers
    .filter((t) => used.has(t.name))
    .map((t) => ({ key: t.name, name: COLLECTIONS[t.name] ?? title(t.name), modes: modeNames(t.name), hidden: t.name === 'raw' }));
  // Aliases before the variables reading them is not needed (the plugin creates every variable first), but a stable order is.
  const ordered = [...variables.values()].sort((a, b) => collections.findIndex((c) => c.key === a.collection) - collections.findIndex((c) => c.key === b.collection) || a.name.localeCompare(b.name));
  return { collections, variables: ordered, skipped: [...skipped].sort() };
}

// ---------------------------------------------------------------------------
// Components: a blueprint expanded over every configuration of the spec
// ---------------------------------------------------------------------------

/**
 * A blueprint (packages/figma/src/blueprints/<id>.mjs) is the Figma layer tree of a component,
 * read from its web implementation, with the token slot (`<part>.<property>[.<key>]`, as
 * scripts/lib/token-map.mjs names them) that drives each field. It holds no value: each variant binds the
 * token its slot makes active for that configuration, exactly as the CSS reads it.
 *
 *   { root, axes?, booleans?, uses?, notDrawn? }
 *
 * - `root`: the component's node (a frame). Every node has a `type` and optionally `name`,
 *   `when(v)` (drawn only when true), `visibleProperty` (the BOOLEAN property showing it),
 *   `context(v)` (`{ props, state }` merged into the configuration of its subtree: a current
 *   page, an expanded item, a menu item's intent), `bind` (key -> slot, or `(v) => slot | null`),
 *   `derive` (key -> `[slot, factor]`: a value computed from a token, set without a variable),
 *   `width` / `height` (`'HUG'`, `'FILL'` or px) and `absolute` (`{ x, y }` in px or `'center'`).
 *   These layout keys (and `layout`, `align`, `arc`, `path`, `textDecoration`) may also
 *   be `(v) => value`.
 *   - `frame`: `layout` (`'HORIZONTAL'`, `'VERTICAL'` or none), `align` (`{ primary, counter }`,
 *     Figma's MIN, CENTER, MAX, SPACE_BETWEEN, BASELINE),
 *     `children`, `focusRing` (the part whose `outline-*` slots draw a ring outside it).
 *   - `text`: `text` (or `(v) => text`), `property` (the TEXT property it shows),
 *     `textDecoration` (`'UNDERLINE'`).
 *   - `icon`: a glyph of the icon font: `glyph` (or `(v) => glyph`), `property`.
 *   - `ellipse`: `arc` (`[start, end]` in turns, for a partial ring).
 *   - `vector`: `path` (SVG path data in a 24 x 24 box, scaled to the node's size), `strokeCap`.
 *   - `instance`: `component` (another component id, listed in `uses`), `variant(v)` (its
 *     variant property values), `texts` (or `(v) => texts`: its TEXT property values by name).
 * - `bind` keys: `fill`, `stroke`, `strokeWeight`, `strokeTop|Right|Bottom|Left`, `radius`,
 *   `padding`, `paddingX`, `paddingY`, `paddingTop|Right|Bottom|Left`, `gap`, `minWidth`,
 *   `minHeight`, `maxWidth`, `width`, `height`, `size`, `opacity`, `typography` (text),
 *   `fontFamily`, `fontWeight` (icon). An icon's `size` sets its box, font size and line height.
 *   An opacity variable holds a percentage (0-100), as Figma reads it.
 * - `axes`: variant properties beyond the spec's enum properties and its states, each
 *   `{ name, values }`, read in `v.axes[name]` (the button's icon slots, whose padding differs).
 * - `booleans`: BOOLEAN properties, name -> default.
 * - `notDrawn`: `[{ slot, reason }]`, the token slots Figma cannot draw. Every slot of the
 *   component is bound by the blueprint or listed here (`uncovered` lists the others).
 *
 * The variants are every enum option x every axis value x every state of the spec (`v` is
 * `{ props, axes, state }`), the default first on each axis: Figma's default variant is the
 * top-left one. Columns are the size options (when the spec has a `size`) x the states.
 */

/** Blueprint `bind` key -> the Figma fields it binds. */
const FIELDS = {
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  paddingX: ['paddingLeft', 'paddingRight'],
  paddingY: ['paddingTop', 'paddingBottom'],
  paddingTop: ['paddingTop'],
  paddingRight: ['paddingRight'],
  paddingBottom: ['paddingBottom'],
  paddingLeft: ['paddingLeft'],
  gap: ['itemSpacing'],
  radius: ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'],
  strokeWeight: ['strokeWeight'],
  strokeTop: ['strokeTopWeight'],
  strokeRight: ['strokeRightWeight'],
  strokeBottom: ['strokeBottomWeight'],
  strokeLeft: ['strokeLeftWeight'],
  minWidth: ['minWidth'],
  minHeight: ['minHeight'],
  maxWidth: ['maxWidth'],
  width: ['width'],
  height: ['height'],
  size: ['width', 'height'],
  opacity: ['opacity'],
  fontFamily: ['fontFamily'],
  fontWeight: ['fontWeight'],
};
const ICON_SIZE = ['width', 'height', 'fontSize', 'lineHeight'];
const PAINTS = { fill: 'fills', stroke: 'strokes' };
const NODE_TYPES = new Set(['frame', 'text', 'icon', 'ellipse', 'vector', 'instance']);
/** Node keys copied as they are into the plan. */
const PLAIN = ['layout', 'align', 'width', 'height', 'absolute', 'arc', 'path', 'strokeCap', 'textDecoration', 'visibleProperty'];

/** The values of an enum property, its default first. */
const defaultFirst = (property) => {
  const values = property.options.map((o) => o.value);
  return [property.default, ...values.filter((v) => v !== property.default)];
};

/** Every combination of the axes, in order (the first axis varies slowest). */
const combinations = (axes) => axes.reduce((acc, axis) => acc.flatMap((c) => axis.values.map((value) => ({ ...c, [axis.key]: value }))), [{}]);

/** Index of a combination along some axes (mixed radix). */
const indexOf = (combo, axes) => axes.reduce((i, axis) => i * axis.values.length + axis.values.indexOf(combo[axis.key]), 0);

/** Slots of a component's tokens. */
export const slotsOf = (spec, tokens) => new Set(tokens.map((t) => parseTokenPath(spec, t.segments).slot));

/**
 * The plan of one component: its variant axes, properties and variants (one node tree each),
 * the variables they need and the resolved value of every bound variable.
 * `loaded` is the result of loadAll (lib/dtcg.mjs), `spec` the component spec, `blueprint` its blueprint.
 */
export function figmaComponent(loaded, spec, blueprint) {
  const tokens = loaded.all.filter((t) => t.tier === 'component' && t.segments[0] === spec.id);
  const slots = slotsOf(spec, tokens);
  const vars = figmaVariables(loaded, tokens.map((t) => t.path));
  const known = new Set(vars.variables.map((v) => v.name));
  const resolved = (path) => resolveValue(loaded.byPath.get(path).value, loaded.byPath);
  const values = {};
  const used = new Set();
  // TEXT properties in the order of the blueprint's tree; each default is the first text shown.
  const texts = new Map();
  const declare = (node) => {
    if (node.property && !texts.has(node.property)) texts.set(node.property, undefined);
    (node.children ?? []).forEach(declare);
  };
  declare(blueprint.root);

  const binding = (path) => {
    const name = variableName(path);
    if (!known.has(name)) throw new Error(`${spec.id}: "${path}" has no Figma variable`);
    values[name] ??= figmaValue(loaded.byPath.get(path).type, resolved(path), loaded.byPath.get(path).segments);
    return name;
  };
  const typography = (path) => {
    const value = resolved(path);
    const member = (m) => {
      const name = variableName([...path.split('.'), TYPOGRAPHY_MEMBERS[m].segment]);
      values[name] ??= figmaValue(TYPOGRAPHY_MEMBERS[m].type, value[m]);
      return name;
    };
    const lh = value.lineHeight;
    return {
      fontFamily: member('fontFamily'),
      fontSize: member('fontSize'),
      fontWeight: member('fontWeight'),
      ...(value.letterSpacing !== undefined ? { letterSpacing: member('letterSpacing') } : {}),
      // A unitless line height is a percentage in Figma, without its variable (Figma reads a number variable as pixels).
      lineHeight: typeof lh === 'number' ? { unit: 'PERCENT', value: +(lh * 100).toFixed(2) } : lh === undefined ? null : { unit: 'PIXELS', value: px(lh) },
    };
  };
  const useSlot = (slot) => {
    if (!slots.has(slot)) throw new Error(`${spec.id}: the blueprint names "${slot}", which no token of the component has`);
    used.add(slot);
  };
  const activeMap = (v) => new Map(activeTokens(spec, tokens, v.props, v.state).map((a) => [a.parsed.slot, a.token.path]));

  const expand = (node, v, active) => {
    if (!NODE_TYPES.has(node.type)) throw new Error(`${spec.id}: unknown node type "${node.type}"`);
    if (node.when && !node.when(v)) return null;
    if (node.context) {
      const extra = node.context(v);
      v = { ...v, props: { ...v.props, ...(extra.props ?? {}) }, state: extra.state ?? v.state };
      active = activeMap(v);
    }
    const out = { type: node.type, name: node.name ?? node.type };
    for (const key of PLAIN) if (node[key] !== undefined) out[key] = typeof node[key] === 'function' ? node[key](v) : node[key];
    for (const [key, b] of Object.entries(node.bind ?? {})) {
      const slot = typeof b === 'function' ? b(v) : b;
      if (!slot) continue;
      useSlot(slot);
      const path = active.get(slot);
      if (!path) continue; // Not active in this configuration (a focus ring at rest).
      if (key === 'typography') {
        out.typography = typography(path);
        continue;
      }
      if (PAINTS[key]) {
        out[PAINTS[key]] = binding(path);
        continue;
      }
      const fields = node.type === 'icon' && key === 'size' ? ICON_SIZE : FIELDS[key];
      if (!fields) throw new Error(`${spec.id}: unknown bind key "${key}"`);
      out.bind ??= {};
      for (const f of fields) out.bind[f] = binding(path);
    }
    for (const [key, [slot, factor]] of Object.entries(node.derive ?? {})) {
      useSlot(slot);
      const path = active.get(slot);
      if (!path) continue;
      out.set ??= {};
      for (const f of FIELDS[key]) out.set[f] = +(px(resolved(path)) * factor).toFixed(3);
    }
    if (node.focusRing) {
      const ring = ['outline-width', 'outline-offset', 'outline-color'].map((p) => `${node.focusRing}.${p}`);
      ring.forEach(useSlot);
      const [width, offset, color] = ring.map((s) => active.get(s));
      if (width) out.focusRing = { strokeWeight: binding(width), offset: binding(offset), stroke: binding(color) };
    }
    for (const [key, prop] of [['text', 'property'], ['glyph', 'property']]) {
      if (node[key] === undefined) continue;
      out[key] = typeof node[key] === 'function' ? node[key](v) : node[key];
      if (node[prop]) {
        out.textProperty = node[prop];
        if (texts.get(node[prop]) === undefined) texts.set(node[prop], out[key]);
      }
    }
    if (node.type === 'instance') {
      out.component = node.component;
      out.variant = node.variant(v);
      if (node.texts) out.texts = typeof node.texts === 'function' ? node.texts(v) : node.texts;
    }
    if (node.children) out.children = node.children.map((c) => expand(c, v, active)).filter(Boolean);
    return out;
  };

  const enums = spec.properties.filter((p) => p.type === 'enum');
  const axes = [
    ...enums.map((p) => ({ name: p.name, key: p.id, values: defaultFirst(p) })),
    ...(blueprint.axes ?? []).map((a) => ({ name: a.name, key: a.name, values: a.values, extra: true })),
    { name: 'State', key: 'state', values: spec.states.map((s) => s.id) },
  ];
  const columnAxes = axes.filter((a) => (a.key === 'size' && !a.extra) || a.key === 'state');
  const rowAxes = axes.filter((a) => !columnAxes.includes(a));

  const variants = combinations(axes).map((combo) => {
    const v = {
      props: Object.fromEntries(enums.map((p) => [p.id, combo[p.id]])),
      axes: Object.fromEntries(axes.filter((a) => a.extra).map((a) => [a.name, combo[a.key]])),
      state: combo.state,
    };
    return {
      name: axes.map((a) => `${a.name}=${combo[a.key]}`).join(', '),
      row: indexOf(combo, rowAxes),
      column: indexOf(combo, columnAxes),
      root: expand(blueprint.root, v, activeMap(v)),
    };
  });

  const notDrawn = blueprint.notDrawn ?? [];
  // A notDrawn entry names slots, or a prefix of slots (`container.transition`).
  const listed = notDrawn.flatMap((n) => n.slot.split(/,\s*/));
  for (const slot of slots) if (listed.some((l) => slot === l || slot.startsWith(`${l}.`))) used.add(slot);
  return {
    id: spec.id,
    name: spec.name,
    version: spec.version,
    description: spec.summary,
    page: spec.name,
    properties: [
      ...axes.map((a) => ({ name: a.name, kind: 'VARIANT', values: a.values.map(String) })),
      ...[...texts].filter(([, value]) => value !== undefined).map(([name, value]) => ({ name, kind: 'TEXT', default: value })),
      ...Object.entries(blueprint.booleans ?? {}).map(([name, value]) => ({ name, kind: 'BOOLEAN', default: value })),
    ],
    grid: { rows: rowAxes.reduce((n, a) => n * a.values.length, 1), columns: columnAxes.reduce((n, a) => n * a.values.length, 1) },
    variants,
    uses: blueprint.uses ?? [],
    notDrawn,
    uncovered: [...slots].filter((s) => !used.has(s)).sort(),
    values,
    variables: vars,
  };
}

/** The manifest of the development plugin (packages/figma/dist/manifest.json). */
export const MANIFEST = {
  name: 'Quantum components',
  id: 'quantum-components-dev',
  api: '1.0.0',
  main: 'code.js',
  ui: 'ui.html',
  editorType: ['figma'],
  documentAccess: 'dynamic-page',
  // The window loads the webfonts the font-family tokens name (packages/components/src/fonts.css).
  networkAccess: {
    allowedDomains: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    reasoning: 'The plugin window is built with the design system and loads the webfonts its tokens name (Inter, Material Symbols) from Google Fonts.',
  },
};

/**
 * The plan of the plugin: every component (after the components its instances use), and the
 * variables they need, each once. `blueprints` maps a component id to its blueprint.
 */
export function pluginPlan(loaded, specs, blueprints) {
  const byId = new Map(specs.map((s) => [s.id, s]));
  const ordered = [];
  const visit = (id, trail = []) => {
    if (ordered.some((s) => s.id === id)) return;
    if (trail.includes(id)) throw new Error(`Blueprint cycle: ${[...trail, id].join(' -> ')}`);
    if (!byId.has(id)) throw new Error(`"${trail.at(-1)}" uses "${id}": pass its spec too`);
    for (const dep of blueprints[id]?.uses ?? []) visit(dep, [...trail, id]);
    ordered.push(byId.get(id));
  };
  specs.forEach((s) => visit(s.id));
  const components = ordered.map((spec) => {
    if (!blueprints[spec.id]) throw new Error(`No Figma blueprint for "${spec.id}"`);
    return figmaComponent(loaded, spec, blueprints[spec.id]);
  });
  const collections = new Map();
  const variables = new Map();
  const skipped = new Set();
  for (const c of components) {
    c.variables.collections.forEach((col) => collections.set(col.key, col));
    c.variables.variables.forEach((v) => variables.set(v.name, v));
    c.variables.skipped.forEach((s) => skipped.add(s));
  }
  const order = loaded.config.tiers.map((t) => t.name);
  return {
    values: Object.assign({}, ...components.map((c) => c.values)),
    variables: {
      collections: [...collections.values()].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)),
      variables: [...variables.values()],
      skipped: [...skipped].sort(),
    },
    components: components.map(({ variables: _, values: __, ...component }) => component),
  };
}
