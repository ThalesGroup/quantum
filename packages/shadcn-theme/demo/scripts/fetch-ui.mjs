#!/usr/bin/env node
/**
 * Refresh the shadcn/ui components the demo shows, from the public shadcn registry.
 *
 *   node packages/shadcn-theme/demo/scripts/fetch-ui.mjs [name…]
 *
 * Downloads https://ui.shadcn.com/r/styles/<STYLE>/<name>.json for every component of
 * COMPONENTS (or the given names) and, recursively, the items they list in
 * `registryDependencies`, and writes each `files[].content` to demo/src/components/ui/<file>,
 * with the registry's import paths rewritten to the demo's aliases (components.json). The
 * files are committed, so the demo builds offline and the same every time: run this only to
 * take a newer version of shadcn's components, and review the diff. It also refreshes
 * demo/src/shadcn-tailwind.css, the `shadcn/tailwind.css` layer the new-york-v4 style imports
 * (custom variants such as `data-open:` and the accordion keyframes), from the pinned version
 * of the `shadcn` npm package (SHADCN_VERSION): the demo cannot install the CLI package.
 *
 * Nothing here is edited by hand afterwards: the theme is in ../../dist/quantum.css, never in
 * a component's class strings.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STYLE = 'new-york-v4';
const SHADCN_VERSION = '4.23.0';
const REGISTRY = `https://ui.shadcn.com/r/styles/${STYLE}`;
const DEMO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UI = path.join(DEMO, 'src/components/ui');

export const COMPONENTS = [
  'button', 'badge', 'alert', 'card', 'accordion', 'breadcrumb', 'pagination', 'progress',
  'skeleton', 'spinner', 'avatar', 'checkbox', 'radio-group', 'switch', 'input', 'textarea',
  'select', 'slider', 'label', 'separator', 'dropdown-menu', 'dialog', 'tabs', 'table',
  'tooltip', 'toggle', 'toggle-group', 'input-group', 'field', 'native-select',
];

// `utils` is demo/src/lib/utils.ts (`export { cn } from "cn"`), written by hand.
const SKIP = new Set(['utils']);

/** Rewrite the registry's import paths to the demo's aliases. */
export function rewriteImports(source) {
  return source
    .replaceAll(`@/registry/${STYLE}/ui/`, '@/components/ui/')
    .replaceAll(`@/registry/${STYLE}/lib/`, '@/lib/')
    .replaceAll(`@/registry/${STYLE}/hooks/`, '@/hooks/');
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const wanted = process.argv.slice(2).length ? process.argv.slice(2) : COMPONENTS;
  const queue = [...wanted];
  const done = new Set();
  const missing = [];
  fs.mkdirSync(UI, { recursive: true });
  while (queue.length) {
    const name = queue.shift();
    if (done.has(name) || SKIP.has(name)) continue;
    done.add(name);
    let item;
    try {
      item = await getJson(`${REGISTRY}/${name}.json`);
    } catch (e) {
      missing.push(name);
      console.warn(`skipped ${name}: ${e.message}`);
      continue;
    }
    for (const dep of item.registryDependencies ?? []) {
      if (/^https?:/.test(dep)) { console.warn(`${name}: remote registry dependency ${dep} not fetched`); continue; }
      queue.push(dep);
    }
    for (const file of item.files ?? []) {
      if (file.type !== 'registry:ui') { console.warn(`${name}: ${file.path} (${file.type}) not written`); continue; }
      const out = path.join(UI, path.basename(file.path));
      fs.writeFileSync(out, rewriteImports(file.content));
      console.log(`${name} -> ${path.relative(DEMO, out)}${item.dependencies?.length ? ` (needs ${item.dependencies.join(', ')})` : ''}`);
    }
  }
  const css = await fetch(`https://cdn.jsdelivr.net/npm/shadcn@${SHADCN_VERSION}/dist/tailwind.css`);
  if (!css.ok) throw new Error(`shadcn@${SHADCN_VERSION}/dist/tailwind.css: HTTP ${css.status}`);
  fs.writeFileSync(path.join(DEMO, 'src/shadcn-tailwind.css'), `/* shadcn/tailwind.css from shadcn@${SHADCN_VERSION} (MIT, https://github.com/shadcn-ui/ui), fetched by scripts/fetch-ui.mjs: do not edit. */\n${await css.text()}`);
  console.log(`shadcn@${SHADCN_VERSION}/dist/tailwind.css -> src/shadcn-tailwind.css`);
  if (missing.length) console.log(`Not in the ${STYLE} registry: ${missing.join(', ')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
