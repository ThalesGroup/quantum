import fs from 'fs-extra';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Root of your repo
const ROOT = path.join(__dirname, '.');

// Source directory containing the Figma-exported files
const SRC_DIR = path.join(ROOT, 'deprecated-tokens-from-figma');

// Temp directory where normalized files will be written
const TEMP_DIR = path.join(ROOT, 'properties');

// Recursively walk an object and normalize "{...value}" → "{...}"
function normalizeValueRefs(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalizeValueRefs);
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = normalizeValueRefs(v);
    }
    return result;
  }
  if (typeof obj === 'string') {
    // Replace every {some.path.value} with {some.path}
    return obj.replace(/\{([^}]+)\}/g, (match, refPath) => {
      return refPath.endsWith('.value')
        ? `{${refPath.slice(0, -'.value'.length)}}`
        : match;
    });
  }
  return obj;
}

async function main() {
  // Clean temp dir
  await fs.remove(TEMP_DIR);
  await fs.ensureDir(TEMP_DIR);

  // Find all .json files under deprecated-tokens-from-figma
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true });

  async function processEntry(dirent, baseDir) {
    const srcPath = path.join(baseDir, dirent.name);
    if (dirent.isDirectory()) {
      const subEntries = await fs.readdir(srcPath, { withFileTypes: true });
      for (const sub of subEntries) {
        await processEntry(sub, srcPath);
      }
      return;
    }

    if (dirent.isFile() && dirent.name.endsWith('.json')) {
      // Preserve relative path under TEMP_DIR
      const rel = path.relative(SRC_DIR, srcPath);
      const destPath = path.join(TEMP_DIR, rel);
      await fs.ensureDir(path.dirname(destPath));

      const json = await fs.readJson(srcPath);
      const normalized = normalizeValueRefs(json);
      await fs.writeJson(destPath, normalized, { spaces: 2 });

      console.log('Normalized:', rel);
    }
  }

  for (const dirent of entries) {
    await processEntry(dirent, SRC_DIR);
  }

  console.log('\nAll deprecated tokens normalized into', TEMP_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});