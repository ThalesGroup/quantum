/**
 * Mirrored components: a component that always renders the same as another one. The icon button
 * is a button without a label (decision same-rendering-as-button in
 * packages/components/specs/components/icon-button.spec.json): its side, glyph, fills, borders, corners, focus ring
 * and motion are the button's. Component tokens alias semantic tokens only (agents/conventions.md), so
 * the mirror keeps its own tokens and `pnpm validate` proves they resolve to the original's
 * values in every platform x mode; `pnpm impact` links a change of the original to the mirror.
 * Zero-dependency, shared by validate.mjs, impact.mjs and the tests.
 */
import { resolveValue } from './dtcg.mjs';

/**
 * - `component` mirrors `of`.
 * - `paths`: token path prefixes (after the component id) of the mirror, mapped to the original's;
 *   the first match wins, any other path is the same in both.
 * - `ignore`: patterns (`group.*` or exact) of the original with no counterpart in the mirror,
 *   because they place what the mirror does not have (the button's label).
 */
export const MIRRORS = [
  {
    component: 'icon-button',
    of: 'button',
    paths: [
      ['icon.color.', 'label.color.'],
      ['container.min-width.', 'container.min-height.'],
    ],
    ignore: ['container.padding-inline.*', 'container.padding-block.*', 'container.gap.*', 'label.typography.*'],
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
 * @param {{ component: string, of: string, paths: [string, string][], ignore: string[] }} mirror
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
  for (const t of mine) {
    const o = `${mirror.of}.${originalPath(mirror, local(t, mirror.component))}`;
    covered.add(o);
    if (!theirs.some((x) => x.path === o)) problems.push({ message: `${t.path} has no counterpart ${o} in ${mirror.of}` });
    else pairs.push([t.path, o]);
  }
  for (const t of theirs) {
    const l = local(t, mirror.of);
    if (!covered.has(t.path) && !mirror.ignore.some((p) => matches(p, l))) problems.push({ message: `${t.path} has no counterpart in ${mirror.component}: add the token, or list it in ignore (scripts/lib/mirrors.mjs) when it places what ${mirror.component} lacks` });
  }
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
