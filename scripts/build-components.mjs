#!/usr/bin/env node
/**
 * Build the published content of @quantum-ds/components: packages/components/dist/, the specs
 * (lib/spec-outputs.mjs) in the layout of packages/components/specs/. The output is a copy, so it
 * is not committed (.gitignore): pnpm build and the package's prepack run this script.
 *   node scripts/build-components.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planSpecOutputs } from './lib/spec-outputs.mjs';
import { PATHS } from './lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specsDir = path.join(root, PATHS.specs);
const distDir = path.join(root, PATHS.componentsDist);

const files = fs.readdirSync(specsDir, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => path.relative(specsDir, path.join(e.parentPath, e.name)).split(path.sep).join('/'));
const { outputs, problems } = planSpecOutputs(files, (f) => JSON.parse(fs.readFileSync(path.join(specsDir, f), 'utf8')), PATHS.specs);
if (problems.length) {
  console.error('Spec problems:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

// Start from an empty directory, so a deleted spec never lingers in the package.
fs.rmSync(distDir, { recursive: true, force: true });
for (const file of outputs) {
  const target = path.join(distDir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(specsDir, file), target);
}
console.log(`  + ${PATHS.componentsDist}/ (${outputs.length} files)`);
