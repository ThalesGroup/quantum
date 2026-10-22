/**
 * Component token paths read against their spec: which part, property, options and state a path
 * names, which tokens are active for given props and state, and what kind of decision each one
 * is (color, spacing, size…). Zero-dependency, shared by validate.mjs, the tests and the site's
 * token inspector (apps/docs/src/components/TokenInspector.astro).
 *
 * Path grammar: <component>.<part>.<property>[.<key>…][.<option>…][.<state>]
 * Segments after the property are read positionally, as the Specs bridge does: a segment is an
 * option when an enum property affecting the part owns that value and has no option yet in the
 * path, else the state
 * when it is a declared state and the path has no state yet, else a key of the property
 * (`transition.duration`). An option value equal to a state id (`default`) therefore reads as the
 * state once its property is set.
 *
 * Instance enum properties of a repeated part (a menu item's `intent`, spec `anatomy[].properties`)
 * name options of the parts they affect too; they are keyed `<part>.<property>` (`item.intent`)
 * so they never collide with a component property of the same id.
 */

/** Kinds of component token, in display order. The token inspector filters by them. */
export const KINDS = [
  { id: 'color', label: 'Color' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'size', label: 'Size' },
  { id: 'border', label: 'Border' },
  { id: 'typography', label: 'Typography' },
  { id: 'motion', label: 'Motion' },
  { id: 'other', label: 'Other' },
];

/**
 * Component token property -> kind. A token whose `$type` is `color` is always of kind color
 * (`border-color`, `outline-color`); `TYPE_KINDS` covers the other properties the table lacks.
 * `pnpm validate` warns on a property that falls into `other`: extend the table.
 */
export const PROPERTY_KINDS = {
  spacing: ['offset', 'padding', 'padding-inline', 'padding-block', 'padding-inline-start', 'padding-inline-end', 'padding-block-start', 'padding-block-end', 'margin', 'margin-inline', 'margin-block', 'gap', 'row-gap', 'column-gap', 'outline-offset'],
  size: ['size', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'inline-size', 'block-size'],
  border: ['border-width', 'border-radius', 'border-style', 'outline-width', 'outline-style'],
  // Icon font axes (Material Symbols FILL, GRAD, opsz) are typography: the icon is a glyph.
  typography: ['typography', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'fill', 'grade', 'optical-size'],
  motion: ['transition', 'animation'],
  // Opacity modulates a color (a skeleton's pulse, a spinner's pause): a color decision.
  color: ['opacity'],
};

/** DTCG `$type` -> kind, for properties `PROPERTY_KINDS` does not list. */
export const TYPE_KINDS = {
  color: 'color',
  typography: 'typography',
  fontFamily: 'typography',
  fontWeight: 'typography',
  duration: 'motion',
  cubicBezier: 'motion',
  transition: 'motion',
};

const KIND_OF_PROPERTY = new Map(Object.entries(PROPERTY_KINDS).flatMap(([kind, props]) => props.map((p) => [p, kind])));

/** Kind of a component token from its property segment and its DTCG type. */
export function kindOf(property, type) {
  if (type === 'color') return 'color';
  return KIND_OF_PROPERTY.get(property) ?? TYPE_KINDS[type] ?? 'other';
}

/**
 * Enum properties of a spec (any `affects`), in spec order, then the instance enum properties of
 * its repeated parts. Each is `{ key, affects, options, default }`; `key` is the property id, or
 * `<part>.<property>` for an instance property.
 */
const enumProperties = (spec) => [
  ...(spec.properties ?? []).filter((p) => p.type === 'enum').map((p) => ({ ...p, key: p.id })),
  ...(spec.anatomy ?? []).flatMap((part) => (part.properties ?? []).filter((p) => p.type === 'enum').map((p) => ({ ...p, key: `${part.id}.${p.id}` }))),
];

/**
 * Reads the segments of a component token path.
 * @returns {{ component, part, property, keys: string[], options: Record<string,string>, state: string|null, slot: string, specificity: number }}
 */
export function parseTokenPath(spec, segments) {
  const [component, part, property, ...rest] = segments;
  // Only the properties that affect the part can name its options (`affects` absent: every part).
  const enums = enumProperties(spec).filter((p) => !p.affects || p.affects.includes(part));
  const stateIds = new Set((spec.states ?? []).map((s) => s.id));
  const options = {};
  const keys = [];
  let state = null;
  for (const seg of rest) {
    const owner = enums.find((p) => !(p.key in options) && p.options.some((o) => o.value === seg));
    if (owner) options[owner.key] = seg;
    else if (state === null && stateIds.has(seg)) state = seg;
    else keys.push(seg);
  }
  // The slot is what one CSS declaration reads: the same part, property and keys, whatever the options and state.
  const slot = [part, property, ...keys].join('.');
  return { component, part, property, keys, options, state, slot, specificity: Object.keys(options).length };
}

/** Value of an enum property in `props`, or its spec default. */
const optionValue = (spec, props, key) => props?.[key] ?? enumProperties(spec).find((p) => p.key === key)?.default;

/**
 * States holding for `props` and a forced `state`, highest precedence first: the forced state and
 * every state set through a boolean property that is on (`disabled`). When several hold, the one
 * declared last in the spec wins, as the CSS orders its rules (default < hover < active < disabled).
 * `default` is never listed: it is the fallback of every slot.
 */
export function effectiveStates(spec, props = {}, state = null) {
  const on = new Set();
  if (state && state !== 'default') on.add(state);
  for (const s of spec.states ?? []) if (s.trigger === 'property' && s.property && props[s.property] === true) on.add(s.id);
  return (spec.states ?? []).map((s) => s.id).filter((id) => on.has(id)).reverse();
}

/**
 * Component tokens active for `props` and a forced `state`.
 *
 * Tokens are grouped by slot (part + property + keys). In a slot, a token applies when each option
 * it names equals the prop (an option it does not name matches any value: `background.accent.disabled`
 * holds for every intent). The slot then takes, in order: a token of the highest-precedence state
 * that has one, else a `default` token, else a token without state. Among those, the one naming
 * the most options wins. A slot with none of them is inactive (`outline-width.focus-visible` at rest).
 *
 * @param tokens  [{ path, segments, … }] component tokens of `spec`
 * @returns       [{ token, parsed, via: 'state' | 'default' | 'stateless', state: string|null }] in token order
 */
export function activeTokens(spec, tokens, props = {}, state = null) {
  const states = effectiveStates(spec, props, state);
  const slots = new Map();
  for (const token of tokens) {
    const parsed = parseTokenPath(spec, token.segments);
    const applies = Object.entries(parsed.options).every(([id, value]) => optionValue(spec, props, id) === value);
    if (!applies) continue;
    if (!slots.has(parsed.slot)) slots.set(parsed.slot, []);
    slots.get(parsed.slot).push({ token, parsed });
  }
  const chosen = new Set();
  const out = new Map();
  for (const candidates of slots.values()) {
    const pick = (list, via, s) => {
      if (!list.length) return false;
      const best = list.reduce((a, b) => (b.parsed.specificity > a.parsed.specificity ? b : a));
      chosen.add(best.token);
      out.set(best.token, { ...best, via, state: s });
      return true;
    };
    const done = states.some((s) => pick(candidates.filter((c) => c.parsed.state === s), 'state', s));
    if (!done && !pick(candidates.filter((c) => c.parsed.state === 'default'), 'default', 'default')) {
      pick(candidates.filter((c) => c.parsed.state === null), 'stateless', null);
    }
  }
  return tokens.filter((t) => chosen.has(t)).map((t) => out.get(t));
}

/** Every combination of enum options of a spec, with each declared state forced in turn. */
export function* configurations(spec) {
  const enums = enumProperties(spec);
  const combos = enums.reduce((acc, p) => acc.flatMap((c) => p.options.map((o) => ({ ...c, [p.key]: o.value }))), [{}]);
  for (const props of combos) for (const s of spec.states ?? [{ id: 'default' }]) yield { props, state: s.id };
}

/**
 * Checks the grammar of a component's tokens against the active-token rule:
 * `unreachable` tokens are active in no configuration; `ambiguous` lists slots where two tokens
 * tie for one configuration (same state, as many options), so which one applies is undefined.
 */
export function checkTokenMap(spec, tokens) {
  const reached = new Set();
  const ambiguous = new Map();
  for (const { props, state } of configurations(spec)) {
    for (const a of activeTokens(spec, tokens, props, state)) reached.add(a.token.path);
    // Ties: tokens of one slot with the same state and specificity that both apply.
    const seen = new Map();
    for (const token of tokens) {
      const p = parseTokenPath(spec, token.segments);
      if (!Object.entries(p.options).every(([id, v]) => optionValue(spec, props, id) === v)) continue;
      const key = `${p.slot}|${p.state}|${p.specificity}`;
      if (seen.has(key)) ambiguous.set([seen.get(key), token.path].sort().join(' / '), { props, state });
      else seen.set(key, token.path);
    }
  }
  return {
    unreachable: tokens.map((t) => t.path).filter((p) => !reached.has(p)),
    ambiguous: [...ambiguous.entries()].map(([pair, at]) => ({ pair, ...at })),
  };
}

/** Whether a decision's token pattern (`a.b.c` exact, or `a.b.*` prefix) names `path`. */
export const matchesTokenPattern = (pattern, path) => (pattern.endsWith('.*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern);

/**
 * Alias chain of a token: its path, then each alias it points to, down to the token holding a
 * literal value. `byPath` is the index of `loadAll` (scripts/lib/dtcg.mjs).
 */
export function aliasChain(path, byPath) {
  const chain = [];
  const seen = new Set();
  let t = byPath.get(path);
  while (t && !seen.has(t.path)) {
    seen.add(t.path);
    chain.push({ path: t.path, tier: t.tier });
    const m = typeof t.value === 'string' && t.value.match(/^\{([^}]+)\}$/);
    t = m ? byPath.get(m[1]) : null;
  }
  return chain;
}
