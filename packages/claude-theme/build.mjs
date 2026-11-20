#!/usr/bin/env node
/**
 * The Quantum tokens -> Claude Quantum, a theme mod for the Claude Code desktop app: the app's
 * colors from the Quantum semantic tokens, over a still ground of dots on the spacing grid.
 *
 *   node packages/claude-theme/build.mjs                    write dist/claude-quantum/
 *   node packages/claude-theme/build.mjs --install <dir>    and copy the mod into <dir>/claude-quantum/
 *
 * dist/claude-quantum/ is a Claude Code plugin: .claude-plugin/plugin.json, hooks/hooks.json,
 * hooks/register.tsx (src/register.tsx as it is) and hooks/look.ts (generated: the app's colors
 * in both modes, made by Claude Code's own makeColors, vendor/make-colors.js, from the tokens of
 * COLORS, and the dotted ground of DOTS). Load it with `claude --plugin-dir <it>`, or copy it into
 * a mods folder.
 *
 * Reads the token sources through scripts/lib/theme-mapping.mjs, so it needs no token build, and
 * throws when a token it names does not exist or is not a semantic token. Not committed (dist/
 * is ignored).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadQuantum, checkTokenPath } from '../../scripts/lib/theme-mapping.mjs';
import { makeColors, checkColors } from './vendor/make-colors.js';

const PKG = path.dirname(fileURLToPath(import.meta.url));
export const DIST = path.join(PKG, 'dist');
export const MOD = 'claude-quantum';
const pkg = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'));

const hex6 = (value, where) => {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(value ?? '');
  if (!m) throw new Error(`${where}: "${value}" is not a hex color`);
  return `#${m[1].toUpperCase()}`;
};

/**
 * The app's colors, by the Quantum semantic token each reads, for makeColors (vendor/make-colors.js):
 * the gray anchors of each mode, and the five roles, whose hue the app keeps and whose lightness
 * it sets. Surface 0 is the darkest in both modes, so the light page is neutral 2 under neutral 1
 * cards and panels; the dark ones climb the neutral base steps as the site's cards do.
 */
export const COLORS = {
  anchors: {
    light: {
      'surface-0': 'global.bg.base.neutral.2',
      'surface-1': 'global.bg.base.neutral.1',
      'surface-2': 'global.bg.base.neutral.1',
      'text-primary': 'global.text.on-base.neutral.primary',
      'text-secondary': 'global.text.on-base.neutral.secondary',
      'text-muted': 'global.text.on-base.neutral.tertiary',
    },
    dark: {
      'surface-0': 'global.bg.base.neutral.1',
      'surface-1': 'global.bg.base.neutral.2',
      'surface-2': 'global.bg.base.neutral.3',
      'surface-3': 'global.bg.base.neutral.4',
      'text-primary': 'global.text.on-base.neutral.primary',
      'text-secondary': 'global.text.on-base.neutral.secondary',
      'text-muted': 'global.text.on-base.neutral.tertiary',
    },
  },
  // Each role: `seed`, whose hue the app's ramp takes; `fill` and `hover`, the stops its filled
  // controls paint at rest and on hover, set by hand to Quantum's own pair (makeColors' hover is
  // the stop beside the fill shade, so both stops are pinned).
  roles: {
    accent: { seed: 'global.text.on-base.brand.default', fill: 'global.bg.accent.brand.default', hover: 'global.bg.accent.brand.hover' },
    danger: { seed: 'global.text.on-base.functional.error.default', fill: 'global.bg.accent.functional.error.default', hover: 'global.bg.accent.functional.error.hover' },
    success: { seed: 'global.text.on-base.functional.success.default', fill: 'global.bg.accent.functional.success.default', hover: 'global.bg.accent.functional.success.hover' },
    // Light only: in dark mode the app paints an active editor comment as 45% of the warning
    // fill under light text, and Quantum's bright warning fill leaves it at 2.9:1, which makes
    // the app refuse the whole theme. Dark mode keeps the ramp made from the seed.
    warning: { seed: 'global.bg.accent.functional.warning.default', fill: 'global.bg.accent.functional.warning.default', hover: 'global.bg.accent.functional.warning.hover', modes: ['light'] },
    pro: { seed: 'global.text.on-base.extended.lavender.default', fill: 'global.bg.accent.extended.lavender.default', hover: 'global.bg.accent.extended.lavender.hover' },
  },
};

/** The stop each role's filled controls paint (makeColors' own defaults), and the stop beside it its hover reads. */
const FILL_SHADE = { warning: 200 };
const HOVER_STOP = { 450: 400, 200: 250 };

/** The app's colors from COLORS: makeColors' theme. Throws where the desktop app would not paint it. */
export function resolveColors(quantum) {
  const all = [...Object.values(COLORS.anchors).flatMap(Object.values), ...Object.values(COLORS.roles).flatMap(({ seed, fill, hover }) => [seed, fill, hover])];
  const problems = [...new Set(all)].flatMap((p) => checkTokenPath(quantum, p, 'COLORS'));
  if (problems.length) throw new Error(problems.join('\n'));
  const pick = (mode, table) => Object.fromEntries(Object.entries(table).map(([k, p]) => [k, hex6(quantum[mode].get(p).value, `${mode} ${p}`)]));
  const roles = (mode) => Object.fromEntries(Object.entries(COLORS.roles).map(([role, { seed, fill, hover, modes }]) => {
    const shade = FILL_SHADE[role] ?? 450;
    const tok = (p) => hex6(quantum[mode].get(p).value, `${mode} ${p}`);
    if (modes && !modes.includes(mode)) return [role, { seed: tok(seed) }];
    return [role, { seed: tok(seed), fillShade: shade, stops: { [shade]: tok(fill), [HOVER_STOP[shade]]: tok(hover) } }];
  }));
  const half = (mode) => ({ gray: { anchors: pick(mode, COLORS.anchors[mode]) }, roles: roles(mode) });
  const made = makeColors({ label: 'Claude Quantum', id: 'claude-quantum', light: half('light'), dark: half('dark') });
  const unpainted = made.problems.filter((l) => l.startsWith("Desktop won't paint"));
  if (unpainted.length) throw new Error(unpainted.join('\n'));
  // checkColors also lists the contrast notes makeColors gave (they paint); any other line is a name the app does not know.
  const unknown = checkColors(made.theme).filter((l) => !/\d:1\b/.test(l));
  if (unknown.length) throw new Error(unknown.join('\n'));
  return made;
}

/**
 * The ground behind the conversation: one dot per step of the spacing grid, by the Quantum
 * semantic tokens of its lengths and colors, on the page color, over the whole window. The
 * conversation's rows and the app's bars are drawn on a solid page color over it
 * (src/register.tsx), so the dots show around them and never behind the text. One still scene
 * per mode, each in that mode's colors.
 */
export const DOTS = {
  step: 'space.16',
  dot: 'space.2',
  color: { light: 'global.border.base.neutral.4', dark: 'global.border.base.neutral.4' },
  page: { light: COLORS.anchors.light['surface-0'], dark: COLORS.anchors.dark['surface-0'] },
};

/** One mode's dotted scene (an SVG document), its lengths and colors from DOTS. */
function dotsSvg(mode, px, color) {
  const step = px(DOTS.step);
  const r = px(DOTS.dot) / 2;
  const c = step / 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">`,
    `<defs><pattern id="dots" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="${c}" cy="${c}" r="${r}" fill="${color(mode, DOTS.color[mode])}"/></pattern></defs>`,
    `<rect width="100%" height="100%" fill="${color(mode, DOTS.page[mode])}"/>`,
    `<rect width="100%" height="100%" fill="url(#dots)"/>`,
    `</svg>`,
  ].join('');
}

/** By mode: the dotted scene, and the page color the rows and bars are drawn on. */
export function resolveDots(quantum) {
  const check = (p) => {
    const problems = checkTokenPath(quantum, p, 'DOTS');
    if (problems.length) throw new Error(problems.join('\n'));
    return p;
  };
  const px = (p) => {
    const m = /^([\d.]+)px$/.exec(quantum[quantum.modes[0]].get(check(p)).value ?? '');
    if (!m) throw new Error(`DOTS: ${p} is not a px length`);
    return Number(m[1]);
  };
  const color = (mode, p) => hex6(quantum[mode].get(check(p)).value, `${mode} ${p}`);
  return Object.fromEntries(['light', 'dark'].map((mode) => [mode, { scene: dotsSvg(mode, px, color), page: color(mode, DOTS.page[mode]) }]));
}

/** hooks/look.ts: the colors and the ground as data. */
export function renderLook(colors, dots) {
  return [
    `// Generated by @quantum-ds/claude-theme build.mjs from the Quantum tokens (${pkg.version}): do not edit.`,
    `import type { ThemeColors } from 'claude-code'`,
    ``,
    `// The app's colors in both modes, from the Quantum tokens (build.mjs COLORS), by makeColors.`,
    ...colors.problems.map((l) => `// ${l}`),
    `export const COLORS: ThemeColors = ${JSON.stringify(colors.theme)}`,
    ``,
    `// By mode: dots on the spacing grid (an SVG scene), and the page color rows and bars are drawn on (build.mjs DOTS).`,
    `export const DOTS: Record<'light' | 'dark', { scene: string; page: \`#\${string}\` }> = ${JSON.stringify(dots)}`,
    ``,
  ].join('\n');
}

export function build(out = path.join(DIST, MOD)) {
  const quantum = loadQuantum();
  const colors = resolveColors(quantum);
  const dots = resolveDots(quantum);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, '.claude-plugin'), { recursive: true });
  fs.mkdirSync(path.join(out, 'hooks'), { recursive: true });
  fs.writeFileSync(path.join(out, '.claude-plugin', 'plugin.json'), `${JSON.stringify({
    name: MOD,
    version: pkg.version,
    description: 'Claude Quantum: the Quantum Design System colors in the Claude Code desktop app, over dots on its spacing grid, the conversation and bars on a solid page color. /quantum-theme light, dark or off.',
    author: { name: pkg.author },
    license: pkg.license,
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(out, 'hooks', 'hooks.json'), `${JSON.stringify({ modules: ['./register.tsx'] })}\n`);
  fs.copyFileSync(path.join(PKG, 'src', 'register.tsx'), path.join(out, 'hooks', 'register.tsx'));
  fs.writeFileSync(path.join(out, 'hooks', 'look.ts'), renderLook(colors, dots));
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = build();
  console.log(`claude-theme: ${path.relative(process.cwd(), out)}`);
  const i = process.argv.indexOf('--install');
  if (i > 0) {
    const dir = process.argv[i + 1];
    if (!dir) throw new Error('--install needs a folder');
    const target = path.join(path.resolve(dir), MOD);
    // Replace the mod's own files only: the engine keeps its types and tsconfig.json beside them.
    fs.rmSync(path.join(target, 'hooks'), { recursive: true, force: true });
    fs.cpSync(out, target, { recursive: true, force: true });
    console.log(`claude-theme: installed in ${target}`);
  }
}
