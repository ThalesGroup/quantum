// The fill a component sits on without drawing it (scripts/lib/backdrop.mjs): a rendering whose
// active tokens read a role on a fill (the Icon with `surface: accent`) is drawn on that fill, the
// fill a product would draw around it, everywhere the site renders a component: examples, states
// matrix, playground (in the browser, from backdropData), the Modes page and foundation examples.
// @ts-ignore - plain ESM without types
import { fillsOf, backdropOf } from '../../../../scripts/lib/backdrop.mjs';
// @ts-ignore - plain ESM without types
import { aliasChain } from '../../../../scripts/lib/token-map.mjs';
import { componentTokens, getTokens, tokenIndex } from './tokens';
import { memo } from './repo';

type BackdropData = { tokens: { path: string; segments: string[] }[]; fills: Record<string, string> } | null;
const cache = memo(() => new Map<string, BackdropData>());

/**
 * What the browser needs to find the fill of a configuration: every token of the component, and
 * the CSS variable of the fill of those read on one. Null when the component draws every fill it
 * reads on (most components).
 */
export function backdropData(spec: any): BackdropData {
  if (!cache().has(spec.id)) cache().set(spec.id, compute(spec));
  return cache().get(spec.id)!;
}

function compute(spec: any): BackdropData {
  const byPath = tokenIndex();
  const rows = componentTokens(spec.id);
  const fills: Record<string, string> = fillsOf(rows.map((r) => ({ path: r.path, semantic: aliasChain(r.path, byPath).find((l: any) => l.tier === 'semantic')?.path ?? null })));
  if (!Object.keys(fills).length) return null;
  const cssVar = new Map(getTokens().rows.map((r) => [r.path, r.css[0]?.[0]]));
  return {
    tokens: rows.map((r) => ({ path: r.path, segments: r.segments })),
    fills: Object.fromEntries(Object.entries(fills).map(([path, fill]) => [path, cssVar.get(fill) as string])),
  };
}

/** The rendering, on the fill it sits on when it reads a role on one. */
export function onBackdrop(spec: any, html: string, props: Record<string, unknown> = {}, state: string | null = null): string {
  if (!html || !spec) return html;
  const data = backdropData(spec);
  const fill = data && backdropOf(spec, data.tokens, data.fills, props, state);
  return fill ? backdropHtml(html, fill) : html;
}

/** A rendering on a fill (the CSS variable of a background token); the playground draws it the same way in the browser. */
export const backdropHtml = (html: string, fill: string) => `<span class="site-backdrop" style="background-color: var(${fill})">${html}</span>`;
