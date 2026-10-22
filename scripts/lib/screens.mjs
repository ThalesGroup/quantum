/**
 * Screens: real-world pages rebuilt with the design system's components and tokens
 * (apps/docs/screens/AGENTS.md). Loader and pure checks, zero dependencies, shared by
 * scripts/validate.mjs, scripts/impact.mjs, the tests and the docs site (apps/docs/src/lib/screens.ts).
 *
 *   <screens>/sections.json                  the sections of the Screens sidebar, in order
 *   <screens>/<source>/source.json           where the screens of a source come from: project, licence, commit
 *   <screens>/<source>/<licence file>        the source's licence text, verbatim
 *   <screens>/<source>/<block>.screen.mjs    export meta + render() -> HTML string
 *   <screens>/lib/*.mjs                      shared building blocks (component templates, shells, forms)
 *   <screens>/screens.css                    layout of every screen: semantic tokens only, scr-* classes
 *
 * <screens> is PATHS.screens (scripts/lib/paths.mjs).
 *
 * Problems are { level: 'error' | 'warn', message }.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PATHS, FILES } from './paths.mjs';

export const SCREENS_DIR = PATHS.screens;
/** Directories of the screens directory that are not sources. */
const NOT_SOURCES = new Set(['lib']);
/** Custom properties screens.css may define and read besides semantic tokens. */
export const SCREEN_OWN_VARS = /^--(scr-|_)/;

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Every file of a directory, recursively. */
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

/**
 * Loads sections, sources and screens (each rendered once).
 * @returns {Promise<{ sections: object[], sources: object[], screens: object[], problems: object[] }>}
 */
export async function loadScreens(root) {
  const dir = path.join(root, SCREENS_DIR);
  const problems = [];
  const out = { sections: [], sources: [], screens: [], problems };
  if (!fs.existsSync(dir)) return out;
  const sectionsFile = path.join(dir, 'sections.json');
  if (fs.existsSync(sectionsFile)) out.sections = readJson(sectionsFile).sections ?? [];
  else problems.push({ level: 'error', message: `${SCREENS_DIR}/sections.json is missing` });

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || NOT_SOURCES.has(entry.name)) continue;
    const sourceDir = path.join(dir, entry.name);
    const sourceFile = path.join(sourceDir, 'source.json');
    const source = fs.existsSync(sourceFile) ? { ...readJson(sourceFile), dir: `${SCREENS_DIR}/${entry.name}` } : null;
    if (source) out.sources.push(source);
    else problems.push({ level: 'error', message: `${SCREENS_DIR}/${entry.name}/source.json is missing: every source records its project and licence` });
    for (const file of walk(sourceDir).filter((f) => f.endsWith('.screen.mjs')).sort()) {
      const rel = path.relative(root, file).split(path.sep).join('/');
      const block = path.basename(file, '.screen.mjs');
      const screen = { id: `${entry.name}/${block}`, source: entry.name, block, file: rel, meta: null, html: '', components: [] };
      try {
        const mod = await import(pathToFileURL(file).href);
        screen.meta = mod.meta ?? null;
        screen.html = typeof mod.render === 'function' ? String(mod.render()) : '';
        if (typeof mod.render !== 'function') problems.push({ level: 'error', message: `${rel}: must export render()` });
      } catch (err) {
        problems.push({ level: 'error', message: `${rel}: ${err.message}` });
      }
      out.screens.push(screen);
    }
  }
  return out;
}

/** Class names of an HTML string. */
export function classNames(html) {
  const names = new Set();
  for (const [, value] of html.matchAll(/\bclass="([^"]*)"/g)) for (const c of value.split(/\s+/)) if (c) names.add(c);
  return names;
}

/** The components a screen renders: those whose root class (ds-<id>) appears in its HTML. */
export function screenComponents(html, componentIds) {
  const names = classNames(html);
  return componentIds.filter((id) => names.has(`ds-${id}`)).sort();
}

/** sections.json: unique ids, a name and a description each. */
export function checkSections(sections) {
  const problems = [];
  const seen = new Set();
  for (const s of sections) {
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) problems.push({ level: 'error', message: `sections.json: section id "${s.id}" must be kebab-case` });
    if (seen.has(s.id)) problems.push({ level: 'error', message: `sections.json: duplicate section "${s.id}"` });
    seen.add(s.id);
    if (!s.name || !s.description) problems.push({ level: 'error', message: `sections.json: section "${s.id}" needs a name and a description` });
  }
  return problems;
}

/** source.json: identity, links and licence (the licence file exists next to it). */
export function checkSource(source, { exists = () => true } = {}) {
  const problems = [];
  const where = `${source.dir}/source.json`;
  const need = (cond, message) => { if (!cond) problems.push({ level: 'error', message: `${where}: ${message}` }); };
  need(source.id === path.basename(source.dir), `id "${source.id}" must equal the directory name`);
  need(source.name && source.description, 'needs a name and a description');
  need(/^https:\/\//.test(source.url ?? ''), 'needs the https url of the original');
  need(/^https:\/\//.test(source.repository ?? ''), 'needs the https url of the repository');
  need(/^[0-9a-f]{7,40}$/.test(source.commit ?? ''), 'needs the commit the screens were rebuilt from');
  const lic = source.license ?? {};
  need(lic.id && lic.name && lic.copyright, 'license needs an id, a name and the copyright notice');
  need(/^https:\/\//.test(lic.url ?? ''), 'license needs the https url of the licence');
  need(lic.file && exists(`${source.dir}/${lic.file}`), `license.file "${lic.file}" must be the licence text, next to source.json`);
  need(Array.isArray(source.changes) && source.changes.length, 'changes lists what every screen of the source changes from the original');
  return problems;
}

/** A screen's meta: block = file name, a known section, the gaps it shows. */
export function checkScreenMeta(screen, sectionIds) {
  const problems = [];
  const m = screen.meta;
  const err = (message) => problems.push({ level: 'error', message: `${screen.file}: ${message}` });
  if (!m) return [{ level: 'error', message: `${screen.file}: must export meta` }];
  if (m.block !== screen.block) err(`meta.block "${m.block}" must equal the file name "${screen.block}"`);
  if (!m.name || !m.description) err('meta needs a name and a description');
  if (!sectionIds.has(m.section)) err(`meta.section "${m.section}" is not in ${FILES.screensSections}`);
  if (!Array.isArray(m.changes) || m.changes.some((c) => typeof c !== 'string')) err('meta.changes lists what this screen changes from the original (strings)');
  // A gap may name the issues tracking it (numbers of the repository's issue tracker); the text alone is enough.
  if (!Array.isArray(m.gaps) || m.gaps.some((g) => typeof g?.text !== 'string' || (g.issues !== undefined && (!Array.isArray(g.issues) || g.issues.some((i) => !Number.isInteger(i)))))) err('meta.gaps lists { text, issues?: [issue numbers] }: what the design system lacks to render it as the original');
  return problems;
}

/**
 * A screen's rendered HTML: the screen root, no duplicate id, no literal color, style attributes
 * that only pass --scr-* values, scr-* classes that screens.css defines, at least one component.
 */
export function checkScreenHtml(screen, { definedClasses = null, components = [] } = {}) {
  const problems = [];
  const { html, file } = screen;
  const err = (message) => problems.push({ level: 'error', message: `${file}: ${message}` });
  if (!html.startsWith('<div class="scr-viewport">')) err(`render() must return screen(...) from ${FILES.screensDs} (the scr-viewport root)`);
  const ids = new Map();
  for (const [, id] of html.matchAll(/\bid="([^"]+)"/g)) ids.set(id, (ids.get(id) ?? 0) + 1);
  for (const [id, n] of ids) if (n > 1) err(`id "${id}" appears ${n} times: ids must be unique in the page`);
  for (const [, attr, value] of html.matchAll(/(?<![-\w])(fill|stroke|color|bgcolor|stop-color)="([^"]*)"/g)) {
    if (!/^(none|currentColor|transparent|url\(#[^)]+\))$/.test(value)) err(`${attr}="${value}" is a literal color: color SVG and HTML through scr-* classes reading semantic tokens`);
  }
  for (const [, style] of html.matchAll(/\bstyle="([^"]*)"/g)) {
    for (const decl of style.split(';').map((d) => d.trim()).filter(Boolean)) {
      const prop = decl.slice(0, decl.indexOf(':')).trim();
      if (!/^--scr-[a-z0-9-]+$/.test(prop)) err(`style="${style}": a style attribute only passes --scr-* values (data), the look lives in screens.css`);
      else if (/#[0-9a-f]{3,8}\b|\b(rgb|hsl|oklch|color)\(/i.test(decl)) err(`style="${style}" has a literal color`);
    }
  }
  if (definedClasses) {
    const unknown = [...classNames(html)].filter((c) => c.startsWith('scr-') && !definedClasses.has(c));
    if (unknown.length) err(`class(es) ${unknown.join(', ')} not defined in ${FILES.screensCss}`);
  }
  const strays = [...classNames(html)].filter((c) => !c.startsWith('scr-') && !c.startsWith('ds-'));
  if (strays.length) err(`class(es) ${strays.join(', ')}: screens use the components' ds-* classes and screens.css's scr-* classes only`);
  if (!components.length) problems.push({ level: 'warn', message: `${file}: renders no design system component` });
  return problems;
}

/**
 * Source code of the screens: components are rendered by their templates, never written by hand, so a
 * ds-* class never appears in a screen's or a helper's source.
 */
export function checkScreenSource(source, file) {
  const problems = [];
  source.split('\n').forEach((line, i) => {
    if (/(^|[\s"'`.])ds-[a-z]/.test(line.replace(/\/\/.*$|\/\*.*?\*\//g, ''))) {
      problems.push({ level: 'error', message: `${file}:${i + 1}: writes a ds-* class by hand; render the component with its template (${FILES.screensDs})` });
    }
  });
  return problems;
}

/** screens.css never reaches into a component: no selector names a ds-* class. */
export function checkScreensCssSelectors(css, file) {
  const problems = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, , selector] of clean.matchAll(/(^|})\s*([^{}@]+)\{/g)) {
    if (/\.ds-[a-z]/.test(selector)) problems.push({ level: 'error', message: `${file}: "${selector.trim()}" restyles a component; screens lay components out, a look they lack is a component decision` });
  }
  return problems;
}

/** Class names screens.css defines (any .scr-* in a selector). */
export function definedScreenClasses(css) {
  return new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.(scr-[a-z0-9_-]+)/g)].map((m) => m[1]));
}

/** Screen source files: the screens and their shared helpers, for impact and source checks. */
export function screenSourceFiles(root) {
  const dir = path.join(root, SCREENS_DIR);
  if (!fs.existsSync(dir)) return [];
  return walk(dir).filter((f) => f.endsWith('.mjs')).map((f) => path.relative(root, f).split(path.sep).join('/')).sort();
}
