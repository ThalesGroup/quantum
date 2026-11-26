/**
 * Mirrored components: a component that always renders the same as another one. The icon button
 * is a button without a label (decision same-rendering-as-button in
 * packages/components/specs/components/icon-button.spec.json): its side, glyph, padding, fills, borders, corners, focus ring
 * and motion are the button's. Component tokens alias semantic tokens only (agents/conventions.md), so
 * the mirror keeps its own tokens and `pnpm validate` proves they resolve to the original's
 * values in every platform x mode; `pnpm impact` links a change of the original to the mirror.
 * The three plain fields mirror the Text field the same way (decision field-family-mirrors in
 * packages/components/specs/components/text-field.spec.json): one box, one set of values, and what
 * a field has alone is declared (`own`), what it lacks is declared (`ignore`).
 * Zero-dependency, shared by validate.mjs, impact.mjs and the tests.
 */
import { resolveValue } from './dtcg.mjs';

/**
 * - `component` mirrors `of`.
 * - `paths`: token path prefixes (after the component id) of the mirror, mapped to the original's;
 *   the first match wins, any other path is the same in both.
 * - `ignore`: patterns (`group.*` or exact, paths of the original without its id) of the original
 *   with no counterpart in the mirror, because they place what the mirror does not have (the
 *   button's label, the message of the search field).
 * - `own`: patterns (`group.*` or exact, paths of the mirror without its id, before `paths` maps
 *   them) of the mirror with no counterpart in the original, because they place what only the
 *   mirror has (the search glyph, the textarea's block padding). They are not compared. A pattern
 *   that matches a token the original also has, or no token at all, is an error: `own` never
 *   hides a value that must agree.
 * - `differs`: patterns (paths of the mirror without its id) that both components have but that the
 *   mirror sets on purpose to its own value, a decision saying so (the textarea's block padding, larger
 *   than the field's minimum). They are not compared. A pattern without a counterpart in the original
 *   (list it in own instead) or matching no token is an error.
 */
export const MIRRORS = [
  {
    component: 'icon-button',
    of: 'button',
    paths: [
      ['icon.color.', 'label.color.'],
      ['container.min-width.', 'container.min-height.'],
      ['container.padding.', 'container.padding-block.'],
    ],
    ignore: ['container.padding-inline.*', 'container.gap.*', 'label.typography.*'],
    own: [],
  },
  // The Text field's box (height, inline padding, text, border, corners, colors, focus ring,
  // label, description, motion) is the box of the three plain fields: a decision on it applies to
  // all four in the same change. The Select is not mirrored yet: it comes with the complex controls.
  { component: 'number-field', of: 'text-field', paths: [], ignore: [], own: [] },
  {
    component: 'search-field',
    of: 'text-field',
    paths: [],
    // A search field has no severity and no read-only state, so no message (decision no-error-state).
    ignore: ['control.background.readonly', 'control.background.error', 'control.background.warning', 'control.background.success', 'control.border-color.error', 'control.border-color.warning', 'control.border-color.success', 'control.outline-width.error', 'control.outline-width.warning', 'control.outline-width.success', 'control.outline-color.error', 'control.outline-color.warning', 'control.outline-color.success', 'message.*', 'severity-icon.*'],
    // The search glyph is the Text field's leading icon (decision leading-icon-optional): icon.* and
    // control.padding-inline-start.* are compared like the rest. padding-inline-start is a SUM, not an
    // independent value: icon.margin-inline + icon.size + the gap before the text (8 + 16 + 4,
    // 8 + 20 + 8, 8 + 24 + 8 = 28 / 36 / 40 today). Any step that changes the glyph size or margin
    // must recompute it, or the text runs under the glyph.
    own: [],
  },
  {
    component: 'textarea',
    of: 'text-field',
    paths: [],
    // No leading icon in a multi-line field (decision leading-icon-optional).
    // and no shortest input line: a textarea scrolls its text inside its padding, never clipping it to a
    // line box (decision value-line-not-clipped of the Text field).
    ignore: ['icon.*', 'control.padding-inline-start.*', 'control.line-height'],
    own: [],
    // The block padding that keeps the first line off the top edge (decision rows-and-resize): larger
    // than the Text field's minimum block padding (decision grows-with-text-size), which a textarea of
    // several rows needs from its first line on.
    differs: ['control.padding-block.*'],
  },
];

/** A resolved value as people read it: a hex color (with its alpha), a length, or JSON. */
const show = (v) => {
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (v?.hex) return v.alpha !== undefined && v.alpha < 1 ? `${v.hex} at ${+(v.alpha * 100).toFixed(1)} %` : v.hex;
  if (v?.colorSpace) return v.alpha === 0 ? 'transparent' : JSON.stringify(v);
  if (v?.unit) return `${v.value}${v.unit}`;
  return JSON.stringify(v);
};

const matches = (pattern, p) => (pattern.endsWith('.*') ? p.startsWith(pattern.slice(0, -1)) : p === pattern);

/** Path of the original (without its component id) that a mirror path (without its id) stands for. */
export function originalPath(mirror, local) {
  const hit = mirror.paths.find(([from]) => local.startsWith(from));
  return hit ? hit[1] + local.slice(hit[0].length) : local;
}

/** Mirrors whose original is `id` (a component whose change must reach them). */
export const mirrorsOf = (id) => MIRRORS.filter((m) => m.of === id);

/**
 * Compare a mirror with its original in every context.
 * @param {{ component: string, of: string, paths: [string, string][], ignore: string[], own?: string[], differs?: string[] }} mirror
 * @param {{ platform: string|null, mode: string|null, index: { all: object[], byPath: Map } }[]} contexts resolved token indexes (contrast.mjs allContexts)
 * @returns {{ message: string }[]} one problem per token: missing counterpart, or the first context where the values differ
 */
export function checkMirror(mirror, contexts) {
  const problems = [];
  if (!contexts.length) return problems;
  const local = (t, id) => t.path.slice(id.length + 1);
  const { all } = contexts[0].index;
  const mine = all.filter((t) => t.segments[0] === mirror.component);
  const theirs = all.filter((t) => t.segments[0] === mirror.of);
  if (!mine.length || !theirs.length) return [{ message: `mirrors ${mirror.of}, but ${!mine.length ? mirror.component : mirror.of} has no tokens` }];
  const pairs = [];
  const covered = new Set();
  const own = mirror.own ?? [];
  const ownHits = new Set();
  const differs = mirror.differs ?? [];
  const differsHits = new Set();
  for (const t of mine) {
    const l = local(t, mirror.component);
    const o = `${mirror.of}.${originalPath(mirror, l)}`;
    const counterpart = theirs.some((x) => x.path === o);
    const differsPattern = differs.find((p) => matches(p, l));
    if (differsPattern !== undefined) {
      differsHits.add(differsPattern);
      if (!counterpart) problems.push({ message: `${t.path} is listed in differs (scripts/lib/mirrors.mjs) but ${mirror.of} has no ${o}: list it in own when it places what ${mirror.of} lacks` });
      else covered.add(o);
      continue;
    }
    const ownPattern = own.find((p) => matches(p, l));
    if (ownPattern !== undefined) {
      ownHits.add(ownPattern);
      if (counterpart) problems.push({ message: `${t.path} is listed in own (scripts/lib/mirrors.mjs) but ${mirror.of} has ${o}: drop it from own so the two are compared` });
      continue;
    }
    covered.add(o);
    if (!counterpart) problems.push({ message: `${t.path} has no counterpart ${o} in ${mirror.of}: add the token to ${mirror.of}, or list it in own (scripts/lib/mirrors.mjs) when it places what ${mirror.of} lacks` });
    else pairs.push([t.path, o]);
  }
  for (const t of theirs) {
    const l = local(t, mirror.of);
    if (!covered.has(t.path) && !mirror.ignore.some((p) => matches(p, l))) problems.push({ message: `${t.path} has no counterpart in ${mirror.component}: add the token, or list it in ignore (scripts/lib/mirrors.mjs) when it places what ${mirror.component} lacks` });
  }
  for (const p of own) if (!ownHits.has(p)) problems.push({ message: `own "${p}" of ${mirror.component} (scripts/lib/mirrors.mjs) matches no token: remove it` });
  for (const p of differs) if (!differsHits.has(p)) problems.push({ message: `differs "${p}" of ${mirror.component} (scripts/lib/mirrors.mjs) matches no token: remove it` });
  for (const [a, b] of pairs) {
    for (const { platform, mode, index } of contexts) {
      let va;
      let vb;
      try {
        va = resolveValue(index.byPath.get(a).value, index.byPath);
        vb = resolveValue(index.byPath.get(b).value, index.byPath);
      } catch { break; } // unresolved aliases: reported by checkReferences
      if (JSON.stringify(va) !== JSON.stringify(vb)) {
        const where = [platform ?? 'base', mode].filter(Boolean).join(' / ');
        problems.push({ message: `${a} is ${show(va)} but ${b} is ${show(vb)} [${where}]: ${mirror.component} renders the same as ${mirror.of}` });
        break;
      }
    }
  }
  return problems;
}
