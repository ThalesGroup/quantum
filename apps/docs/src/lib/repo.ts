import fs from 'node:fs';
import path from 'node:path';
import { FILES } from '../../../../scripts/lib/paths.mjs';

/**
 * Absolute path of the repository root. Build-time only.
 * Discovered by walking up from the current working directory until the workspace file and the
 * tokens package are found, because import.meta.url points into the bundled output during `astro build`.
 */
function findRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml')) && fs.existsSync(path.join(dir, FILES.tokensConfig))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`Could not find the repository root (pnpm-workspace.yaml and ${FILES.tokensConfig}) above ${start}`);
}

export const repoRoot = findRoot(process.cwd());

export const repoPath = (...segments: string[]) => path.join(repoRoot, ...segments);

export const readRepoFile = (rel: string) => fs.readFileSync(repoPath(rel), 'utf8');

/** Bumped by the dev server when a repository source changes (integrations/repo-sources.mjs). */
const GENERATION = Symbol.for('quantum.docs.generation');

/**
 * Memoizes a value computed from repository files. In dev, the value is recomputed after the
 * sources change; in a build the generation never moves, so it is computed once.
 */
export function memo<T>(compute: () => T): () => T {
  let value: T;
  let seen: number | undefined;
  return () => {
    const generation = (globalThis as any)[GENERATION] ?? 0;
    if (generation !== seen) {
      value = compute();
      seen = generation;
    }
    return value;
  };
}
