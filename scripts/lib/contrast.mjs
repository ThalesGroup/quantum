/**
 * Contrast ratios between resolved DTCG colors (WCAG 2.2 definitions of relative luminance and
 * contrast ratio). Zero dependencies; shared by validate.mjs and the Astro site.
 *
 * A translucent foreground is composited over its background first, and a translucent
 * background over the opaque `base` given by the caller (the surface it sits on), so the ratio
 * is the one people actually see.
 */
import { resolveValue, resolveContext } from './dtcg.mjs';

/** { r, g, b, a } in 0..1 from a resolved DTCG color: a 2024+ object or a hex / rgb() string. */
export function parseColor(value) {
  if (value && typeof value === 'object') {
    if (Array.isArray(value.components) && (value.colorSpace ?? 'srgb') === 'srgb') {
      const [r, g, b] = value.components.map(Number);
      return { r, g, b, a: value.alpha ?? 1 };
    }
    if (typeof value.hex === 'string') return { ...parseColor(value.hex), a: value.alpha ?? 1 };
    throw new Error(`unsupported color value ${JSON.stringify(value)}`);
  }
  const s = String(value).trim();
  const hex = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`invalid hex color ${s}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  const rgb = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i);
  if (rgb) {
    const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? parseFloat(rgb[4]) / 100 : Number(rgb[4]);
    return { r: rgb[1] / 255, g: rgb[2] / 255, b: rgb[3] / 255, a: alpha };
  }
  throw new Error(`unsupported color value ${s}`);
}

/** Source-over compositing of `top` on an opaque `bottom`. */
export function composite(top, bottom) {
  const mix = (t, b) => t * top.a + b * (1 - top.a);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

/** WCAG relative luminance of an opaque sRGB color. */
export function luminance({ r, g, b }) {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast ratio (1..21) of `fg` on `bg`; translucent colors are composited over `base` (default white). */
export function contrastRatio(fg, bg, base = { r: 1, g: 1, b: 1, a: 1 }) {
  const back = bg.a < 1 ? composite(bg, base) : bg;
  const front = fg.a < 1 ? composite(fg, back) : fg;
  const [l1, l2] = [luminance(front), luminance(back)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Ratios are reported truncated to two decimals, never rounded up past a threshold. */
export const formatRatio = (ratio) => `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;

const hexOf = ({ r, g, b, a }) => `#${[r, g, b, ...(a < 1 ? [a] : [])].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`;

/**
 * Every context a token can resolve in: the base tiers (web, desktop) and each platform overlay,
 * each in every mode. `platform` is null for the base tiers.
 */
export function allContexts(loaded) {
  const platforms = [null, ...(loaded.platforms ?? []).map((p) => p.id)];
  const modes = (loaded.modes ?? []).length ? loaded.modes.map((m) => m.id) : [null];
  return platforms.flatMap((platform) => modes.map((mode) => ({ platform, mode, index: resolveContext(loaded, { platform, mode }) })));
}

/** Token paths matching a pattern: an exact path, or `group.*` for every token under the group. */
export function matchPaths(pattern, index) {
  if (!pattern.endsWith('.*')) return index.byPath.has(pattern) ? [pattern] : [];
  const prefix = pattern.slice(0, -1);
  return index.all.filter((t) => t.path.startsWith(prefix)).map((t) => t.path);
}

/**
 * Evaluate contrast pairs in every context.
 * A requirement without `minimum` is measured only: its rows have `minimum: null` and always pass.
 * A translucent background is composited over each surface of `on` (one row per surface,
 * `surface` names it), or over white without `on`; an opaque background gives one row.
 * @param {{ id: string, foreground: string, backgrounds: string[], on?: string[], minimum?: number }[]} requirements
 * @param {{ platform: string|null, mode: string|null, index: object }[]} contexts resolved token indexes
 * @returns {{ requirement: string, platform: string|null, mode: string|null, foreground: string, background: string, surface: string|null, fg: string, bg: string, ratio: number, minimum: number|null, pass: boolean, error?: string }[]}
 */
export function evaluateContrast(requirements, contexts) {
  const rows = [];
  for (const req of requirements) {
    const minimum = req.minimum ?? null;
    for (const ctx of contexts) {
      const color = (path) => {
        const t = ctx.index.byPath.get(path);
        if (!t) throw new Error(`unknown token ${path}`);
        if (t.type !== 'color') throw new Error(`${path} is not a color`);
        return parseColor(resolveValue(t.value, ctx.index.byPath, [path]));
      };
      const row = { requirement: req.id, platform: ctx.platform, mode: ctx.mode, foreground: req.foreground, surface: null, fg: '', bg: '', ratio: 0, minimum };
      const backgrounds = req.backgrounds.flatMap((p) => matchPaths(p, ctx.index));
      if (backgrounds.length === 0) rows.push({ ...row, background: req.backgrounds.join(', '), pass: false, error: 'no background token matches' });
      const surfaces = (req.on ?? []).flatMap((p) => matchPaths(p, ctx.index));
      if (req.on && surfaces.length === 0) {
        rows.push({ ...row, background: req.backgrounds.join(', '), surface: req.on.join(', '), pass: false, error: 'no surface token matches' });
        continue;
      }
      for (const background of backgrounds) {
        try {
          const fg = color(req.foreground);
          const bg = color(background);
          const under = bg.a < 1 && surfaces.length ? surfaces : [null];
          for (const surface of under) {
            const base = surface ? color(surface) : undefined;
            if (base && base.a < 1) throw new Error(`surface ${surface} is translucent`);
            const ratio = contrastRatio(fg, bg, base);
            const seen = bg.a < 1 ? composite(bg, base ?? { r: 1, g: 1, b: 1, a: 1 }) : bg;
            rows.push({ ...row, background, surface, fg: hexOf(fg), bg: hexOf(seen), ratio, pass: minimum === null || ratio >= minimum });
          }
        } catch (e) {
          rows.push({ ...row, background, pass: false, error: e.message });
        }
      }
    }
  }
  return rows;
}
