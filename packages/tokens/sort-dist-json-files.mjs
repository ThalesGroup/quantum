#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

// --- Utility: sort JSON keys deeply in a stable way ---
function sortJson(value) {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const sortedEntries = Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => [k, sortJson(v)]);
    return Object.fromEntries(sortedEntries);
  }
  return value;
}

async function processFile(file) {
  console.log(`Sorting ${file}...`);
  const tmpFile = `${file}.tmp`;

  try {
    const text = await fs.readFile(file, 'utf8');

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }

    const sorted = sortJson(json);
    const sortedText = JSON.stringify(sorted, null, 2) + '\n';

    await fs.writeFile(tmpFile, sortedText);
    await fs.rename(tmpFile, file);

    console.log(`Successfully sorted: ${file}`);
  } catch (err) {
    console.error(`Error: Failed to process ${file}. ${err.message}`);
    try {
      await fs.unlink(tmpFile);
    } catch {
      // ignore cleanup errors
    }
  }
}

async function main() {
  // Ensure glob is resolved from current working directory
  const cwd = process.cwd();

  const files = await glob('dist/**/*.json', {
    cwd,
    nodir: true,
    absolute: true,
  });

  if (!files.length) {
    console.log('No JSON files found in dist/**/*.json');
    return;
  }

  for (const file of files) {
    // Use absolute path from glob, but logs will show it directly
    await processFile(file);
  }

  console.log('All JSON files have been processed.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
