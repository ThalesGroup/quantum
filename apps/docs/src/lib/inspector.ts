// Data of the token inspector (components/TokenInspector.astro): every component token of a spec,
// read through scripts/lib/token-map.mjs (part, options, state, kind), with its alias chain, its
// resolved values and the decisions that name it or a token it aliases. Which ones are active is
// decided in the browser by the same library, from the playground props.
// @ts-ignore - plain ESM without types
import { parseTokenPath, kindOf, aliasChain, matchesTokenPattern, KINDS } from '../../../../scripts/lib/token-map.mjs';
import { componentTokens, tokenIndex } from './tokens';

export { KINDS };

export interface InspectorToken {
  path: string;
  segments: string[];
  part: string;
  property: string;
  keys: string[];
  /** Options and state segments, as written in the path (`accent.error.hover`). */
  variant: string;
  kind: string;
  type: string | null;
  /** First generated CSS variable (typography: the font family one). */
  cssVar: string | null;
  /** The semantic token the component token aliases. */
  semantic: string | null;
  /** The rest of the chain: semantic aliases, then raw tokens, down to the literal. */
  below: { path: string; tier: string }[];
  resolved: string;
  modes: { mode: string; resolved: string }[];
  decisions: { id: string; text: string }[];
}

export function inspectorTokens(spec: any): InspectorToken[] {
  const byPath = tokenIndex();
  const decisions = (spec.decisions ?? []).filter((d: any) => d.status !== 'superseded' && d.tokens?.length);
  return componentTokens(spec.id).map((row) => {
    const parsed = parseTokenPath(spec, row.segments);
    const chain: { path: string; tier: string }[] = aliasChain(row.path, byPath);
    const semantic = chain.find((l) => l.tier === 'semantic')?.path ?? null;
    const below = chain.slice(semantic ? chain.findIndex((l) => l.path === semantic) + 1 : 1);
    const named = new Set(chain.map((l) => l.path));
    const variant = row.segments.slice(3).filter((s) => !parsed.keys.includes(s)).join('.');
    return {
      path: row.path,
      segments: row.segments,
      part: parsed.part,
      property: parsed.property,
      keys: parsed.keys,
      variant,
      kind: kindOf(parsed.property, row.type),
      type: row.type,
      cssVar: row.css[0]?.[0] ?? null,
      semantic,
      below,
      resolved: row.resolved,
      modes: row.modes,
      decisions: decisions
        .filter((d: any) => d.tokens.some((p: string) => [...named].some((n) => matchesTokenPattern(p, n))))
        .map((d: any) => ({ id: d.id, text: d.text })),
    };
  });
}

/** The part of a spec the browser needs to decide which tokens are active. */
export const inspectorSpec = (spec: any) => ({
  properties: spec.properties.filter((p: any) => p.type === 'enum' || p.type === 'boolean').map((p: any) => ({ id: p.id, type: p.type, default: p.default, affects: p.affects, options: p.options?.map((o: any) => ({ value: o.value })) })),
  states: spec.states.map((s: any) => ({ id: s.id, trigger: s.trigger, property: s.property })),
  // Instance enum properties of repeated parts (a menu item's intent) name options of their parts' tokens.
  anatomy: spec.anatomy.filter((p: any) => p.properties?.some((x: any) => x.type === 'enum')).map((p: any) => ({
    id: p.id,
    properties: p.properties.filter((x: any) => x.type === 'enum').map((x: any) => ({ id: x.id, type: x.type, default: x.default, affects: x.affects, options: x.options.map((o: any) => ({ value: o.value })) })),
  })),
});
