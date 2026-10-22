#!/usr/bin/env node
/**
 * Change impact report: for every changed file, list the artifacts linked to it and whether
 * they changed too, so a change is never left half-propagated.
 *   pnpm impact                      working tree (tracked + untracked) against HEAD
 *   pnpm impact --base origin/main   against another ref (merge requests)
 *   pnpm impact --files a b c        explicit list, no git diff
 * Exit 1 when a component's spec, tokens, CSS or template, or a foundation spec, changed without a version bump
 * (or without a changelog entry). Unchanged linked artifacts are a review checklist: each one
 * must be updated or consciously left as is, and said so in the change report.
 * The link rules are the table LINKS below; keep it in sync with agents/impact.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAll, flatten, cssVarName } from './lib/dtcg.mjs';
import { loadScreens, screenComponents } from './lib/screens.mjs';
import { mirrorsOf } from './lib/mirrors.mjs';
import { PATHS, FILES, artifacts, foundationArtifacts } from './lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const tryGit = (...a) => { try { return git(...a); } catch { return null; } };

// ---------------------------------------------------------------------------
// Changed files
// ---------------------------------------------------------------------------
let base = null;
let changed;
const filesAt = args.indexOf('--files');
if (filesAt >= 0) {
  changed = args.slice(filesAt + 1).filter((a) => !a.startsWith('--'));
  const b = args.indexOf('--base');
  base = b >= 0 ? args[b + 1] : (tryGit('rev-parse', '--verify', '-q', 'HEAD') ? 'HEAD' : null);
} else {
  const b = args.indexOf('--base');
  base = b >= 0 ? args[b + 1] : 'HEAD';
  if (!tryGit('rev-parse', '--verify', '-q', base)) {
    console.log(`No commit "${base}" to compare with. Commit a baseline, or pass --files <paths>.`);
    process.exit(0);
  }
  const lines = (s) => (s ?? '').split('\n').filter(Boolean);
  changed = [...new Set([...lines(git('diff', '--name-only', base)), ...lines(git('ls-files', '--others', '--exclude-standard'))])];
}
changed = changed.map((f) => f.replace(/^\.\//, '')).sort();
const isChanged = (f) => changed.includes(f) || changed.some((c) => f.endsWith('/') && c.startsWith(f));

// ---------------------------------------------------------------------------
// Repository model
// ---------------------------------------------------------------------------
// Artifact paths come from scripts/lib/paths.mjs (artifacts, foundationArtifacts); the patterns below are built from the same map.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const under = (dir, rest) => new RegExp(`^${esc(dir)}/${rest}`);
const specsDir = path.join(root, PATHS.specs, 'components');
const specs = fs.readdirSync(specsDir).filter((f) => f.endsWith('.spec.json')).map((f) => JSON.parse(fs.readFileSync(path.join(specsDir, f), 'utf8')));
const all = (key) => specs.map((s) => artifacts(s.id)[key]);
// Foundations: global specifications shared by every component (specs/foundations/).
const foundationsDir = path.join(root, PATHS.specs, 'foundations');
const foundations = fs.existsSync(foundationsDir) ? fs.readdirSync(foundationsDir).filter((f) => f.endsWith('.spec.json')).map((f) => JSON.parse(fs.readFileSync(path.join(foundationsDir, f), 'utf8'))) : [];
// Foundations owning (exactly or through a group pattern) one of the given token paths.
const ownsPath = (f, p) => f.tokens.some((t) => (t.endsWith('.*') ? p.startsWith(t.slice(0, -1)) : p === t));
const matchesPath = (pattern, p) => (pattern.endsWith('.*') ? p.startsWith(pattern.slice(0, -1)) : p === pattern);
const foundationsUsingPaths = (paths) => foundations.filter((f) => paths.some((p) => ownsPath(f, p))
  || (f.contrast ?? []).some((c) => paths.some((p) => p === c.foreground || [...c.backgrounds, ...(c.on ?? [])].some((b) => matchesPath(b, p))))
  || (f.specimens ?? []).some((s) => s.tokens.some((t) => paths.some((p) => matchesPath(t, p)))));
const foundationLinks = (paths, why) => foundationsUsingPaths(paths).flatMap((f) => [[foundationArtifacts(f.id).spec, why], [foundationArtifacts(f.id).docs, 'if the guidance changed']]);

// Components whose tokens depend, directly or through semantic aliases, on the given token paths.
let tokenIndex = null;
function componentsUsingPaths(paths) {
  tokenIndex ??= loadAll(path.join(root, PATHS.tokens));
  const seeds = new Set(paths);
  const dependsOn = (t, trail = new Set()) => t.references.some((r) => seeds.has(r) || (!trail.has(r) && tokenIndex.byPath.get(r) && dependsOn(tokenIndex.byPath.get(r), new Set([...trail, r]))));
  return [...new Set(tokenIndex.all.filter((t) => t.tier === 'component' && dependsOn(t)).map((t) => t.segments[0]))];
}
// Token paths defined in a base tier file, or overridden by a platform overlay or mode file.
function tokenFilePaths(file) {
  tokenIndex ??= loadAll(path.join(root, PATHS.tokens));
  const rel = file.slice(PATHS.tokens.length + 1);
  return tokenIndex.all.filter((t) => t.file === rel).map((t) => t.path);
}
function componentsUsingTokenFile(file) {
  return componentsUsingPaths(tokenFilePaths(file));
}
// The documentation site is built with the design system (apps/docs/AGENTS.md): its stylesheet reads
// semantic tokens, and its markup renders the components that cover its controls.
const siteCss = FILES.siteCss;
function siteReadsTokenFile(file) {
  tokenIndex ??= loadAll(path.join(root, PATHS.tokens));
  const full = path.join(root, siteCss);
  if (!fs.existsSync(full)) return false;
  const css = fs.readFileSync(full, 'utf8');
  const rel = file.slice(PATHS.tokens.length + 1);
  const paths = [...tokenIndex.all.filter((t) => t.file === rel).map((t) => t.segments), ...overlayPaths(file).map((p) => p.split('.'))];
  return paths.some((segs) => css.includes(`var(${cssVarName(segs)}`));
}
// Screens (apps/docs/screens/AGENTS.md) render the components through their templates: a change to a
// component or to a token it reads changes them, and they are updated in the same change.
const screensData = await loadScreens(root);
for (const s of screensData.screens) s.components = screenComponents(s.html, specs.map((x) => x.id));
const screensUsing = (ids, why) => screensData.screens.filter((s) => s.components.some((c) => ids.includes(c))).map((s) => [s.file, why(s.components.filter((c) => ids.includes(c)))]);
const allScreens = (why) => screensData.screens.map((s) => [s.file, why]);
const screensCss = FILES.screensCss;
function screensCssReadsTokenFile(file) {
  tokenIndex ??= loadAll(path.join(root, PATHS.tokens));
  const full = path.join(root, screensCss);
  if (!fs.existsSync(full)) return false;
  const css = fs.readFileSync(full, 'utf8');
  const rel = file.slice(PATHS.tokens.length + 1);
  const paths = [...tokenIndex.all.filter((t) => t.file === rel).map((t) => t.segments), ...overlayPaths(file).map((p) => p.split('.'))];
  return paths.some((segs) => css.includes(`var(${cssVarName(segs)}`));
}
const screenTokenLinks = (file, components, context = '') => [
  ...screensUsing(components, (ids) => `renders ${ids.join(', ')}, whose tokens alias the changed ones${context}: look at it on the site (Screens) in every mode`),
  ...(screensCssReadsTokenFile(file) ? [[screensCss, `screens' layout reads these semantic tokens${context}: look at every screen`]] : []),
];

// A component that renders the same as `id` (scripts/lib/mirrors.mjs) follows every change of it.
const mirrored = (id, ...kinds) => mirrorsOf(id).flatMap((m) => kinds.map((k) => [artifacts(m.component)[k], `renders the same as ${id} (scripts/lib/mirrors.mjs): apply the change, version + changelog; pnpm validate compares the tokens`]));

const isNewFile = (file) => Boolean(base) && !tryGit('cat-file', '-e', `${base}:${file}`) && fs.existsSync(path.join(root, file));
function overlayPaths(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? flatten(JSON.parse(fs.readFileSync(full, 'utf8'))).map((t) => t.path) : [];
}

// ---------------------------------------------------------------------------
// Link rules: [pattern, (match) => [[linkedPath, why], ...]]
// ---------------------------------------------------------------------------
const LINKS = [
  [under(PATHS.specs, 'components/([a-z0-9-]+)\\.spec\\.json$'), ([, id]) => {
    const a = artifacts(id);
    return [
      [a.tokens, 'tokens must cover every part x option x state of the spec'],
      [a.css, 'a rule for every option and state; native element and ARIA as specified'],
      [a.template, 'renders every property, part and example'],
      [a.docs, 'variants, sizes, states, content and accessibility sections'],
      ...specs.filter((s) => s.related?.includes(id)).map((s) => [artifacts(s.id).docs, `lists ${id} as related`]),
      ...mirrored(id, 'spec'),
      ...(isNewFile(a.spec) ? [[`${PATHS.docsSrc}/`, 'new component: the docs chrome renders it wherever it shows a control it covers (pnpm validate flags native look-alikes); apps/docs/AGENTS.md "Built with the design system" table']] : []),
      ...(isNewFile(a.spec) ? [[`${PATHS.screens}/`, 'new component: it may fill a gap the screens list (meta.gaps): replace their native stand-in and drop the gap']] : []),
      ...screensUsing([id], () => `renders ${id}: apply any API change, look at it on the site (Screens)`),
    ];
  }],
  [under(PATHS.tokensSrc, 'components/([a-z0-9-]+)\\.tokens\\.json$'), ([, id]) => {
    const a = artifacts(id);
    return [[a.css, 'consumes the generated variables'], [a.spec, 'visible change: bump version + changelog'], [a.docs, 'if the meaning of a variant or state changed'], ...mirrored(id, 'tokens', 'spec'), ...screensUsing([id], () => `renders ${id}: look at it on the site (Screens) in every mode`)];
  }],
  [under(PATHS.web, 'components/([a-z0-9-]+)/\\1\\.(css|template\\.mjs)$'), ([, id]) => {
    const a = artifacts(id);
    return [[a.spec, 'visible change: bump version + changelog; implementations.web must still describe it'], [a.docs, 'if behaviour or rendering guidance changed'], ...mirrored(id, 'css', 'spec'), ...screensUsing([id], () => `renders ${id}: apply any template API change, look at it on the site (Screens)`)];
  }],
  [under(PATHS.content, 'components/([a-z0-9-]+)\\.md$'), ([, id]) => [[artifacts(id).spec, 'guidance must not contradict the spec; WCAG links must be cited by the spec']]],
  [under(PATHS.specs, 'foundations/([a-z0-9-]+)\\.spec\\.json$'), ([, id]) => {
    const f = foundations.find((x) => x.id === id);
    const following = f?.appliesTo ? componentsUsingPaths(f.tokens.filter((t) => !t.endsWith('.*'))) : [];
    return [
      [foundationArtifacts(id).docs, 'rules, platforms and accessibility sections'],
      [`${PATHS.tokensSrc}/semantic/`, 'the semantic tokens it owns carry its values (and src/modes/, src/platforms/)'],
      ...following.flatMap((c) => [[artifacts(c).docs, `follows the ${id} foundation: guidance must not contradict it`]]),
    ];
  }],
  [under(PATHS.specs, 'foundations/([a-z0-9-]+)/[^/]+$'), ([, id]) => [[foundationArtifacts(id).spec, 'code sample shown by its examples: bump version + changelog if what it shows changed']]],
  [under(PATHS.content, 'foundations/([a-z0-9-]+)\\.md$'), ([, id]) => [[foundationArtifacts(id).spec, 'guidance must not contradict the spec; WCAG links must be cited by the spec']]],
  [under(PATHS.specs, 'schema/foundation\\.schema\\.json$'), () => [
    ...foundations.map((f) => [foundationArtifacts(f.id).spec, 'must validate against the new schema']),
    [`${PATHS.docsSrc}/content.config.ts`, 'foundations collection mirrors the schema'],
    ['scripts/validate.mjs', 'cross-checks on the new fields'],
    [`${PATHS.components}/AGENTS.md`, 'specifications: foundations section'],
  ]],
  [/^scripts\/lib\/specimens\.mjs$/, () => [['scripts/test/specimens.test.mjs', 'a test per display or check'], [FILES.foundationSchema, 'the display enum equals DISPLAYS'], [`${PATHS.docsSrc}/components/Specimen.astro`, 'one branch per display'], ['scripts/AGENTS.md', 'library description']]],
  [/^scripts\/figma-library\.mjs$/, () => [['scripts/test/figma-library.test.mjs', 'a test per name or value rule'], [`${PATHS.tokensSrc}/raw/`, 'recreated from the Figma library: run it to see what diverges'], [`${PATHS.tokens}/AGENTS.md`, '"Origin: the Figma library and additions"'], ['scripts/AGENTS.md', 'script description']]],
  [/^scripts\/lib\/syntax-theme\.mjs$/, () => [['scripts/test/syntax-theme.test.mjs', 'a test per check or output field'], [`${PATHS.tokens}/AGENTS.md`, 'syntax highlighting theme section'], ['scripts/AGENTS.md', 'library description']]],
  [/^scripts\/lib\/contrast\.mjs$/, () => [['scripts/test/contrast.test.mjs', 'a test per color shape or rule'], [`${PATHS.docsSrc}/lib/foundations.ts`, 'site renders the ratios through it'], ['scripts/AGENTS.md', 'library description']]],
  [under(PATHS.tokensSrc, '(?:additions/)?(raw|semantic)/.+\\.json$'), ([file, tier]) => [
    ...(tier === 'raw' ? [[`${PATHS.tokensSrc}/semantic/`, 'semantic tokens aliasing changed raw tokens'], [`${PATHS.tokensSrc}/modes/`, 'modes aliasing changed raw tokens'], [FILES.webFontsCss, 'if a font family changed: load the new family']] : []),
    ...componentsUsingTokenFile(file).flatMap((id) => [[artifacts(id).spec, 'appearance may change: bump version if it does'], [artifacts(id).docs, 'if the visual meaning changed (contrast, emphasis)']]),
    ...(tier === 'semantic' && siteReadsTokenFile(file) ? [[siteCss, 'the docs chrome reads these semantic tokens: check the site in every mode']] : []),
    ...screenTokenLinks(file, componentsUsingTokenFile(file)),
    ...foundationLinks(tokenFilePaths(file), 'owns, measures or presents these tokens: specimens redraw and contrast is recomputed by pnpm validate; bump version + changelog if the foundation changes'),
  ]],
  [under(PATHS.tokensSrc, 'platforms/([a-z0-9-]+)/.+\\.json$'), ([file, platform]) => [
    ...componentsUsingPaths(overlayPaths(file)).flatMap((id) => [[artifacts(id).spec, `appearance on ${platform} may change: bump version if it does`], [artifacts(id).docs, `if the ${platform} guidance (sizes, targets, typography) changed`]]),
    ...(platform === 'web' ? screenTokenLinks(file, componentsUsingPaths(overlayPaths(file)), ' on the web') : []),
    ...foundationLinks(overlayPaths(file), `owns or measures tokens overridden on ${platform}: bump version if the foundation changes there`),
  ]],
  [under(PATHS.tokensSrc, '(?:additions/)?modes/([a-z0-9-]+)/.+\\.json$'), ([file, mode]) => [
    ...componentsUsingPaths(overlayPaths(file)).flatMap((id) => [[artifacts(id).spec, `appearance in ${mode} mode may change: bump version, record the ${mode} contrast in the changelog`], [artifacts(id).docs, `if the ${mode} mode guidance or contrast changed`]]),
    ...(siteReadsTokenFile(file) ? [[siteCss, `the docs chrome reads these semantic tokens: check the site in ${mode} mode`]] : []),
    ...screenTokenLinks(file, componentsUsingPaths(overlayPaths(file)), ` in ${mode} mode`),
    ...foundationLinks(overlayPaths(file), `owns or measures tokens of the ${mode} mode: contrast recomputed by pnpm validate; record the ${mode} ratios in the changelog`),
  ]],
  [under(PATHS.tokens, 'tokens\\.config\\.json$'), () => [[foundationArtifacts('code').spec, `the Code foundation, when the syntax scope mapping changed (and ${foundationArtifacts('code').docs})`], [FILES.styleDictionaryConfig, 'reads the tiers, the platforms and the modes'], [`${PATHS.docsSrc}/lib/tokens.ts`, 'the site reads the modes and their web contexts'], ['agents/token-sources.md', '"Plugging another export"']]],
  [under(PATHS.specs, 'platforms\\.json$'), () => [
    [FILES.componentSchema, 'platform and input enums must equal the registry'],
    [FILES.tokensConfig, 'platform overlays are keyed by platform id'],
    [`${PATHS.docsSrc}/lib/platforms.ts`, 'the site reads the registry'],
    ['agents/conventions.md', '"Platforms and inputs"'],
    [`${PATHS.components}/AGENTS.md`, 'specifications: platform vocabulary'],
  ]],
  [under(PATHS.specs, 'schema/component\\.schema\\.json$'), () => [
    ...all('spec').map((f) => [f, 'must validate against the new schema']),
    [`${PATHS.docsSrc}/content.config.ts`, 'collection schema mirrors the spec schema'],
    ['scripts/new-component.mjs', 'scaffold must produce a valid spec'],
    ['scripts/lib/specs-bridge.mjs', 'new fields: map to Specs or carry in the sidecar'],
    ['scripts/validate.mjs', 'cross-checks on the new fields'],
    [`${PATHS.components}/AGENTS.md`, 'specifications: section table and vocabulary'],
    [FILES.foundationSchema, 'reuses its definitions (decision, refs, guidelines, changelog)'],
    ...foundations.map((f) => [foundationArtifacts(f.id).spec, 'shared definitions may have changed']),
  ]],
  [under(PATHS.specs, 'a11y/roles\\.json$'), () => [
    ...all('spec').map((f) => [f, 'role obligations (aria role, keys, focus, required WCAG criteria)']),
    ...all('docs').map((f) => [f, 'Accessibility section explains the obligations']),
    ['scripts/new-component.mjs', 'scaffold seeds the contract from the profile'],
  ]],
  [under(PATHS.specs, 'a11y/sources\\.json$'), () => [...all('spec').map((f) => [f, 'references must stay on trusted publishers']), ...all('docs').map((f) => [f, 'Accessibility links must stay trusted']), ...foundations.flatMap((f) => [[foundationArtifacts(f.id).spec, 'references must stay on trusted publishers'], [foundationArtifacts(f.id).docs, 'Accessibility links must stay trusted']]), [`${PATHS.components}/AGENTS.md`, 'specifications: trusted publishers list']]],
  [under(PATHS.specs, 'a11y/wcag\\.json$'), () => [...all('spec'), ...foundations.map((f) => foundationArtifacts(f.id).spec)].map((f) => [f, 'cited criteria must exist in the new WCAG data'])],
  [/^scripts\/lib\/dtcg\.mjs$/, () => [['scripts/test/dtcg.test.mjs', 'a test per new value shape or type'], [`${PATHS.docsSrc}/lib/tokens.ts`, 'uses the library'], ['scripts/AGENTS.md', 'library description']]],
  [new RegExp(`^${esc(FILES.styleDictionaryConfig)}$`), () => [[`${PATHS.tokens}/README.md`, 'the list of generated outputs'], [`${PATHS.tokens}/AGENTS.md`, '"Distribution formats"'], [`${PATHS.tokens}/CHANGELOG.md`, 'a changed output is a change of the package']]],
  [/^scripts\/lib\/specs-bridge\.mjs$/, () => [['scripts/test/specs-bridge.test.mjs', 'a test per mapping'], ['scripts/AGENTS.md', 'bridge description'], ['agents/specs-interop.md', 'Specs interoperability']]],
  [/^scripts\/lib\/a11y\.mjs$/, () => [['scripts/test/a11y.test.mjs', 'a test per check'], [`${PATHS.docsSrc}/lib/a11y.ts`, 'site renders citations through it'], ['scripts/AGENTS.md', 'what validate.mjs checks']]],
  [/^scripts\/validate\.mjs$/, () => [['scripts/AGENTS.md', '"What validate.mjs checks" list'], ['agents/workflow.md', '"Definition of done" if a new obligation']]],
  [/^scripts\/new-component\.mjs$/, () => [['agents/workflow.md', 'the "Add a new component" row'], [`${PATHS.components}/AGENTS.md`, 'Adding a component']]],
  [under(PATHS.web, 'lib/template-utils\\.mjs$'), () => [...all('template').map((f) => [f, 'uses the shared helpers']), ...allScreens('renders the templates: look at it on the site (Screens)')]],
  [under(PATHS.screens, 'screens\\.css$'), () => allScreens('laid out by screens.css: look at it on the site (Screens) at every frame width and in every mode')],
  [under(PATHS.screens, 'lib/[^/]+\\.mjs$'), () => [...allScreens('built with the shared screen helpers: look at it on the site (Screens)'), [`${PATHS.screens}/AGENTS.md`, 'file map and rules']]],
  [under(PATHS.screens, '([a-z0-9-]+)/source\\.json$'), ([, source]) => {
    const s = screensData.sources.find((x) => x.id === source);
    return [[`${PATHS.screens}/${source}/${s?.license?.file ?? 'LICENSE.md'}`, 'the licence text must match the licence and the commit recorded'], ...screensData.screens.filter((x) => x.source === source).map((x) => [x.file, 'shows the source, licence and commit on its page'])];
  }],
  [under(PATHS.screens, 'sections\\.json$'), () => allScreens('meta.section must name a section')],
  [/^scripts\/lib\/screens\.mjs$/, () => [['scripts/test/screens.test.mjs', 'a test per check'], [`${PATHS.screens}/AGENTS.md`, '"Checks"'], [`${PATHS.docsSrc}/lib/screens.ts`, 'the site loads screens with it'], ['scripts/AGENTS.md', 'library description, what validate.mjs checks']]],
  [/^scripts\/lib\/token-map\.mjs$/, () => [['scripts/test/token-map.test.mjs', 'a test per rule or kind'], [`${PATHS.docsSrc}/components/TokenInspector.astro`, 'the inspector decides the active tokens with it'], [`${PATHS.docsSrc}/lib/inspector.ts`, 'kinds and path reading for the inspector'], [`${PATHS.tokens}/AGENTS.md`, '"Which token applies" rule'], ['scripts/AGENTS.md', 'library description, what validate.mjs checks']]],
  [/^scripts\/lib\/site-check\.mjs$/, () => [['scripts/test/site-check.test.mjs', 'a test per check'], [`${PATHS.docs}/AGENTS.md`, '"Built with the design system" rules'], ['scripts/AGENTS.md', 'what validate.mjs checks']]],
  [/^scripts\/lib\/conventional-commits\.mjs$/, () => [['scripts/test/conventional-commits.test.mjs', 'a test per rule'], ['agents/git.md', '"Commits": types, scopes, breaking changes'], ['scripts/AGENTS.md', 'library description']]],
  [/^\.githooks\/.+/, () => [['package.json', '"prepare" installs the hooks (core.hooksPath)'], ['agents/git.md', '"Commits"']]],
  [/^package\.json$/, () => [['AGENTS.md', '"Commands" table'], ['.github/workflows/ci.yml', 'CI runs the scripts']]],
  [/^agents\/[a-z0-9-]+\.md$/, () => [['AGENTS.md', '"Read before acting" table and the rules it summarises'], ['.claude/skills/', 'skills cite the guides by path and section name']]],
  [/^\.claude\/skills\/[^/]+\/SKILL\.md$/, () => [['AGENTS.md', '"Skills" table']]],
  [/^scripts\/[a-z0-9-]+\.mjs$/, () => [['scripts/AGENTS.md', 'script table']]],
  [under(PATHS.docsSrc, '.+'), () => [[`${PATHS.docs}/AGENTS.md`, 'file map; "Built with the design system" table when the chrome starts or stops using a component']]],
];

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
if (changed.length === 0) {
  console.log(`No changes against ${base}.`);
  process.exit(0);
}
const pad = (s, n) => (s.length >= n ? `${s} ` : s + ' '.repeat(n - s.length));
const pending = new Set();
console.log(`Change impact against ${base ?? '(explicit files)'}: ${changed.length} changed file(s)\n`);
for (const file of changed) {
  const links = LINKS.filter(([re]) => re.test(file)).flatMap(([re, fn]) => fn(file.match(re)));
  const seen = new Set();
  const rows = links.filter(([p]) => p !== file && !seen.has(p) && seen.add(p));
  if (rows.length === 0) continue;
  console.log(file);
  for (const [p, why] of rows) {
    const done = isChanged(p);
    if (!done) pending.add(p);
    console.log(`  ${done ? '✓' : '·'} ${pad(p, 46)}${done ? '' : 'review: '}${why}`);
  }
}

// Version bumps: a component's spec, tokens, CSS or template changed -> version and changelog move.
const bumpErrors = [];
for (const spec of specs) {
  const a = artifacts(spec.id);
  const touched = [a.spec, a.tokens, a.css, a.template].filter(isChanged);
  if (touched.length === 0) continue;
  if (!spec.changelog?.some((c) => c.version === spec.version)) bumpErrors.push(`${spec.id}: no changelog entry for ${spec.version}`);
  const before = base && tryGit('show', `${base}:${a.spec}`);
  if (!before) continue; // new component
  const previous = JSON.parse(before).version;
  if (previous === spec.version) bumpErrors.push(`${spec.id}: ${touched.join(', ')} changed but version is still ${spec.version}`);
}

for (const f of foundations) {
  const a = foundationArtifacts(f.id);
  if (!isChanged(a.spec)) continue;
  if (!f.changelog?.some((c) => c.version === f.version)) bumpErrors.push(`${f.id} (foundation): no changelog entry for ${f.version}`);
  const before = base && tryGit('show', `${base}:${a.spec}`);
  if (before && JSON.parse(before).version === f.version) bumpErrors.push(`${f.id} (foundation): ${a.spec} changed but version is still ${f.version}`);
}

console.log(`\n${pending.size} linked artifact(s) not changed: update them or state in the report why they stay as they are.`);
for (const e of bumpErrors) console.log(`  ERROR ${e}`);
process.exit(bumpErrors.length ? 1 : 0);
