#!/usr/bin/env node
/**
 * Serves dist/ (the plugin `build.mjs` writes) over HTTP, as Penpot loads a plugin: from the URL of
 * its manifest, in a page of another origin, so every response allows any origin (CORS).
 *
 *   node serve.mjs [--port 4400]
 *
 * Then, in Penpot, the plugin manager (Ctrl + Alt + P) installs http://localhost:4400/manifest.json.
 * Local only: it listens on localhost.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATHS } from '../../scripts/lib/paths.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.join(ROOT, PATHS.penpotDist);
const TYPES = { '.json': 'application/json', '.js': 'text/javascript', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png' };

const at = process.argv.indexOf('--port');
const PORT = at > 0 ? Number(process.argv[at + 1]) : 4400;

if (!fs.existsSync(path.join(DIST, 'manifest.json'))) {
  console.error(`${PATHS.penpotDist}/manifest.json is missing: run pnpm penpot:export first.`);
  process.exit(1);
}

http
  .createServer((req, res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    // The window opens at the root (`?theme=…`), as Penpot's plugins do.
    const file = path.join(DIST, name === '/' ? 'index.html' : name);
    const headers = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
    if (!file.startsWith(DIST + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, headers).end('Not found');
      return;
    }
    res.writeHead(200, { ...headers, 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, 'localhost', () => {
    console.log(`Serving ${PATHS.penpotDist}/ at http://localhost:${PORT}/. In Penpot: plugin manager (Ctrl + Alt + P) > http://localhost:${PORT}/manifest.json`);
  });
