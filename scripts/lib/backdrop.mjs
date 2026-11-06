/**
 * The fill a component sits on without drawing it. A semantic role named `on-<fill>`
 * (`global.icon.on-accent.brand.default`) is read on that fill, the background token of the same
 * name at rest (`global.bg.accent.brand.default`). A component that reads such a role and draws no
 * fill of that kind itself (none of its tokens aliases `global.bg.<fill>.*`), such as the Icon on
 * a colored fill, is placed on the fill by the product: the docs site draws that fill behind its
 * rendering. Zero-dependency, shared by validate.mjs, the tests and the site
 * (apps/docs/src/lib/backdrop.ts).
 */
import { activeTokens } from './token-map.mjs';

/** A semantic role read on a fill: kind, fill, then the hue path and the role's last segment. */
export const ON_FILL = /^global\.(?:text|icon|border)\.on-(accent|subtle|sunken)\.(.+)\.[^.]+$/;
const DRAWN = /^global\.bg\.(accent|subtle|sunken)\./;

/** The background token a role is read on, at rest (`global.bg.<fill>.<hue>.default`), or null. */
export function fillOf(role) {
  const m = typeof role === 'string' && role.match(ON_FILL);
  return m ? `global.bg.${m[1]}.${m[2]}.default` : null;
}

/**
 * The fill of each component token whose semantic role is read on a fill the component does not
 * draw. `tokens`: [{ path, semantic }], every token of one component (`semantic`: the semantic
 * token it aliases). Returns { <token path>: <background token path> }.
 */
export function fillsOf(tokens) {
  const drawn = new Set(tokens.map((t) => t.semantic?.match(DRAWN)?.[1]).filter(Boolean));
  const fills = {};
  for (const t of tokens) {
    const fill = fillOf(t.semantic);
    if (fill && !drawn.has(fill.split('.')[2])) fills[t.path] = fill;
  }
  return fills;
}

/**
 * The fill behind a configuration: that of the first active token with one (`fillsOf`), or null
 * when the component sits on a surface level. `tokens`: every token of the component
 * ([{ path, segments }]), so the active-token rule (scripts/lib/token-map.mjs) weighs them all.
 */
export function backdropOf(spec, tokens, fills, props = {}, state = null) {
  for (const a of activeTokens(spec, tokens, props, state)) if (fills[a.token.path]) return fills[a.token.path];
  return null;
}

/** Semantic roles read on a fill whose background token does not exist (`byPath`: loadAll's index). */
export const missingFills = (byPath) =>
  [...byPath.values()].filter((t) => t.tier === 'semantic' && fillOf(t.path) && !byPath.has(fillOf(t.path))).map((t) => ({ role: t.path, fill: fillOf(t.path) }));
