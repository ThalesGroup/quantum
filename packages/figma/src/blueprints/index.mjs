/**
 * Every Figma blueprint: one module per component in this directory (`<id>.mjs`, default export),
 * loaded by file name. src/plan.mjs documents the format.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(here).filter((f) => f.endsWith('.mjs') && f !== 'index.mjs').sort();

/** Component id -> blueprint. */
export const BLUEPRINTS = Object.fromEntries(
  await Promise.all(files.map(async (f) => [f.replace(/\.mjs$/, ''), (await import(pathToFileURL(path.join(here, f)).href)).default])),
);
