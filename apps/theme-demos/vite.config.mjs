// Local preview of the framework theme demos (`pnpm themes:demo`). Each theme package builds its
// demo as one self-contained page (dist/demo.html); this server shows them side by side under
// index.html and opens the browser, the same on every OS. A page is read from disk on every
// request, so rebuilding a theme (`pnpm bootstrap-theme:build`, `pnpm shadcn-theme:build`) and
// reloading shows the new build without restarting the server.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Route → the demo page a theme package builds, and the command that builds it. */
const DEMOS = {
  '/bootstrap/': { file: 'packages/bootstrap-theme/dist/demo.html', build: 'pnpm bootstrap-theme:build' },
  '/shadcn/': { file: 'packages/shadcn-theme/dist/demo.html', build: 'pnpm shadcn-theme:build' },
};

function themeDemos() {
  return {
    name: 'quantum-theme-demos',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const route = (req.url ?? '').split('?')[0];
        const demo = DEMOS[route.endsWith('/') ? route : `${route}/`];
        if (!demo) return next();
        const file = path.join(repo, demo.file);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (!fs.existsSync(file)) {
          res.statusCode = 404;
          res.end(`<p>${demo.file} is not built yet: run <code>${demo.build}</code>, then reload.</p>`);
          return;
        }
        res.end(fs.readFileSync(file));
      });
    },
  };
}

export default defineConfig({
  plugins: [themeDemos()],
  server: { port: 4500, open: '/' },
});
