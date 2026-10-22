// Foundations: global specifications shared by every component (specs/foundations/). Derives,
// from the tokens, what the site shows next to a foundation: its tokens with their value in
// every mode, the specimens drawing the tokens it is built from, the contrast of its pairs in
// every platform x mode, and the components following it.
// @ts-ignore - plain ESM without types
import { loadAll, resolveContext, resolveValue, formatScalar, isAlias, aliasPath } from '../../../../scripts/lib/dtcg.mjs';
import { PATHS } from '../../../../scripts/lib/paths.mjs';
// @ts-ignore - plain ESM without types
import { allContexts, evaluateContrast, formatRatio } from '../../../../scripts/lib/contrast.mjs';
// @ts-ignore - plain ESM without types
import { DISPLAYS, specimenTokens, nearestFamily, easingPath } from '../../../../scripts/lib/specimens.mjs';
import { memo, repoPath } from './repo';
import { getTokens, type TokenRow } from './tokens';
import { platformName, platforms as allPlatforms } from './platforms';

const getContexts = memo((): any[] => allContexts(loadAll(repoPath(PATHS.tokens))));

const matches = (pattern: string, p: string) => (pattern.endsWith('.*') ? p.startsWith(pattern.slice(0, -1)) : p === pattern);

/** Token rows matched by a list of paths or group.* patterns, in token order. */
export function tokensOf(patterns: string[]): TokenRow[] {
  return getTokens().rows.filter((r) => patterns.some((p) => matches(p, r.path)));
}

export interface ContrastRow {
  requirement: string;
  platform: string | null;
  mode: string | null;
  foreground: string;
  background: string;
  /** Surface a translucent background was composited over (`on`). */
  surface: string | null;
  fg: string;
  bg: string;
  ratio: string;
  /** null: measured only, no requirement. */
  minimum: number | null;
  pass: boolean;
  error?: string;
}

/** Contrast of every requirement in every platform x mode context, computed like pnpm validate does. */
export function contrastOf(spec: { contrast?: any[] }): ContrastRow[] {
  return evaluateContrast(spec.contrast ?? [], getContexts()).map((r: any) => ({ ...r, ratio: formatRatio(r.ratio) }));
}

/** Components whose tokens alias a token the foundation owns: each component token and the owned tokens it aliases. */
export function followersOf(spec: { tokens: string[] }): { component: string; tokens: string[]; aliases: { path: string; owned: string[] }[] }[] {
  const owned = new Set(tokensOf(spec.tokens).map((r) => r.path));
  const byComponent = new Map<string, { path: string; owned: string[] }[]>();
  for (const r of getTokens().rows) {
    const hits = r.tier === 'component' ? r.references.filter((ref) => owned.has(ref)) : [];
    if (!hits.length) continue;
    byComponent.set(r.segments[0], [...(byComponent.get(r.segments[0]) ?? []), { path: r.path, owned: hits }]);
  }
  return [...byComponent].map(([component, aliases]) => ({ component, tokens: aliases.map((a) => a.path), aliases }));
}

// ---------------------------------------------------------------------------
// Specimens: the tokens a foundation is built from, drawn by display (scripts/lib/specimens.mjs).
// Everything here is read from the tokens: values in every mode, and per platform where an
// overlay changes them. The spec decides which tokens are drawn and how.
// ---------------------------------------------------------------------------

/** One value of a token in one context: its authored alias (if any), CSS text, inline style, resolved DTCG value. */
export interface SpecimenValue {
  alias: string | null;
  css: string;
  /** Inline CSS declarations of a typography composite (font-family: …; font-size: …). */
  style: string | null;
  /** Typography composite: each property formatted. */
  parts: { property: string; css: string }[];
  raw: unknown;
}

export interface SpecimenToken {
  path: string;
  name: string;
  /** Parent group path: one palette ramp. */
  group: string;
  tier: string;
  type: string | null;
  description: string | null;
  /** Default mode, base tiers (every platform without an overlay). */
  value: SpecimenValue;
  /** Every mode, default first (same value in each when the token does not vary per mode). */
  modes: { mode: string; value: SpecimenValue }[];
  varies: boolean;
  /** Platforms whose overlay gives the token another value (default mode). */
  platforms: { id: string; name: string; value: SpecimenValue }[];
  /** CSS font-family of the nearest family token, for font sizes and weights. */
  family: string | null;
}

const TYPOGRAPHY_TYPES: Record<string, string> = { fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', lineHeight: 'number', letterSpacing: 'dimension' };
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function valueIn(index: any, path: string): SpecimenValue {
  const t = index.byPath.get(path);
  const raw = resolveValue(t.value, index.byPath, [path]);
  const alias = isAlias(t.value) ? aliasPath(t.value) : null;
  if (t.type === 'typography' && raw && typeof raw === 'object') {
    const parts = Object.entries(TYPOGRAPHY_TYPES).filter(([k]) => k in (raw as any)).map(([k, type]) => ({ property: kebab(k), css: formatScalar(type, (raw as any)[k]) }));
    return { alias, css: parts.map((p) => p.css).join(' · '), style: parts.map((p) => `${p.property}: ${p.css}`).join('; '), parts, raw };
  }
  return { alias, css: formatScalar(t.type, raw), style: null, parts: [], raw };
}

const getSpecimenContexts = memo(() => {
  const loaded = loadAll(repoPath(PATHS.tokens));
  const modes = (loaded.modes as any[]).map((m) => ({ id: m.id, default: m.default, index: resolveContext(loaded, { mode: m.id }) }));
  const platforms = (loaded.platforms as any[]).map((p) => ({ id: p.id, name: platformName(p.id), index: resolveContext(loaded, { platform: p.id }) }));
  return { loaded, modes, platforms };
});

/** Tokens of one specimen, with their values in every mode and on every platform overlay. */
export function specimenOf(specimen: { tokens: string[]; tier?: string }): SpecimenToken[] {
  const { loaded, modes, platforms } = getSpecimenContexts();
  return specimenTokens(specimen, loaded.all).map((t: any) => {
    const base = modes.find((m) => m.default)?.index ?? loaded;
    const value = valueIn(base, t.path);
    const byMode = modes.map((m) => ({ mode: m.id, value: valueIn(m.index, t.path) }));
    const family = nearestFamily(t.path, loaded.all);
    return {
      path: t.path,
      name: t.segments.at(-1),
      group: t.segments.slice(0, -1).join('.'),
      tier: t.tier,
      type: t.type,
      description: t.description ?? null,
      value,
      modes: byMode,
      varies: byMode.some((m) => m.value.css !== value.css),
      platforms: platforms.map((p) => ({ id: p.id, name: p.name, value: valueIn(p.index, t.path) })).filter((p) => p.value.css !== value.css),
      family: family ? valueIn(base, family.path).css : null,
    };
  });
}

/** Names of the platforms without a token overlay: they take the base values. */
export function basePlatformNames(): string {
  const overlays = new Set(getSpecimenContexts().platforms.map((p) => p.id));
  return allPlatforms().filter((p) => !overlays.has(p.id)).map((p) => p.name).join(', ');
}

export { DISPLAYS, easingPath };

/**
 * Icon names the components use: the values their examples give to icon properties (component
 * properties and instance properties of repeated parts), in first-seen order.
 */
export function iconNamesOf(specs: any[]): string[] {
  const names = new Set<string>();
  for (const spec of specs) {
    const props = new Set<string>(spec.properties.filter((p: any) => p.type === 'icon').map((p: any) => p.id));
    const itemProps = new Set<string>(spec.anatomy.flatMap((a: any) => (a.properties ?? []).filter((p: any) => p.type === 'icon').map((p: any) => p.id)));
    const visit = (obj: Record<string, unknown>, keys: Set<string>) => {
      for (const [k, v] of Object.entries(obj)) {
        if (keys.has(k) && typeof v === 'string' && v) names.add(v);
        if (Array.isArray(v)) for (const entry of v) if (entry && typeof entry === 'object') visit(entry as Record<string, unknown>, itemProps);
      }
    };
    for (const ex of spec.examples ?? []) visit(ex.props, props);
  }
  return [...names];
}
