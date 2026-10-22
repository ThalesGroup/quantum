/**
 * Foundation specimens: how the site presents the tokens a foundation is built from (a palette
 * as swatches, a spacing scale as bars, a font size as a specimen). Pure and zero-dependency,
 * shared by validate.mjs and the docs site (apps/docs/src/lib/foundations.ts) so both agree on what
 * each display accepts.
 *
 * A display only says how a token VALUE is drawn; which tokens are drawn, and why, is the
 * foundation spec's decision (specimens[] in specs/foundations/<id>.spec.json).
 */

/** Display -> DTCG $types it can draw (null: any type). Order = documentation order. */
export const DISPLAYS = {
  palette: { types: ['color'], description: 'Swatches, one row per group (a ramp).' },
  color: { types: ['color'], description: 'Swatch, value and alias of each token in every mode, side by side.' },
  length: { types: ['dimension'], description: 'A bar as long as the value.' },
  size: { types: ['dimension'], description: 'A square as wide as the value.' },
  radius: { types: ['dimension'], description: 'A box with that corner radius.' },
  stroke: { types: ['dimension'], description: 'A box outlined at that width.' },
  blur: { types: ['dimension'], description: 'A sample blurred by that radius.' },
  opacity: { types: ['number'], description: 'A text-colored square at that opacity.' },
  typography: { types: ['typography'], description: 'A text specimen in the composite style, with its five properties.' },
  'font-family': { types: ['fontFamily'], description: 'A specimen in the family.' },
  'font-size': { types: ['dimension'], description: 'A specimen at that size, in the nearest family token.' },
  'font-weight': { types: ['fontWeight'], description: 'A specimen at that weight, in the nearest family token.' },
  'line-height': { types: ['number'], description: 'A short paragraph at that line height.' },
  'letter-spacing': { types: ['dimension'], description: 'A specimen at that letter spacing.' },
  duration: { types: ['duration'], description: 'A dot crossing a track in that time (played on request).' },
  easing: { types: ['cubicBezier'], description: 'The curve, and a dot crossing a track along it (played on request).' },
  icon: { types: ['fontFamily', 'fontWeight', 'number'], description: 'The icons the components use, drawn with the icon font tokens, and the axis values.' },
  'icon-size': { types: ['dimension'], description: 'An icon drawn at that size.' },
  value: { types: null, description: 'Name and value, for anything else.' },
};

export const matchesPattern = (pattern, path) => (pattern.endsWith('.*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern);

/** Tokens a specimen draws: its patterns, optionally one tier, never component tokens. In token order. */
export function specimenTokens(specimen, tokens) {
  return tokens.filter((t) => t.tier !== 'component' && (!specimen.tier || t.tier === specimen.tier) && specimen.tokens.some((p) => matchesPattern(p, t.path)));
}

/**
 * Problems of one specimen against the loaded tokens: patterns matching nothing, component
 * tokens, types the display cannot draw. Returns strings.
 */
export function checkSpecimen(specimen, tokens) {
  const problems = [];
  const display = DISPLAYS[specimen.display];
  if (!display) return [`specimen "${specimen.id}": unknown display "${specimen.display}"`];
  for (const pattern of specimen.tokens) {
    const hits = tokens.filter((t) => matchesPattern(pattern, t.path));
    if (hits.length === 0) problems.push(`specimen "${specimen.id}": "${pattern}" matches no token`);
    else if (hits.every((t) => t.tier === 'component')) problems.push(`specimen "${specimen.id}": "${pattern}" matches component tokens only; a foundation presents raw and semantic tokens`);
    else if (specimen.tier && !hits.some((t) => t.tier === specimen.tier)) problems.push(`specimen "${specimen.id}": "${pattern}" matches no ${specimen.tier} token`);
  }
  if (display.types) {
    for (const t of specimenTokens(specimen, tokens)) {
      if (!display.types.includes(t.type)) problems.push(`specimen "${specimen.id}": ${t.path} is a ${t.type ?? 'untyped'} token; the "${specimen.display}" display draws ${display.types.join(', ')}`);
    }
  }
  return problems;
}

/**
 * Raw and semantic tokens no foundation presents (in a specimen) or owns. A new token outside
 * every foundation pattern would never reach the Foundations pages.
 */
export function uncoveredTokens(foundations, tokens) {
  const covered = (t) => foundations.some((f) => (f.tokens ?? []).some((p) => matchesPattern(p, t.path)) || (f.specimens ?? []).some((s) => (!s.tier || s.tier === t.tier) && s.tokens.some((p) => matchesPattern(p, t.path))));
  return tokens.filter((t) => t.tier !== 'component' && !covered(t)).map((t) => t.path);
}

/** The fontFamily token sharing the longest path prefix (at least two segments) with `path`. */
export function nearestFamily(path, tokens) {
  const segs = path.split('.');
  let best = null;
  let bestLength = 1;
  for (const t of tokens) {
    if (t.type !== 'fontFamily') continue;
    let n = 0;
    while (n < segs.length && t.segments[n] === segs[n]) n++;
    if (n > bestLength) { best = t; bestLength = n; }
  }
  return best;
}

/** Cubic Bézier control points [x1, y1, x2, y2] as an SVG path in a 100 x 100 box (y up). */
export function easingPath([x1, y1, x2, y2]) {
  const p = (x, y) => `${+(x * 100).toFixed(2)} ${+(100 - y * 100).toFixed(2)}`;
  return `M ${p(0, 0)} C ${p(x1, y1)}, ${p(x2, y2)}, ${p(1, 1)}`;
}
