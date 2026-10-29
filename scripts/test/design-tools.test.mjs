import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATHS, FILES } from '../lib/paths.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, FILES.designTools), 'utf8'));
const tools = Object.entries(registry.tools);

/** Every source file of the packages and the scripts that may hold a workaround marker. */
function sources(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' || e.name === 'dist' ? [] : sources(rel);
    return /\.(m?js|ts|astro)$/.test(e.name) ? [rel] : [];
  });
}

test('every design tool has its exports, what they rely on, https sources and a review state', () => {
  for (const [id, tool] of tools) {
    assert.match(id, /^[a-z][a-z0-9-]*$/, id);
    assert.ok(tool.name, `${id}: name`);
    assert.ok(tool.exports?.length, `${id}: exports`);
    assert.ok(tool.reliesOn?.length, `${id}: reliesOn`);
    assert.ok(tool.sources?.length, `${id}: sources`);
    for (const s of tool.sources) {
      assert.match(s.url, /^https:\/\//, `${id}: ${s.url}`);
      assert.ok(s.covers, `${id}: ${s.url} covers`);
    }
    if (tool.reviewed !== null) {
      assert.ok(tool.reviewed.through, `${id}: reviewed.through`);
      assert.match(tool.reviewed.on, /^\d{4}-\d{2}-\d{2}$/, `${id}: reviewed.on`);
    }
  }
});

test('every upstream(…) marker names design tools of the registry', () => {
  const files = [PATHS.tokens, PATHS.figma, PATHS.penpot, PATHS.components, 'scripts'].flatMap(sources);
  const markers = files.flatMap((f) => [...fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/upstream\(([^)]*)\):/g)].map((m) => ({ f, ids: m[1].split(',') })));
  assert.ok(markers.length > 0);
  for (const { f, ids } of markers) {
    for (const id of ids) assert.ok(registry.tools[id.trim()], `${f}: upstream(${ids}) names no tool of ${FILES.designTools}`);
  }
});
