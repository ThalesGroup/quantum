#!/usr/bin/env node
/**
 * Check commit messages against Conventional Commits (agents/git.md "Commits").
 *
 *   node scripts/commit-lint.mjs --file <path>        one message file (the commit-msg hook)
 *   node scripts/commit-lint.mjs --message "<text>"   one message, before committing
 *   node scripts/commit-lint.mjs --base <ref>         every commit in <ref>..HEAD (CI)
 *   node scripts/commit-lint.mjs                      commits not pushed yet (@{upstream}..HEAD), else HEAD
 *
 * Scopes: component and foundation ids (packages/components/specs/) plus the areas of lib/conventional-commits.mjs.
 * Exit code 1 when a message fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lintCommit, AREA_SCOPES, TYPES } from './lib/conventional-commits.mjs';
import { PATHS } from './lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const tryGit = (...a) => { try { return git(...a); } catch { return null; } };

const componentIds = fs.readdirSync(path.join(root, PATHS.specs, 'components')).filter((f) => f.endsWith('.spec.json')).map((f) => f.replace(/\.spec\.json$/, ''));
const foundationsDir = path.join(root, PATHS.specs, 'foundations');
const foundationIds = fs.existsSync(foundationsDir) ? fs.readdirSync(foundationsDir).filter((f) => f.endsWith('.spec.json')).map((f) => f.replace(/\.spec\.json$/, '')) : [];
const scopes = [...componentIds, ...foundationIds, ...AREA_SCOPES];

/** [label, message] pairs to check. */
let messages;
if (opt('--file')) messages = [[opt('--file'), fs.readFileSync(opt('--file'), 'utf8')]];
else if (opt('--message') !== undefined) messages = [['message', opt('--message')]];
else {
  const base = opt('--base') ?? (tryGit('rev-parse', '--verify', '-q', '@{upstream}') ? '@{upstream}' : null);
  const range = base ? `${base}..HEAD` : null;
  const shas = (range ? tryGit('rev-list', '--no-merges', '--reverse', range) : tryGit('rev-parse', 'HEAD'))?.split('\n').filter(Boolean);
  if (!shas) {
    console.error(`Cannot list commits${range ? ` in ${range}` : ''}.`);
    process.exit(1);
  }
  messages = shas.map((sha) => [sha.slice(0, 7), git('log', '-1', '--format=%B', sha)]);
}

let failed = 0;
for (const [label, message] of messages) {
  const result = lintCommit(message, { scopes });
  if (result.ok) continue;
  failed++;
  console.log(`  ERROR ${label}: ${message.split('\n')[0]}`);
  for (const e of result.errors) console.log(`        ${e}`);
}
if (failed) {
  console.log(`\nTypes: ${Object.keys(TYPES).join(', ')}.\nScopes: ${scopes.join(', ')} (optional, comma-separated).\nSee agents/git.md "Commits".`);
}
console.log(`\nChecked ${messages.length} commit message(s): ${failed} failed.`);
process.exit(failed ? 1 : 0);
