#!/usr/bin/env node
/**
 * Scaffold the four artifacts of a new component and its starter Figma blueprint.
 *   pnpm new:component <id> --name "Display name" --role <componentRole> [--summary "..."]
 * Creates: spec, component tokens, docs page, web CSS + template, Figma blueprint (lib/scaffold.mjs,
 * paths in scripts/lib/paths.mjs);
 * builds the tokens (the generated entry point of @quantum-ds/tokens then imports the component's
 * token file), then registers the component's CSS in the components' index.css.
 * Then: fill the TODOs, rewrite the blueprint from the real CSS, run `pnpm tokens:build` and `pnpm check`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadA11y } from './lib/a11y.mjs';
import { PATHS, FILES, artifacts } from './lib/paths.mjs';
import { scaffoldComponent } from './lib/scaffold.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
if (!id || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: pnpm new:component <kebab-id> --name "Display name" --role <role> [--summary "..."]');
  process.exit(1);
}
const name = opt('name', id.replace(/(^|-)([a-z])/g, (_, __, c) => ` ${c.toUpperCase()}`).trim());
const role = opt('role', 'presentation');
const summary = opt('summary', `TODO: one sentence describing what ${name} does.`);
const today = new Date().toISOString().slice(0, 10);

const schema = JSON.parse(fs.readFileSync(path.join(root, FILES.componentSchema), 'utf8'));
const roles = schema.$defs.componentRole.enum;
if (!roles.includes(role)) {
  console.error(`Unknown role "${role}". Allowed: ${roles.join(', ')}`);
  process.exit(1);
}

const { files, profile, element } = scaffoldComponent({ id, name, role, summary, today, a11y: loadA11y(root) });

for (const rel of Object.keys(files)) {
  if (fs.existsSync(path.join(root, rel))) {
    console.error(`Refusing to overwrite existing ${rel}`);
    process.exit(1);
  }
}
for (const [rel, content] of Object.entries(files)) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(`  + ${rel}`);
}

// Generate the component's token CSS (and the tokens entry point importing it) before the components' index.css imports the component.
const imports = [`@import "./components/${id}/${id}.css";`];
console.log('\nBuilding tokens:');
const build = spawnSync(process.execPath, [path.join(root, 'scripts/build-tokens.mjs')], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) {
  console.error(`\nThe token build failed, so ${FILES.webIndexCss} was left unchanged. Fix the tokens, run "pnpm tokens:build", then add:\n  ${imports.join('\n  ')}`);
  process.exit(1);
}

const indexPath = path.join(root, FILES.webIndexCss);
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(/(@import "\.\/components\/[^"]+";\n)(?![\s\S]*@import "\.\/components\/)/, `$1${imports[0]}\n`);
fs.writeFileSync(indexPath, index);
console.log(`  ~ ${FILES.webIndexCss} (import added)`);
if (!profile) console.log(`\nRole "${role}" has no accessibility profile: add it to ${FILES.a11y}/roles.json from its APG pattern and WAI-ARIA role (trusted sources only) before "pnpm check" can pass.`);
console.log('\nNext: fill the TODOs, citing trusted sources for every accessibility statement, then run "pnpm tokens:build" after any token change, "pnpm check" and "pnpm impact".');
console.log(`The Figma blueprint ${artifacts(id).figma} only draws the scaffolded CSS: rewrite its tree from the real CSS and template (${PATHS.figma}/AGENTS.md).`);
console.log(`The docs are built with the design system: once implementations.web is final, "pnpm validate" lists every native <${element}> of the site that ${name} now covers; switch them to the component and update the table in ${PATHS.docs}/AGENTS.md.`);
