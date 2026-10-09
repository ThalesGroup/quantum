import { promises as fs } from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DTCG_ROOT = path.join(__dirname, 'dtcg');
const OUTPUT_FILE = path.join(DTCG_ROOT, 'quantum.resolver.json');

async function listTokenFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await listTokenFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.tokens.json')) {
      files.push(path.relative(DTCG_ROOT, fullPath).replace(/\\/g, '/'));
    }
  }

  return files;
}

async function main() {
  try {
    await fs.access(DTCG_ROOT);
  } catch {
    console.error(`DTCG directory not found at: ${DTCG_ROOT}`);
    process.exit(1);
  }

  const foundationDir = path.join(DTCG_ROOT, 'foundation');
  const componentDir = path.join(DTCG_ROOT, 'component');

  const [foundationFiles, componentFiles] = await Promise.all([
    listTokenFiles(foundationDir),
    listTokenFiles(componentDir),
  ]);

  const resolver = {
    name: 'Quantum',
    description: 'Quantum tokens defined via the Design Tokens Format (DTCG) specification',
    version: '2025.10',
    resolutionOrder: [
      { $ref: '#/sets/foundation' },
      { $ref: '#/sets/component' },
      { $ref: '#/modifiers/theme' },
    ],
    sets: {
      foundation: {
        sources: foundationFiles.map((file) => ({ $ref: file })),
      },
      component: {
        sources: componentFiles
          .filter((file) => !file.includes('-dark.tokens.json'))
          .map((file) => ({ $ref: file })),
      },
    },
    modifiers: {
      theme: {
        contexts: {
          light: [],
          dark: componentFiles
            .filter((file) => file.includes('-dark.tokens.json'))
            .map((file) => ({ $ref: file })),
        },
      },
    },
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(resolver, null, 2), 'utf8');
  const relativeOutputPath = path.relative(__dirname, OUTPUT_FILE).replace(/\\/g, '/');
  console.log(`${relativeOutputPath} successfully created`);
}

main().catch((err) => {
  console.error('Error while generating quantum files:', err);
  process.exit(1);
});
