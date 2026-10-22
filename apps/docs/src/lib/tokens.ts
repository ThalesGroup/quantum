// Build-time access to the DTCG tokens through the same library the CLI uses.
// @ts-ignore - plain ESM without types
import { loadAll, cssDeclarations, resolveValue, formatScalar, applyPlatform, resolveContext } from '../../../../scripts/lib/dtcg.mjs';
import { PATHS } from '../../../../scripts/lib/paths.mjs';
import { memo, repoPath } from './repo';

export interface TokenRow {
  path: string;
  segments: string[];
  tier: string;
  type: string | null;
  description: string | null;
  /** Raw $value as authored (alias strings kept). */
  value: unknown;
  /** Alias targets used by the value. */
  references: string[];
  /** Fully resolved CSS value (aliases followed). */
  resolved: string;
  /** Generated CSS declarations [name, value]. */
  css: [string, string][];
  file: string | null;
  /** Resolved value in every other mode where it differs from the default mode's. */
  modes: { mode: string; resolved: string }[];
}

const getLoaded = memo((): any => loadAll(repoPath(PATHS.tokens)));

/** Index of every token by path (loadAll's byPath), for alias walks. */
export const tokenIndex = (): Map<string, any> => getLoaded().byPath;

/** Resolved value of a token in an index, formatted as CSS (typography composites as JSON). */
const formatIn = (t: any, index: any): string => {
  const v = resolveValue(t.value, index.byPath, [t.path]);
  return typeof v === 'object' && t.type === 'typography' ? JSON.stringify(v) : formatScalar(t.type, v);
};

export interface Mode {
  id: string;
  default: boolean;
  scheme: string | null;
  description: string | null;
  files: string[];
}

/** Modes (tokens.config.json) and their web contexts (`css.modes`: the attribute and its auto value). */
export const getModes = memo((): { modes: Mode[]; attribute: string | null; auto: string | null } => {
  const loaded = getLoaded();
  const ctx = loaded.config.css?.modes ?? {};
  const modes = (loaded.modes as any[]).map((m) => ({ id: m.id, default: m.default, scheme: m.scheme, description: m.description, files: m.files }));
  return { modes, attribute: ctx.attribute ?? null, auto: ctx.auto ?? null };
});

export const getTokens = memo((): { rows: TokenRow[]; config: any } => {
  const loaded = getLoaded();
  const others = (loaded.modes as any[]).filter((m) => !m.default).map((m) => ({ id: m.id, index: resolveContext(loaded, { mode: m.id }) }));
  const rows: TokenRow[] = loaded.all.map((t: any) => {
    let resolved = '';
    let css: [string, string][] = [];
    const modes: TokenRow['modes'] = [];
    try {
      resolved = formatIn(t, loaded);
      css = cssDeclarations(t, loaded.byPath, loaded.config.css);
      for (const m of others) {
        const value = formatIn(m.index.byPath.get(t.path), m.index);
        if (value !== resolved) modes.push({ mode: m.id, resolved: value });
      }
    } catch (e: any) {
      resolved = `error: ${e.message}`;
    }
    return { path: t.path, segments: t.segments, tier: t.tier, type: t.type, description: t.description, value: t.value, references: t.references, resolved, css, file: t.file, modes };
  });
  return { rows, config: loaded.config };
});

export interface ModeOverride {
  path: string;
  tier: string;
  type: string | null;
  /** Value in the mode's overlay, as authored (alias kept). */
  value: unknown;
  /** Resolved value in the default mode. */
  base: string;
  /** Resolved value in the mode. */
  mode: string;
  description: string | null;
  file: string | null;
}

/** Every non-default mode: the tokens its overlay overrides and the component tokens that follow. */
export function modeTokens(): { id: string; overrides: ModeOverride[]; affects: string[] }[] {
  const loaded = getLoaded();
  return (loaded.modes as any[]).filter((m) => !m.default).map((m) => {
    const index = resolveContext(loaded, { mode: m.id });
    const overrides: ModeOverride[] = index.all.filter((t: any) => t.modeOverridden).map((t: any) => ({
      path: t.path, tier: t.tier, type: t.type, value: t.value, base: formatIn(loaded.byPath.get(t.path), loaded), mode: formatIn(t, index), description: t.description, file: t.file,
    }));
    const affects = index.all.filter((c: any) => c.tier === 'component' && formatIn(c, index) !== formatIn(loaded.byPath.get(c.path), loaded)).map((c: any) => c.path);
    return { id: m.id, overrides, affects };
  });
}

export const componentTokens = (id: string) => getTokens().rows.filter((r) => r.tier === 'component' && r.segments[0] === id);

export const isColor = (row: TokenRow) => row.type === 'color';

export const displayValue = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));

export interface PlatformOverride {
  path: string;
  tier: string;
  type: string | null;
  /** Resolved value on the web (base tiers). */
  base: string;
  /** Resolved value on the platform. */
  platform: string;
  /** Component tokens whose resolved value changes on the platform. */
  affects: string[];
  description: string | null;
  file: string | null;
}

/** Platforms with a token overlay (tokens.config.json) and what each one overrides. */
export function platformTokens(): { id: string; outputs: string[]; files: string[]; overrides: PlatformOverride[] }[] {
  const loaded = getLoaded();
  const fmt = formatIn;
  return (loaded.platforms as any[]).map((p) => {
    const { index } = applyPlatform(loaded, p);
    const overridden = index.all.filter((t: any) => t.overridden);
    const overrides: PlatformOverride[] = overridden.map((t: any) => {
      const affects = index.all
        .filter((c: any) => c.tier === 'component' && fmt(c, index) !== fmt(loaded.byPath.get(c.path), loaded))
        .filter((c: any) => JSON.stringify(resolveValue(c.value, index.byPath, [c.path])) !== JSON.stringify(resolveValue(loaded.byPath.get(c.path).value, loaded.byPath, [c.path])))
        .map((c: any) => c.path);
      return { path: t.path, tier: t.tier, type: t.type, base: fmt(loaded.byPath.get(t.path), loaded), platform: fmt(t, index), affects, description: t.description, file: t.file };
    });
    // One resolved tree per mode when the output path names {mode}.
    const output = p.output ? String(p.output).replace(/^\.\.\//, '') : null;
    const modes = output?.includes('{mode}') ? (loaded.modes as any[]).map((m) => m.id) : [''];
    const outputs = output ? modes.map((m) => output.replace('{mode}', m)) : [];
    return { id: p.id, outputs, files: p.files, overrides };
  });
}
