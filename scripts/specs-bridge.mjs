#!/usr/bin/env node
/**
 * Specs bridge CLI. See scripts/lib/specs-bridge.mjs for the mapping.
 *
 *   node scripts/specs-bridge.mjs check                 every component: export validates against the
 *                                                       pinned Specs schema and round-trips losslessly
 *   node scripts/specs-bridge.mjs export [id...] [--out dir]
 *                                                       write <id>.specs.json + <id>.quantum.json (default build/specs)
 *   node scripts/specs-bridge.mjs import <file.specs.json> [--sidecar <file.quantum.json>] [--out dir]
 *                                                       write <id>.spec.json + <id>.tokens.json (default build/specs-import);
 *                                                       never writes into the specs or the token sources
 * Exit code 1 on any error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flatten } from './lib/dtcg.mjs';
import { toSpecs, fromSpecs, tokensToTree } from './lib/specs-bridge.mjs';
import { loadSpecsSchema } from './lib/specs-schema.mjs';
import { PATHS, artifacts } from './lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
};

function loadComponent(id) {
  const spec = readJson(path.join(root, artifacts(id).spec));
  const tokenFile = path.join(root, spec.tokens?.source ?? artifacts(id).tokens);
  return { spec, tokens: fs.existsSync(tokenFile) ? readJson(tokenFile) : {} };
}

const allIds = () => fs.readdirSync(path.join(root, PATHS.specs, 'components')).filter((f) => f.endsWith('.spec.json')).map((f) => f.replace('.spec.json', '')).sort();

// ---------------------------------------------------------------------------
// Structural diff (key order ignored, array order kept)
// ---------------------------------------------------------------------------
function diff(a, b, at = '') {
  if (a === b) return [];
  const isObj = (v) => v !== null && typeof v === 'object';
  if (!isObj(a) || !isObj(b) || Array.isArray(a) !== Array.isArray(b)) return [`${at || '/'}: ${JSON.stringify(a)} became ${JSON.stringify(b)}`];
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => diff(a[k], b[k], `${at}/${k}`));
}
const tokenRecord = (t) => ({ value: t.value, type: t.type ?? null, ...(t.description ? { description: t.description } : {}), ...(t.extensions ? { extensions: t.extensions } : {}) });

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------
function check() {
  const { version, validate } = loadSpecsSchema();
  const errors = [];
  const info = [];
  const ids = allIds();
  for (const id of ids) {
    const where = artifacts(id).spec;
    const { spec, tokens } = loadComponent(id);
    let out;
    try {
      out = toSpecs(spec, tokens);
    } catch (e) {
      errors.push(`${where}: cannot export to Specs: ${e.message}`);
      continue;
    }
    if (!validate(out.component)) {
      for (const e of validate.errors.slice(0, 10)) errors.push(`${where}: Specs export invalid at ${e.instancePath || '/'}: ${e.message}`);
      errors.push(`${where}: fix the mapping in scripts/lib/specs-bridge.mjs, the spec is not at fault`);
    }
    // Serialise like a real export, then come back.
    const back = fromSpecs(JSON.parse(JSON.stringify(out.component)), JSON.parse(JSON.stringify(out.sidecar)));
    for (const d of diff(spec, back.spec)) errors.push(`${where}: spec round trip changed ${d}`);
    const before = Object.fromEntries(flatten(tokens).map((t) => [t.path, tokenRecord(t)]));
    const after = Object.fromEntries([...back.tokens].map(([p, t]) => [p, tokenRecord(t)]));
    for (const d of diff(before, after)) errors.push(`${where}: token round trip changed ${d}`);
    const residue = out.sidecar.tokens.residue;
    info.push(`${id}: ${out.component.variants?.length ?? 0} variants, ${Object.keys(before).length - residue.length}/${Object.keys(before).length} tokens as Specs styles${residue.length ? `, sidecar-only: ${[...new Set(residue.map((t) => t.path.split('.')[2]))].join(', ')}` : ''}`);
  }
  for (const line of info) console.log(`  ${line}`);
  if (errors.length) {
    for (const e of errors) console.error(`✖ ${e}`);
    console.error(`\nSpecs bridge: ${errors.length} error(s) against Specs schema ${version}.`);
    process.exit(1);
  }
  console.log(`✔ Specs bridge: ${ids.length} component(s) export to valid Specs ${version} and round-trip losslessly.`);
}

function exportCmd(args, outDir) {
  const { version, validate } = loadSpecsSchema();
  const ids = args.length ? args : allIds();
  let failed = false;
  for (const id of ids) {
    const { spec, tokens } = loadComponent(id);
    const { component, sidecar } = toSpecs(spec, tokens);
    if (!validate(component)) {
      failed = true;
      console.error(`✖ ${id}: export does not validate against Specs ${version}; run "pnpm specs:check"`);
      continue;
    }
    writeJson(path.join(outDir, `${id}.specs.json`), component);
    writeJson(path.join(outDir, `${id}.quantum.json`), sidecar);
    console.log(`✔ ${path.relative(root, path.join(outDir, `${id}.specs.json`))} (+ ${id}.quantum.json sidecar)`);
  }
  if (failed) process.exit(1);
}

function importCmd(args, outDir, sidecarPath) {
  if (!args[0]) throw new Error('usage: specs-bridge.mjs import <file.specs.json> [--sidecar <file.quantum.json>] [--out dir]');
  const component = readJson(path.resolve(args[0]));
  const sidecar = sidecarPath ? readJson(path.resolve(sidecarPath)) : undefined;
  const { spec, tokens } = fromSpecs(component, sidecar);
  writeJson(path.join(outDir, `${spec.id}.spec.json`), spec);
  writeJson(path.join(outDir, `${spec.id}.tokens.json`), tokensToTree(tokens));
  console.log(`✔ ${path.relative(root, outDir)}/${spec.id}.spec.json and ${spec.id}.tokens.json (${tokens.size} tokens)`);
  if (!sidecar) console.log('  No sidecar: prose, accessibility, implementations, version and status are empty. Review before moving into the specs and the token sources.');
}

// ---------------------------------------------------------------------------
const [command = 'check', ...rest] = process.argv.slice(2);
const option = (name) => {
  const i = rest.indexOf(name);
  if (i === -1) return undefined;
  const [, value] = rest.splice(i, 2);
  return value;
};
const out = option('--out');
const sidecar = option('--sidecar');
try {
  if (command === 'check') check();
  else if (command === 'export') exportCmd(rest, path.resolve(out ?? path.join(root, 'build/specs')));
  else if (command === 'import') importCmd(rest, path.resolve(out ?? path.join(root, 'build/specs-import')), sidecar);
  else throw new Error(`unknown command "${command}" (check | export | import)`);
} catch (e) {
  console.error(`✖ ${e.message}`);
  process.exit(1);
}
