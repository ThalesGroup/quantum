import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATHS } from '../../../scripts/lib/paths.mjs';

/**
 * Generation of the repository sources, bumped on every change seen by the dev server.
 * src/lib/repo.ts reads it under the same key to drop its memoized values.
 */
const GENERATION = Symbol.for('quantum.docs.generation');

/** Sources the site reads outside Vite's module graph, relative to the repository root. */
const SOURCES = [PATHS.specs, PATHS.content, PATHS.tokens, PATHS.screens, 'AGENTS.md', PATHS.agents];

/**
 * Keeps the dev server in sync with the repository sources the site reads outside its own
 * directory (collections, tokens, accessibility and platform registries, AGENTS.md and its guides).
 *
 * Astro's content layer keeps the file watcher it was created with. When the Vite server restarts
 * in place (an edit to astro.config.mjs), that watcher is closed and the collections silently stop
 * reloading until the dev server is restarted. `astro:server:setup` runs again with the new server
 * on every restart, so this integration watches the sources on the current watcher and, on any
 * change, drops the memoized values, re-syncs the content layer and reloads the browser.
 */
export default function repoSources() {
  let sources = [];
  return {
    name: 'quantum:repo-sources',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const repoRoot = path.resolve(fileURLToPath(config.root), '../..');
        sources = SOURCES.map((source) => path.join(repoRoot, source));
      },
      'astro:server:setup': ({ server, refreshContent, logger }) => {
        server.watcher.add(sources);
        let timer;
        const onChange = (file) => {
          if (!sources.some((source) => file === source || file.startsWith(source + path.sep))) return;
          // A checkout or a scaffold touches many files at once: sync once for the whole burst.
          clearTimeout(timer);
          timer = setTimeout(async () => {
            globalThis[GENERATION] = (globalThis[GENERATION] ?? 0) + 1;
            try {
              await refreshContent?.();
            } catch (error) {
              logger.warn(`Content sync failed: ${error.message}`);
            }
            server.environments.client.hot.send({ type: 'full-reload', path: '*' });
          }, 100);
        };
        for (const event of ['add', 'change', 'unlink']) server.watcher.on(event, onChange);
      },
    },
  };
}
