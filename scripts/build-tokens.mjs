#!/usr/bin/env node
/**
 * Build the token outputs declared in packages/tokens/tokens.config.json: CSS custom properties per
 * tier, with one rule per mode context (packages/tokens/dist/css/**.css, plus the index.css entry
 * point), one resolved DTCG tree per platform overlay and mode
 * (packages/tokens/dist/platforms/<id>/<mode>.tokens.json), and the syntax highlighting theme
 * (packages/tokens/dist/shiki-theme.json, tokens.config.json → syntax). Fails on any token problem.
 * The package's other formats come from packages/tokens/style-dictionary.config.mjs; `pnpm tokens:build`
 * runs both.
 *   node scripts/build-tokens.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll, checkReferences, checkPlatforms, checkModes, planOutputs } from './lib/dtcg.mjs';
import { checkSyntax, planSyntaxOutputs } from './lib/syntax-theme.mjs';
import { PATHS } from './lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = path.join(root, PATHS.tokens);

const loaded = loadAll(tokensDir);
const problems = [...checkReferences(loaded), ...checkPlatforms(loaded), ...checkModes(loaded), ...checkSyntax(loaded)];
if (problems.length) {
  console.error('Token problems:');
  for (const p of problems) console.error(`  - ${[p.platform, p.mode].filter(Boolean).map((x) => `[${x}] `).join('')}${p.token} (${p.file}): ${p.message}`);
  process.exit(1);
}

const outputs = new Map([...planOutputs(loaded, tokensDir), ...planSyntaxOutputs(loaded, (p) => path.resolve(tokensDir, p))]);
for (const [file, css] of outputs) {
  const rel = path.relative(root, file);
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current === css) {
    console.log(`  = ${rel} (unchanged)`);
    continue;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, css);
  console.log(`  + ${rel}`);
}
// Remove generated files that no output claims any more: component CSS of a deleted component,
// platform trees of a removed mode.
const generatedDirs = [];
const componentTier = loaded.config.tiers.find((t) => t.splitByTopLevelGroup);
if (componentTier) generatedDirs.push([path.dirname(path.resolve(tokensDir, componentTier.output)), '.css']);
for (const p of loaded.platforms) if (p.output) generatedDirs.push([path.dirname(path.resolve(tokensDir, p.output)), '.json']);
for (const [dir, ext] of generatedDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f.endsWith(ext) && !outputs.has(full)) {
      fs.unlinkSync(full);
      console.log(`  - ${path.relative(root, full)} (orphaned, removed)`);
    }
  }
}
console.log(`Built ${outputs.size} files from ${loaded.all.length} tokens (${loaded.platforms.map((p) => p.id).join(', ') || 'no'} platform overlays; ${loaded.modes.map((m) => m.id).join(', ') || 'no'} modes).`);
