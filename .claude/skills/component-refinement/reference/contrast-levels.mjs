// Contrast of a component's colors (or any tokens) on every surface level, per platform and mode.
// node contrast-levels.mjs <repo> <regex> [minimum]
//   <regex>   token paths to measure, matched against the resolved trees:
//             '^icon\.container\.color\.' (a component's colors) or '^global\..*warning' (candidates)
//   [minimum] 3 (non-text, the default) or 4.5 (text); ratios under it are marked with "!"
// Reads packages/tokens/dist/platforms/<platform>/<mode>.tokens.json: run `pnpm tokens:build` first.
// A translucent surface is composited over level 0 before measuring.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [repo, pattern, min = '3'] = process.argv.slice(2);
if (!repo || !pattern) { console.error('usage: node contrast-levels.mjs <repo> <regex> [minimum]'); process.exit(1); }
const { parseColor, contrastRatio, composite } = await import(pathToFileURL(path.join(repo, 'scripts/lib/contrast.mjs')).href);
const root = path.join(repo, 'packages/tokens/dist/platforms');
const flat = (o, p = '', out = {}) => {
  for (const k in o) {
    if (k.startsWith('$')) continue;
    const v = o[k];
    if (v && v.$value !== undefined) out[p + k] = v.$value;
    else if (v && typeof v === 'object') flat(v, `${p}${k}.`, out);
  }
  return out;
};
const LEVELS = ['0', '1', '2', '3', 'sunken'];
const re = new RegExp(pattern);
for (const platform of fs.readdirSync(root)) {
  for (const file of fs.readdirSync(path.join(root, platform)).filter((f) => f.endsWith('.tokens.json'))) {
    const t = flat(JSON.parse(fs.readFileSync(path.join(root, platform, file), 'utf8')));
    const base = parseColor(t['global.bg.level.0.default']);
    console.log(`\n${platform} ${file.replace('.tokens.json', '')}   levels ${LEVELS.join(' / ')}`);
    for (const id of Object.keys(t).filter((k) => re.test(k))) {
      let fg;
      try { fg = parseColor(t[id]); } catch { continue; } // not a color (a font, a size)
      if (!fg) continue;
      const ratios = LEVELS.map((l) => {
        const bg = parseColor(t[`global.bg.level.${l}.default`]);
        const r = contrastRatio(fg, bg.a < 1 ? composite(bg, base) : bg);
        return `${r.toFixed(2)}${r < Number(min) ? '!' : ' '}`;
      });
      console.log(`  ${id.padEnd(58)} ${ratios.join('  ')}`);
    }
  }
}
