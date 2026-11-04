/**
 * What the theme reads from the design system and the check of the mapping against it, on the
 * shared theme library (scripts/lib/theme-mapping.mjs: loadQuantum, checkMapping, tokenTrace,
 * pxNumber), plus what is shadcn's own: the values the mapping gives each variable per mode
 * (resolveMapping) and which variables get a `--color-*` bridge (isColorVariable). build.mjs
 * and the test call only these functions. Zero dependencies.
 */
import { loadQuantum, checkMapping as checkThemeMapping, tokenTrace, pxNumber, ALLOWED_TIERS, ROOT } from '../../../scripts/lib/theme-mapping.mjs';

export { loadQuantum, tokenTrace, pxNumber, ALLOWED_TIERS, ROOT };

/** The mapping as the shared check reads it: the token groups and the component equivalences. */
const shape = (mapping) => ({ tokens: { VARIABLES: mapping.VARIABLES ?? {}, THEME: mapping.THEME ?? {} }, components: mapping.COMPONENTS ?? [] });

/**
 * Every problem of a mapping (src/mapping.mjs) against the design system: a token path that
 * does not exist or is not semantic or component, a component id without a spec, a property,
 * option, state or anatomy part the spec does not declare. Returns a list of messages; empty
 * means the mapping holds.
 */
export const checkMapping = (mapping, quantum) => checkThemeMapping(quantum, shape(mapping));

/** Throw with every problem of checkMapping, one per line. */
export function assertMapping(mapping, quantum) {
  const problems = checkMapping(mapping, quantum);
  if (problems.length) throw new Error(`src/mapping.mjs does not match the Quantum tokens and specs:\n  ${problems.join('\n  ')}`);
}

/**
 * The value of every mapped variable in every mode: { light, dark, theme }, each
 * name -> { value, token, trace }. VARIABLES go to `light` (every entry) and `dark` (every
 * entry not limited to `modes: ['light']`); THEME goes to `theme` (mode-independent, light
 * values; a font gets its `fallback` stack appended).
 */
export function resolveMapping(mapping, quantum) {
  assertMapping(mapping, quantum);
  const entry = (map, e) => {
    const t = map.get(e.token);
    const value = e.fallback ? `${t.value}, ${e.fallback}` : t.value;
    return { value, token: e.token, trace: tokenTrace(t) };
  };
  const out = { light: {}, dark: {}, theme: {} };
  for (const [name, e] of Object.entries(mapping.VARIABLES)) {
    const modes = e.modes ?? quantum.modes;
    if (modes.includes('light')) out.light[name] = entry(quantum.light, e);
    if (modes.includes('dark')) out.dark[name] = entry(quantum.dark, e);
  }
  for (const [name, e] of Object.entries(mapping.THEME)) out.theme[name] = entry(quantum.light, e);
  return out;
}

/** Whether a resolved value is a CSS color (it gets a `--color-<name>` bridge in `@theme inline`). */
export const isColorVariable = (mapping, quantum, name) => quantum.light.get(mapping.VARIABLES[name].token)?.type === 'color';
