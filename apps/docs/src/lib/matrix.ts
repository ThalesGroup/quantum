// States matrix layout, derived from the spec and its component tokens.
// Enum properties whose options appear together in one component token path
// (`<id>.<part>.<property>.<option-a>.<option-b>[.<state>]`) are crossed axes: the design
// decides every combination, so the matrix shows the cross product instead of one property
// at a time with the others at their default.
// States may belong to parts (`state.parts`): each part taking states gets its own matrices,
// with the enum properties affecting it as rows (component properties, or the instance
// properties of a part repeated through a list property) and its states as columns.
import type { TokenRow } from './tokens';

export interface MatrixTable {
  /** Enum property whose options are the rows. */
  property: any;
  /** Values of the other properties of the group, fixed for this table. */
  fixed: { property: any; value: string }[];
}

export interface MatrixGroup {
  /** Properties of the group, in spec order. */
  properties: any[];
  tables: MatrixTable[];
}

export interface PartMatrix {
  /** Part taking the states; null for the component as a whole (states without `parts`). */
  part: any | null;
  /** States of that part, in spec order. */
  states: any[];
  /** List property whose entries are instances of the part, when the part is repeated through one. */
  list: any | null;
  groups: MatrixGroup[];
}

/** Enum properties of `spec` that affect at least one part. */
export const enumProps = (spec: any): any[] => spec.properties.filter((p: any) => p.type === 'enum' && (p.affects?.length ?? 0) > 0);

/** Properties whose options name a segment after `<id>.<part>.<property>` of `row`. */
function propsInPath(row: TokenRow, props: any[]): any[] {
  const [, part, , ...rest] = row.segments;
  return props.filter((p) => p.affects.includes(part) && p.options.some((o: any) => rest.includes(o.value)));
}

/** Groups of crossed enum properties among `props`, each with one table per combination of all but its first property. */
function groupsOf(props: any[], tokens: TokenRow[]): MatrixGroup[] {
  // Union-find over the properties that share a token path.
  const parent = new Map(props.map((p) => [p.id, p.id]));
  const root = (id: string): string => (parent.get(id) === id ? id : root(parent.get(id)!));
  for (const row of tokens) {
    const [first, ...others] = propsInPath(row, props);
    for (const p of others) parent.set(root(p.id), root(first.id));
  }
  const ids = [...new Set(props.map((p) => root(p.id)))];
  return ids.map((id) => {
    const properties = props.filter((p) => root(p.id) === id);
    const [rows, ...axes] = properties;
    const combos = axes.reduce<{ property: any; value: string }[][]>(
      (acc, axis) => acc.flatMap((c) => axis.options.map((o: any) => [...c, { property: axis, value: o.value }])),
      [[]],
    );
    return { properties, tables: combos.map((fixed) => ({ property: rows, fixed })) };
  });
}

/** Groups of crossed enum properties of the whole component (states without `parts`). */
export function matrixGroups(spec: any, tokens: TokenRow[]): MatrixGroup[] {
  return groupsOf(enumProps(spec), tokens);
}

/** One matrix set per part taking states, in anatomy order; the component as a whole first. */
export function partMatrices(spec: any, tokens: TokenRow[]): PartMatrix[] {
  const whole = spec.states.filter((s: any) => !s.parts?.length);
  const out: PartMatrix[] = [];
  if (whole.length) out.push({ part: null, states: whole, list: null, groups: matrixGroups(spec, tokens) });
  for (const part of spec.anatomy) {
    const states = spec.states.filter((s: any) => s.parts?.includes(part.id));
    if (!states.length) continue;
    const list = spec.properties.find((p: any) => p.type === 'list' && p.of?.includes(part.id)) ?? null;
    // Rows: component enum properties affecting the part, then the part's own instance enum properties.
    const own = (part.properties ?? []).filter((p: any) => p.type === 'enum' && (p.affects?.length ?? 0) > 0);
    const props = [...enumProps(spec).filter((p) => p.affects.includes(part.id)), ...own];
    out.push({ part, states, list, groups: groupsOf(props, tokens.filter((t) => !list || t.segments[1] === part.id || isDescendant(spec, t.segments[1], part.id))) });
  }
  return out;
}

/** True when part `id` sits inside part `ancestor` in the anatomy. */
function isDescendant(spec: any, id: string, ancestor: string): boolean {
  let p = spec.anatomy.find((x: any) => x.id === id);
  while (p?.parent) {
    if (p.parent === ancestor) return true;
    p = spec.anatomy.find((x: any) => x.id === p.parent);
  }
  return false;
}

/** State that shows `partId` (its own `visibleIn`, or the nearest ancestor's), or null when always shown. */
export function revealingState(spec: any, partId: string): string | null {
  let p = spec.anatomy.find((x: any) => x.id === partId);
  while (p) {
    if (p.visibleIn?.length) return p.visibleIn[0];
    p = p.parent ? spec.anatomy.find((x: any) => x.id === p.parent) : null;
  }
  return null;
}

/**
 * Props rendering one cell: `row` (property id and option) with `state` forced on `pm.part`.
 * A part repeated through a list property is rendered as a single entry taking the row value
 * and the forced state; its revealing state (a menu's `expanded`) is forced on the component.
 */
export function cellProps(spec: any, pm: PartMatrix, base: Record<string, unknown>, row: { property: any; value: string }, fixed: { property: any; value: string }[], state: string): Record<string, unknown> {
  const own = (p: any) => (pm.part?.properties ?? []).includes(p);
  const props: Record<string, unknown> = { ...base };
  for (const f of [...fixed, row]) if (!own(f.property)) props[f.property.id] = f.value;
  if (!pm.list) return { ...props, state, ...(state === 'disabled' ? { disabled: true } : {}) };
  const entries = (base[pm.list.id] as any[] | undefined) ?? [];
  const sample = entries.find((e) => (e.part ?? pm.list.of[0]) === pm.part.id && !e.disabled) ?? {};
  const entry: Record<string, unknown> = { ...sample, state, ...(state === 'disabled' ? { disabled: true } : {}) };
  for (const f of [...fixed, row]) if (own(f.property)) entry[f.property.id] = f.value;
  const reveal = revealingState(spec, pm.part.id);
  return { ...props, [pm.list.id]: [entry], ...(reveal ? { state: reveal } : {}) };
}
