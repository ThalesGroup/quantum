/**
 * Bridge between the Quantum spec format and the Specs format by Nathan Curtis / Directed Edges
 * (https://www.specsplugin.com/schema/, npm @directededges/specs-schema, CC BY 4.0).
 *
 *   toSpecs(spec, tokensTree)       -> { component, sidecar }
 *   fromSpecs(component, sidecar?)  -> { spec, tokens }
 *
 * The Quantum spec stays the source of truth. `component` is a valid Specs Component document; `sidecar`
 * holds what the Specs schema has no slot for (accessibility, content, implementations,
 * decisions, changelog, part metadata, tokens without a Specs style). With the sidecar the round trip
 * is lossless. Without it (a Figma-generated Specs file), fromSpecs infers structure and
 * tokens and leaves prose empty.
 *
 * Parts repeated through a `list` property (and their children) export their tokens to the
 * sidecar: a Specs prop configures the whole component, not one instance.
 *
 * Every mapping decision lives in the tables at the top of this file: when the Specs schema
 * moves, this is the one place to change. Pure functions, no file system access.
 */
import { flatten, isAlias, aliasPath, EXT } from './dtcg.mjs';
import { artifacts } from './paths.mjs';

/** Reverse-domain key for Quantum data inside Specs `$extensions` (shared with the resolved platform outputs). */
export { EXT };

/** Specs models interaction and system states as one enum prop (Specs ADR-055). */
export const STATE_PROP = 'state';

/** Quantum part role -> Specs element type. Unlisted roles export as `container`. */
export const PART_TYPE = { container: 'container', label: 'text', description: 'text', errormessage: 'text', value: 'text', placeholder: 'text', icon: 'glyph', indicator: 'glyph', slot: 'slot' };
/** Specs element type -> Quantum part role, used only when importing without a sidecar. */
export const TYPE_ROLE = { container: 'container', text: 'label', glyph: 'icon', slot: 'slot', instance: 'slot' };

/** Part roles shared by both vocabularies (Specs ADR-068); others stay Quantum-only. */
export const SHARED_PART_ROLES = new Set(['label', 'description', 'errormessage', 'value', 'placeholder', 'indicator', 'panel', 'increment', 'decrement']);

/**
 * Quantum component-token property, per part role -> Specs style keys.
 * `sides` writes a Sides object. A token whose part role or property is not listed here
 * cannot be expressed in Specs and travels in the sidecar (`tokens.residue`).
 */
export const STYLE_MAP = {
  container: {
    background: { keys: ['backgroundColor'] },
    'border-color': { keys: ['strokes'] },
    'border-width': { keys: ['strokeWeight'] },
    'border-radius': { keys: ['cornerRadius'] },
    'min-height': { keys: ['minHeight'] },
    'min-width': { keys: ['minWidth'] },
    height: { keys: ['height'] },
    width: { keys: ['width'] },
    gap: { keys: ['itemSpacing'] },
    padding: { keys: ['padding'] },
    'padding-inline': { keys: ['padding'], sides: ['start', 'end'] },
    'padding-block': { keys: ['padding'], sides: ['top', 'bottom'] },
    opacity: { keys: ['opacity'] },
  },
  label: {
    color: { keys: ['textColor'] },
    typography: { keys: ['typography'] },
  },
  icon: {
    color: { keys: ['fillColor'] },
    size: { keys: ['width', 'height'] },
  },
};
for (const role of ['description', 'errormessage', 'value', 'placeholder']) STYLE_MAP[role] = STYLE_MAP.label;
STYLE_MAP.indicator = STYLE_MAP.icon;

/** Specs `TokenReference.$type` accepts only these DTCG types. */
export const SPECS_TOKEN_TYPES = new Set(['color', 'dimension', 'string', 'number', 'boolean', 'shadow', 'gradient', 'typography']);

/** Quantum `layout` field -> Specs structural style on the root element. */
export const LAYOUT = {
  direction: { key: 'layoutMode', to: { horizontal: 'HORIZONTAL', vertical: 'VERTICAL' } },
  align: { key: 'crossAxisAlignment', to: { start: 'START', center: 'CENTER', end: 'END', stretch: 'STRETCH', baseline: 'BASELINE' } },
  justify: { key: 'mainAxisAlignment', to: { start: 'START', center: 'CENTER', end: 'END', 'space-between': 'SPACE_BETWEEN' } },
  sizing: { key: 'layoutSizingHorizontal', to: { hug: 'HUG', fill: 'FILL', fixed: 'FIXED' } },
  wrap: { key: 'wrap', to: { true: true, false: false } },
};

// ---------------------------------------------------------------------------
// Quantum -> Specs
// ---------------------------------------------------------------------------

/** Throws when a spec cannot be expressed at all (as opposed to lossy fields, which go to the sidecar). */
export function toSpecs(spec, tokensTree) {
  if (spec.properties.some((p) => p.id === STATE_PROP)) {
    throw new Error(`property id "${STATE_PROP}" is reserved by the Specs bridge for states; rename the property`);
  }
  const root = spec.anatomy[0];
  const partById = Object.fromEntries(spec.anatomy.map((p) => [p.id, p]));
  const propById = Object.fromEntries(spec.properties.map((p) => [p.id, p]));
  const optionOf = new Map();
  for (const p of spec.properties.filter((p) => p.type === 'enum')) for (const o of p.options) optionOf.set(o.value, p.id);
  const stateById = Object.fromEntries(spec.states.map((s) => [s.id, s]));
  // A state set through a boolean property is that property; every other state is a value of STATE_PROP.
  const viaBoolean = (s) => s.property && propById[s.property]?.type === 'boolean';
  const enumStates = spec.states.filter((s) => !viaBoolean(s));

  // ---- props: native Specs shape + the full Quantum property in $extensions
  const props = {};
  for (const p of spec.properties) {
    const { id, ...own } = p;
    const st = spec.states.find((s) => viaBoolean(s) && s.property === id);
    const $extensions = { [EXT]: st ? { ...own, state: st } : own };
    if (p.type === 'enum') props[id] = { type: 'string', enum: p.options.map((o) => o.value), default: p.default ?? p.options[0].value, $extensions };
    else if (p.type === 'boolean') props[id] = { type: 'boolean', default: p.default ?? false, $extensions };
    else if (p.type === 'number') props[id] = { type: 'number', ...(p.default !== undefined ? { default: p.default } : {}), $extensions };
    else if (p.type === 'node') props[id] = { type: 'slot', $extensions };
    else {
      const examples = [...new Set(spec.examples?.map((e) => e.props[id]).filter((v) => typeof v === 'string'))];
      // `examples` is always written: without it the Specs `AnyProp` oneOf matches both StringProp and EnumProp.
      props[id] = { type: 'string', ...(p.required ? { nullable: false } : {}), examples, $extensions };
    }
  }
  // `order` keeps the spec order of every state, boolean-set ones included, for the round trip.
  props[STATE_PROP] = { type: 'string', enum: enumStates.map((s) => s.id), default: 'default', $extensions: { [EXT]: { states: enumStates, order: spec.states.map((s) => s.id) } } };

  // ---- anatomy: one Specs element per rendered node. A repeatable part bound by several
  // properties (icon <- iconStart, iconEnd) becomes one element per property.
  const anatomy = {};
  const elementsOfPart = {};
  for (const part of spec.anatomy) {
    const binders = spec.properties.filter((p) => p.bindsTo === part.id);
    const keys = part.repeatable && binders.length > 1 ? binders.map((b) => b.id) : [part.id];
    elementsOfPart[part.id] = keys;
    for (const key of keys) {
      const el = { type: part.component ? 'instance' : PART_TYPE[part.role] ?? 'container' };
      if (part.component) el.instanceOf = part.component;
      if (part === root) el.role = spec.role;
      else if (SHARED_PART_ROLES.has(part.role)) el.role = part.role;
      anatomy[key] = el;
    }
  }
  const layoutOf = (partId) => {
    const kids = spec.anatomy.filter((p) => p !== root && (p.parent ?? root.id) === partId);
    const keys = kids.flatMap((k) => elementsOfPart[k.id].map((key) => (spec.anatomy.some((c) => c.parent === k.id) ? { [key]: layoutOf(k.id) } : key)));
    // Trailing binders (iconEnd) render after their siblings.
    const name = (k) => (typeof k === 'string' ? k : Object.keys(k)[0]);
    return [...keys.filter((k) => !/End$/.test(name(k))), ...keys.filter((k) => /End$/.test(name(k)))];
  };

  // ---- default + layered variants, one layer per distinct prop configuration (Specs "variant layering")
  const defaults = Object.fromEntries(Object.entries(props).filter(([, p]) => p.default !== undefined).map(([k, p]) => [k, p.default]));
  const layers = new Map([['{}', { configuration: {}, elements: {} }]]);
  const layer = (config) => {
    const key = JSON.stringify(config);
    if (!layers.has(key)) layers.set(key, { configuration: config, elements: {} });
    return layers.get(key);
  };
  const styles = (l, el) => ((l.elements[el] ??= {}).styles ??= {});
  const residue = [];
  const meta = {};
  const listProps = new Set(spec.properties.filter((p) => p.type === 'list').map((p) => p.id));
  // Parts repeated through a list property (menu items) and their children: Specs props configure
  // the component, not each instance, so their tokens (item intent, item states) travel in the sidecar.
  const instanceParts = new Set(spec.properties.filter((p) => p.type === 'list').flatMap((p) => p.of));
  for (let grew = true; grew;) {
    grew = false;
    for (const part of spec.anatomy) if (part.parent && instanceParts.has(part.parent) && !instanceParts.has(part.id)) { instanceParts.add(part.id); grew = true; }
  }

  for (const t of flatten(tokensTree)) {
    if (t.description || t.extensions) meta[t.path] = { ...(t.description ? { description: t.description } : {}), ...(t.extensions ? { extensions: t.extensions } : {}) };
    const [, partId, property, ...rest] = t.segments;
    const map = STYLE_MAP[partById[partId]?.role]?.[property];
    const config = {};
    let expressible = !!map && isAlias(t.value) && SPECS_TOKEN_TYPES.has(t.type) && !instanceParts.has(partId);
    // Grammar is <option>…<state>: each enum property takes one segment, so an option value that
    // is also a state id (variant `default` + state `default`) reads as the state once its
    // property is set. Only one state segment is allowed.
    let stated = false;
    for (const seg of rest) {
      if (optionOf.has(seg) && !(optionOf.get(seg) in config)) config[optionOf.get(seg)] = seg;
      else if (stateById[seg] && !stated) {
        stated = true;
        if (viaBoolean(stateById[seg])) config[stateById[seg].property] = true;
        else if (seg !== 'default') config[STATE_PROP] = seg;
      } else expressible = false;
    }
    if (!expressible) { residue.push({ path: t.path, type: t.type, value: t.value }); continue; }
    const isDefault = Object.entries(config).every(([k, v]) => defaults[k] === v);
    const l = isDefault ? layer({}) : layer(config);
    const ref = { $token: aliasPath(t.value), $type: t.type, $extensions: { [EXT]: { token: t.path } } };
    for (const el of elementsOfPart[partId]) {
      const s = styles(l, el);
      for (const key of map.keys) {
        if (map.sides) s[key] = { ...(typeof s[key] === 'object' && !s[key]?.$token ? s[key] : {}), ...Object.fromEntries(map.sides.map((side) => [side, ref])) };
        else s[key] = ref;
      }
    }
  }

  // Structural layout, content bindings and conditional visibility on the default layer.
  const base = layer({});
  const rootStyles = styles(base, root.id);
  for (const [k, m] of Object.entries(LAYOUT)) if (spec.layout?.[k] !== undefined) rootStyles[m.key] = m.to[String(spec.layout[k])];
  for (const p of spec.properties.filter((p) => p.bindsTo && elementsOfPart[p.bindsTo])) {
    const keys = elementsOfPart[p.bindsTo];
    const node = (base.elements[keys.length > 1 ? p.id : keys[0]] ??= {});
    const binding = { $binding: `#/props/${p.id}` };
    if (p.type === 'node') node.children = binding;
    else node.content = binding;
    if (!p.required && (p.type === 'string' || p.type === 'icon')) {
      node.styles = { ...node.styles, visible: { if: { condition: { operation: 'isNotNull', args: { value: binding } }, then: true, else: false } } };
    }
  }

  const [defaultLayer, ...rest] = [...layers.values()].sort((a, b) => Object.keys(a.configuration).length - Object.keys(b.configuration).length);
  const interaction = enumStates.filter((s) => s.trigger === 'interaction' && s.id !== 'default').map((s) => s.id);
  const invalidPropCombinations = spec.states.filter(viaBoolean).flatMap((ps) => interaction.map((s) => ({ [ps.property]: true, [STATE_PROP]: s })));

  const component = {
    title: spec.name,
    anatomy,
    props,
    default: { configuration: defaults, elements: defaultLayer.elements, layout: [{ [root.id]: layoutOf(root.id) }] },
    ...(rest.length ? { variants: rest } : {}),
    ...(invalidPropCombinations.length ? { invalidPropCombinations } : {}),
    ...(spec.examples?.length ? { instanceExamples: Object.fromEntries(spec.examples.map((e) => [e.id, { title: e.name, propConfigurations: Object.fromEntries(Object.entries(e.props).filter(([k]) => !listProps.has(k))) }])) } : {}),
  };

  // ---- sidecar: everything the Specs schema has no slot for
  const { name, role, anatomy: parts, properties, states, examples, layout, tokens, ...top } = spec;
  const layoutRest = Object.fromEntries(Object.entries(layout ?? {}).filter(([k]) => !(k in LAYOUT)));
  // Values of list properties (arrays of part instances) have no Specs prop configuration: they travel here.
  const exampleRest = Object.fromEntries((examples ?? []).map(({ id, name: _n, props, ...x }) => {
    const lists = Object.fromEntries(Object.entries(props).filter(([k]) => listProps.has(k)));
    return [id, { ...x, ...(Object.keys(lists).length ? { listProps: lists } : {}) }];
  }).filter(([, x]) => Object.keys(x).length));
  const sidecar = {
    $description: `Quantum fields with no slot in the Specs schema. Pair with ${spec.id}.specs.json to restore the Quantum spec and tokens losslessly.`,
    ...top,
    anatomy: parts,
    ...(Object.keys(exampleRest).length ? { examples: exampleRest } : {}),
    ...(Object.keys(layoutRest).length ? { layout: layoutRest } : {}),
    ...(layout === undefined ? { noLayout: true } : {}),
    ...(examples === undefined ? { noExamples: true } : {}),
    tokens: { ...tokens, residue, ...(Object.keys(meta).length ? { meta } : {}) },
  };
  return { component, sidecar };
}

// ---------------------------------------------------------------------------
// Specs -> Quantum
// ---------------------------------------------------------------------------

const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
const camel = (s) => kebab(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/**
 * Returns { spec, tokens } where tokens is a Map path -> { value, type, description?, extensions? }.
 * With a sidecar produced by toSpecs the result equals the original. Without one, prose fields
 * are empty and the spec needs version, status, summary and implementations before it validates.
 */
export function fromSpecs(component, sidecar = {}) {
  const ext = (o) => o?.$extensions?.[EXT];
  const def = component.default ?? {};
  const rootKey = Object.keys(component.anatomy)[0];
  const id = sidecar.id ?? kebab(component.title);
  const bindingOf = (el) => (el?.content ?? el?.children)?.$binding?.replace('#/props/', '');

  // Which Quantum part does each Specs element belong to?
  const elementPart = {};
  for (const key of Object.keys(component.anatomy)) {
    const bound = bindingOf(def.elements?.[key]);
    elementPart[key] = ext(component.props?.[bound])?.bindsTo ?? (key === rootKey ? key : kebab(key));
  }
  const anatomy = sidecar.anatomy ?? [...new Set(Object.values(elementPart))].map((partId) => {
    const key = Object.keys(elementPart).find((k) => elementPart[k] === partId);
    const el = component.anatomy[key];
    const bound = component.props?.[bindingOf(def.elements?.[key])];
    return { id: partId, role: key === rootKey ? 'container' : SHARED_PART_ROLES.has(el.role) ? el.role : TYPE_ROLE[el.type] ?? 'slot', required: key === rootKey || bound?.nullable === false };
  });

  // Properties and states. The state prop is ours (io.quantum) or, in a foreign file, one named `state`.
  // Our state prop carries io.quantum states; in a foreign file it is the prop named `state` (any case).
  const stateKey = Object.keys(component.props ?? {}).find((k) => ext(component.props[k])?.states) ?? Object.keys(component.props ?? {}).find((k) => k.toLowerCase() === STATE_PROP);
  const properties = [];
  const enumStates = [];
  const booleanStates = [];
  for (const [pid, p] of Object.entries(component.props ?? {})) {
    const e = ext(p);
    if (pid === stateKey) {
      enumStates.push(...(e?.states ?? p.enum.map((s) => ({ id: kebab(s), trigger: 'interaction' }))));
      continue;
    }
    if (e) {
      const { state, ...own } = e;
      properties.push({ id: pid, ...own });
      if (state) booleanStates.push(state);
      continue;
    }
    const base = { id: camel(pid), name: pid };
    if (p.enum && p.type === 'string') properties.push({ ...base, type: 'enum', default: p.default, options: p.enum.map((value) => ({ value: kebab(value) })) });
    else if (p.type === 'boolean') {
      properties.push({ ...base, type: 'boolean', default: p.default });
      // Specs lists a boolean that cannot co-occur with an interaction state as invalid: that is a property state.
      if ((component.invalidPropCombinations ?? []).some((c) => c[pid] === true && stateKey in c)) booleanStates.push({ id: kebab(pid), trigger: 'property', property: camel(pid) });
    } else if (p.type === 'number') properties.push({ ...base, type: 'number', ...(p.default !== undefined ? { default: p.default } : {}) });
    else if (p.type === 'slot') properties.push({ ...base, type: 'node' });
    else {
      const elKey = Object.keys(component.anatomy).find((k) => bindingOf(def.elements?.[k]) === pid);
      properties.push({ ...base, type: component.anatomy[elKey]?.type === 'glyph' ? 'icon' : 'string', ...(elKey ? { bindsTo: elementPart[elKey] } : {}), ...(p.nullable === false ? { required: true } : {}) });
    }
  }
  const order = ext(component.props?.[stateKey])?.order;
  const states = [...enumStates, ...booleanStates];
  if (order) states.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  if (!states.some((s) => s.id === 'default')) states.unshift({ id: 'default', trigger: 'interaction' });

  // Tokens: exact path from io.quantum when present, otherwise inferred from the layer configuration.
  const partRole = Object.fromEntries(anatomy.map((p) => [p.id, p.role]));
  const reverse = {};
  for (const [role, m] of Object.entries(STYLE_MAP)) for (const [prop, { keys, sides }] of Object.entries(m)) for (const k of keys) ((reverse[role] ??= {})[k] ??= []).push({ prop, sides });
  const layers = [{ configuration: {}, elements: def.elements ?? {} }, ...(component.variants ?? [])];
  const refsOf = (l, cb) => {
    for (const [elKey, el] of Object.entries(l.elements ?? {})) {
      const partId = elementPart[elKey] ?? elKey;
      for (const [styleKey, v] of Object.entries(el.styles ?? {})) {
        for (const { prop, sides } of reverse[partRole[partId]]?.[styleKey] ?? []) {
          const ref = sides ? v?.[sides[0]] : v;
          if (ref?.$token && (!sides || sides.every((s) => v[s]?.$token === ref.$token)) && (sides || !v.start)) cb(partId, prop, ref);
        }
      }
    }
  };
  const varies = {};
  for (const l of layers) refsOf(l, (partId, prop) => { for (const k of Object.keys(l.configuration ?? {})) (varies[`${partId}.${prop}`] ??= new Set()).add(k); });
  const baseConfig = def.configuration ?? {};
  const boolState = Object.fromEntries(booleanStates.map((s) => [s.property, s.id]));
  const tokens = new Map();
  for (const l of layers) {
    refsOf(l, (partId, prop, ref) => {
      let path = ext(ref)?.token;
      if (!path) {
        const keys = varies[`${partId}.${prop}`] ?? new Set();
        const cfg = { ...baseConfig, ...l.configuration };
        const segs = [id, partId, prop];
        for (const k of keys) if (k !== stateKey && !(camel(k) in boolState)) segs.push(kebab(cfg[k]));
        if ([...keys].some((k) => k === stateKey || camel(k) in boolState)) {
          const on = Object.keys(l.configuration ?? {}).find((k) => l.configuration[k] === true && camel(k) in boolState);
          segs.push(on ? boolState[camel(on)] : kebab(cfg[stateKey] ?? 'default'));
        }
        path = segs.join('.');
      }
      if (!tokens.has(path)) tokens.set(path, { value: `{${ref.$token}}`, type: ref.$type });
    });
  }
  for (const t of sidecar.tokens?.residue ?? []) tokens.set(t.path, { value: t.value, type: t.type });
  for (const [path, m] of Object.entries(sidecar.tokens?.meta ?? {})) if (tokens.has(path)) Object.assign(tokens.get(path), m);

  // Layout and examples.
  const rootStyles = def.elements?.[rootKey]?.styles ?? {};
  const layout = { ...sidecar.layout };
  for (const [k, m] of Object.entries(LAYOUT)) {
    const back = Object.entries(m.to).find(([, v]) => v === rootStyles[m.key]);
    if (back) layout[k] = k === 'wrap' ? back[0] === 'true' : back[0];
  }
  const examples = Object.entries(component.instanceExamples ?? {}).map(([eid, e]) => {
    // List values were taken out of the Specs configuration and travel in the sidecar.
    const { listProps, ...rest } = sidecar.examples?.[eid] ?? {};
    return { id: eid, name: e.title ?? eid, ...rest, props: { ...(e.propConfigurations ?? {}), ...listProps } };
  });

  const { $description, anatomy: _a, examples: _e, layout: _l, noLayout, noExamples, tokens: tokenMeta, ...top } = sidecar;
  const { residue: _r, meta: _m, ...tokenRef } = tokenMeta ?? {};
  const spec = {
    id,
    name: component.title,
    ...top,
    role: component.anatomy[rootKey]?.role ?? 'presentation',
    anatomy,
    properties,
    states,
    ...(noLayout ? {} : { layout }),
    ...(noExamples ? {} : { examples }),
    tokens: Object.keys(tokenRef).length ? tokenRef : { source: artifacts(id).tokens, prefix: id },
  };
  return { spec, tokens };
}

/** Rebuild a DTCG tree from fromSpecs tokens (each token carries its own $type). */
export function tokensToTree(tokens) {
  const tree = {};
  for (const [path, t] of [...tokens].sort(([a], [b]) => a.localeCompare(b))) {
    const segs = path.split('.');
    let node = tree;
    for (const s of segs.slice(0, -1)) node = node[s] ??= {};
    node[segs.at(-1)] = { ...(t.type ? { $type: t.type } : {}), $value: t.value, ...(t.description ? { $description: t.description } : {}), ...(t.extensions ? { $extensions: t.extensions } : {}) };
  }
  return tree;
}
