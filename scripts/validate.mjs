#!/usr/bin/env node
/**
 * Validate that the four component artifacts stay consistent (paths in scripts/lib/paths.mjs):
 *   spec (packages/components/specs/components/<id>.spec.json)
 *   tokens (packages/tokens/src/components/<id>.tokens.json)
 *   docs (apps/docs/content/components/<id>.md)
 *   web (packages/components/src/components/<id>/<id>.css + <id>.template.mjs)
 * that every foundation (specs/foundations/<id>.spec.json + content/foundations/<id>.md) holds,
 * that a mirrored component renders the same as its original (scripts/lib/mirrors.mjs),
 * that the docs site and the screens (apps/docs/screens/) are built with the design system,
 * plus token tier discipline and alias resolution.
 * Exit code 1 on any error. Warnings never fail the run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { loadAll, checkReferences, checkPlatforms, checkModes, cssVarName, cssDeclarations, isAlias } from './lib/dtcg.mjs';
import { loadA11y, checkRegistry, checkSpecA11y, checkCitations, checkDocsA11y, visibleTextContent } from './lib/a11y.mjs';
import { allContexts, evaluateContrast, formatRatio } from './lib/contrast.mjs';
import { checkSiteCss, checkSiteMarkup } from './lib/site-check.mjs';
import { checkTokenMap, parseTokenPath, kindOf, matchesTokenPattern } from './lib/token-map.mjs';
import { DISPLAYS, checkSpecimen, uncoveredTokens } from './lib/specimens.mjs';
import { MIRRORS, checkMirror } from './lib/mirrors.mjs';
import { loadScreens, screenComponents, checkSections, checkSource, checkScreenMeta, checkScreenHtml, checkScreenSource, checkScreensCssSelectors, definedScreenClasses, screenSourceFiles, SCREEN_OWN_VARS } from './lib/screens.mjs';
import { PATHS, FILES, artifacts, foundationArtifacts } from './lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.relative(root, p);
const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);

const errors = [];
const warnings = [];
const error = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

/** Decision log: unique ids, newest first, versions in the changelog, supersession, token paths. */
function checkDecisions(where, spec) {
  const log = spec.decisions ?? [];
  const ids = log.map((d) => d.id);
  const semver = (v) => v.split('.').map(Number);
  const newer = (a, b) => { const [x, y] = [semver(a), semver(b)]; for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };
  if (new Set(ids).size !== ids.length) error(where, 'duplicate ids in decisions');
  const versions = new Set((spec.changelog ?? []).map((c) => c.version));
  const superseded = new Map();
  log.forEach((d, i) => {
    const at = `decision "${d.id}"`;
    if (!versions.has(d.version)) error(where, `${at} names version ${d.version}, which has no changelog entry`);
    if (newer(d.version, spec.version)) error(where, `${at} names version ${d.version}, newer than the spec (${spec.version})`);
    if (i > 0 && (d.date > log[i - 1].date || newer(d.version, log[i - 1].version))) error(where, `decisions must be listed newest first ("${d.id}" is newer than "${log[i - 1].id}")`);
    if (d.area === 'accessibility' && !d.refs) error(where, `${at} is about accessibility and cites no source (refs)`);
    for (const s of d.supersedes ?? []) {
      const j = ids.indexOf(s);
      if (j === -1) error(where, `${at} supersedes unknown decision "${s}"`);
      else if (j <= i) error(where, `${at} supersedes "${s}", which is not older`);
      else if (log[j].status !== 'superseded') error(where, `${at} supersedes "${s}", whose status must be "superseded"`);
      superseded.set(s, [...(superseded.get(s) ?? []), d.id]);
    }
    // A superseded decision is history: the tokens it named may be gone.
    for (const pattern of d.status === 'superseded' ? [] : d.tokens ?? []) {
      if (loaded && !loaded.all.some((t) => matchesTokenPattern(pattern, t.path))) error(where, `${at} names token "${pattern}", which matches no token`);
    }
  });
  for (const d of log) {
    if (d.status === 'superseded' && !superseded.has(d.id)) error(where, `decision "${d.id}" is superseded but no decision supersedes it`);
    if ((superseded.get(d.id)?.length ?? 0) > 1) error(where, `decision "${d.id}" is superseded by several decisions (${superseded.get(d.id).join(', ')})`);
  }
}

// ---------------------------------------------------------------------------
// 1. Tokens: load, resolve, tier discipline
// ---------------------------------------------------------------------------
const tokensDir = path.join(root, PATHS.tokens);
let loaded;
try {
  loaded = loadAll(tokensDir);
  for (const p of checkReferences(loaded)) error(`${PATHS.tokens}/${p.file} ${p.token}`, p.message);
  for (const p of checkPlatforms(loaded)) error(`${PATHS.tokens}/${p.file} [${p.platform}] ${p.token}`, p.message);
  for (const p of checkModes(loaded)) error(`${PATHS.tokens}/${p.file} ${[p.platform, p.mode].filter(Boolean).map((x) => `[${x}]`).join('')} ${p.token}`, p.message);
  for (const m of loaded.modes) if (!m.default && m.tokens.length === 0) warn(FILES.tokensConfig, `mode "${m.id}" declares an overlay but overrides nothing`);
  for (const t of loaded.all) {
    if (!t.type) warn(`${PATHS.tokens}/${t.file} ${t.path}`, 'has no $type (own or inherited)');
  }
} catch (e) {
  error(PATHS.tokens, e.message);
}

// Every CSS custom property the generated files can offer, per component and per tier.
const cssVarsByComponent = new Map();
const cssVarsByTier = { raw: new Set(), semantic: new Set(), component: new Set() };
if (loaded) {
  for (const tier of loaded.tiers) {
    for (const t of tier.tokens) {
      try {
        for (const [name] of cssDeclarations(t, loaded.byPath, loaded.config.css)) cssVarsByTier[tier.name]?.add(name);
      } catch { /* already reported by checkReferences */ }
    }
  }
  const componentTier = loaded.tiers.find((t) => t.name === 'component');
  for (const t of componentTier?.tokens ?? []) {
    const comp = t.segments[0];
    if (!cssVarsByComponent.has(comp)) cssVarsByComponent.set(comp, new Set());
    try {
      for (const [name] of cssDeclarations(t, loaded.byPath, loaded.config.css)) cssVarsByComponent.get(comp).add(name);
    } catch { /* already reported by checkReferences */ }
  }
}

// ---------------------------------------------------------------------------
// 1b. Accessibility registry (specs/a11y/)
// ---------------------------------------------------------------------------
let a11y;
try {
  a11y = loadA11y(root);
  for (const p of checkRegistry(a11y)) error(FILES.a11y, p.message);
} catch (e) {
  error(FILES.a11y, e.message);
}
const report = (where, problems) => { for (const p of problems) (p.level === 'error' ? error : warn)(where, p.message); };

// Native pseudo-class each state must be written with, next to its forced [data-state] selector.
const NATIVE_STATE = { hover: ':hover', active: ':active', 'focus-visible': ':focus-visible', disabled: ':disabled', checked: ':checked', indeterminate: ':indeterminate', visited: ':visited' };

// ---------------------------------------------------------------------------
// 2. Specs: schema validation
// ---------------------------------------------------------------------------
const schemaPath = path.join(root, FILES.componentSchema);
const schema = JSON.parse(read(schemaPath));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
addFormats(ajv);
const validateSpec = ajv.compile(schema);
// Foundations reuse the component schema's definitions (decision, refs, guidelines…) by $ref.
const validateFoundation = ajv.compile(JSON.parse(read(path.join(root, FILES.foundationSchema))));

// ---------------------------------------------------------------------------
// 2b. Platform registry (specs/platforms.json): the vocabulary every artifact scopes with
// ---------------------------------------------------------------------------
const platformsRegistry = JSON.parse(read(path.join(root, FILES.platformsRegistry)));
const registryWhere = FILES.platformsRegistry;
const platformIds = Object.keys(platformsRegistry.platforms ?? {});
{
  const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  if (!same(platformIds, schema.$defs.platform.enum)) error(registryWhere, `platform ids (${platformIds.join(', ')}) must equal the schema platform enum (${schema.$defs.platform.enum.join(', ')})`);
  if (!same(Object.keys(platformsRegistry.inputs ?? {}), schema.$defs.input.enum)) error(registryWhere, `inputs (${Object.keys(platformsRegistry.inputs ?? {}).join(', ')}) must equal the schema input enum (${schema.$defs.input.enum.join(', ')})`);
  for (const [id, p] of Object.entries(platformsRegistry.platforms ?? {})) {
    if (!p.name) error(registryWhere, `platform "${id}" needs a name`);
    for (const i of p.inputs ?? []) if (!schema.$defs.input.enum.includes(i)) error(registryWhere, `platform "${id}" lists unknown input "${i}"`);
    for (const src of p.sources ?? []) if (a11y && !a11y.sources.publishers[src]) error(registryWhere, `platform "${id}" lists unknown source publisher "${src}" (${FILES.a11y}/sources.json)`);
  }
  for (const pl of loaded?.platforms ?? []) {
    if (!platformIds.includes(pl.id)) error(FILES.tokensConfig, `platform overlay "${pl.id}" is not a platform of ${registryWhere}`);
    if (pl.tokens.length === 0) warn(FILES.tokensConfig, `platform "${pl.id}" declares an overlay but overrides nothing`);
  }
}
/** Platform-specific guidance sits under a "### <Platform name>" sub-heading (apps/docs/content/AGENTS.md). */
function checkPlatformHeadings(where, markdown) {
  for (const m of markdown.matchAll(/^###\s+(.+?)\s*$/gm)) {
    const hit = Object.entries(platformsRegistry.platforms).find(([pid, p]) => m[1].toLowerCase() === pid || m[1].toLowerCase() === p.name.toLowerCase());
    if (hit && m[1] !== hit[1].name) error(where, `platform sub-heading "### ${m[1]}" must read "### ${hit[1].name}" (${registryWhere})`);
  }
}
/** Elements without content (HTML void elements a component root or role part can be). */
const VOID_ELEMENTS = new Set(['input', 'hr', 'img', 'br']);
/** Visible text of the label element whose for attribute names the id in `attrs`, or '' (HTML-AAM: name from the associated label). */
function labelText(html, attrs) {
  const id = /\sid="([^"]+)"/.exec(attrs)?.[1];
  if (!id) return '';
  const label = new RegExp(`<label\\b[^>]*\\bfor="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>([\\s\\S]*?)</label>`).exec(html);
  return label ? visibleTextContent(label[1]) : '';
}
/** Class naming a part in rendered HTML: the first class of the selector's last compound (`.a > .b[x]` -> `b`). */
const classMarker = (selector) => selector.trim().split(/\s*[>+~\s]\s*/).at(-1).replace(/^\./, '').split(/[.\[:]/)[0];
/** True when an item (state, example, statement) applies to the web, i.e. can be checked against the reference implementation. */
const onWeb = (x) => !x.platforms || x.platforms.includes('web');
const scope = (x) => `platforms: ${x.platforms.join(', ')}`;

const specsDir = path.join(root, PATHS.specs, 'components');
const specFiles = fs.readdirSync(specsDir).filter((f) => f.endsWith('.spec.json')).sort();
if (specFiles.length === 0) warn(PATHS.specs, 'no component specs found');

const specs = [];
for (const file of specFiles) {
  const where = `${PATHS.specs}/components/${file}`;
  let spec;
  try {
    spec = JSON.parse(read(path.join(specsDir, file)));
  } catch (e) {
    error(where, `invalid JSON: ${e.message}`);
    continue;
  }
  if (!validateSpec(spec)) {
    for (const e of validateSpec.errors) error(where, `${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : ''}`);
    continue;
  }
  if (file !== `${spec.id}.spec.json`) error(where, `file name must be ${spec.id}.spec.json`);
  specs.push({ spec, where });
}

// ---------------------------------------------------------------------------
// 3. Cross-artifact consistency per component
// ---------------------------------------------------------------------------
const stateVocabulary = new Set(schema.$defs.state.properties.id.enum);

for (const { spec, where } of specs) {
  const id = spec.id;
  const partIds = spec.anatomy.map((p) => p.id);
  const propIds = spec.properties.map((p) => p.id);
  const stateIds = spec.states.map((s) => s.id);
  const enumOptions = new Map(); // option value -> property id
  for (const p of spec.properties) for (const o of p.options ?? []) enumOptions.set(o.value, p.id);
  // Instance properties of repeatable parts (set per entry of a list property): their options are token segments too.
  for (const part of spec.anatomy) for (const p of part.properties ?? []) for (const o of p.options ?? []) if (!enumOptions.has(o.value)) enumOptions.set(o.value, `${part.id}.${p.id}`);

  // 3a. internal spec coherence
  if (spec.anatomy[0].role !== 'container') error(where, `first anatomy part "${spec.anatomy[0].id}" must have role "container"`);
  if (new Set(partIds).size !== partIds.length) error(where, 'duplicate part ids in anatomy');
  if (new Set(propIds).size !== propIds.length) error(where, 'duplicate property ids');
  if (new Set(stateIds).size !== stateIds.length) error(where, 'duplicate state ids');
  if (!stateIds.includes('default')) error(where, 'states must include "default"');
  const checkProperty = (p, at) => {
    if (p.bindsTo && !partIds.includes(p.bindsTo)) error(where, `${at} bindsTo unknown part "${p.bindsTo}"`);
    for (const a of p.affects ?? []) if (!partIds.includes(a)) error(where, `${at} affects unknown part "${a}"`);
    if (p.type === 'enum' && p.default !== undefined && !p.options.some((o) => o.value === p.default)) error(where, `${at} default "${p.default}" is not one of its options`);
    if (p.type === 'boolean' && p.default !== undefined && typeof p.default !== 'boolean') error(where, `${at} default must be a boolean`);
    for (const of of p.of ?? []) {
      const part = spec.anatomy.find((x) => x.id === of);
      if (!part) error(where, `${at} lists unknown part "${of}"`);
      else if (!part.repeatable) error(where, `${at} lists part "${of}", which is not repeatable`);
    }
  };
  for (const p of spec.anatomy) {
    if (p.parent && !partIds.includes(p.parent)) error(where, `part "${p.id}" has unknown parent "${p.parent}"`);
    for (const s of p.visibleIn ?? []) if (!stateIds.includes(s)) error(where, `part "${p.id}" is visible in undeclared state "${s}"`);
    const ids = (p.properties ?? []).map((x) => x.id);
    if (new Set(ids).size !== ids.length) error(where, `part "${p.id}" has duplicate property ids`);
    if (p.properties?.length && !p.repeatable) error(where, `part "${p.id}" has instance properties but is not repeatable`);
    for (const x of p.properties ?? []) checkProperty(x, `property "${p.id}.${x.id}"`);
  }
  for (const p of spec.properties) checkProperty(p, `property "${p.id}"`);
  for (const s of spec.states) {
    if (!onWeb(s)) warn(where, `state "${s.id}" excludes the web (${scope(s)}): not checked against the CSS`);
    for (const part of s.parts ?? []) if (!partIds.includes(part)) error(where, `state "${s.id}" names unknown part "${part}"`);
    if (s.trigger === 'property') {
      if (!s.property) error(where, `state "${s.id}" has trigger "property" but no property id`);
      else if (!propIds.includes(s.property)) error(where, `state "${s.id}" refers to unknown property "${s.property}"`);
    }
  }
  /** Checks one prop value against its property; a list checks every entry against its part's instance properties. */
  const checkValue = (prop, v, at) => {
    if (prop.type === 'enum' && !prop.options.some((o) => o.value === v)) error(where, `${at}="${v}" which is not an option`);
    if (prop.type === 'boolean' && typeof v !== 'boolean') error(where, `${at} to a non-boolean`);
    if (prop.type !== 'list') return;
    if (!Array.isArray(v)) { error(where, `${at} to a non-array (type list)`); return; }
    v.forEach((entry, i) => {
      const { part: partId = prop.of[0], ...fields } = entry ?? {};
      const part = spec.anatomy.find((x) => x.id === partId);
      if (!prop.of.includes(partId) || !part) { error(where, `${at}[${i}] is a "${partId}", which the list does not hold (${prop.of.join(', ')})`); return; }
      for (const [k, val] of Object.entries(fields)) {
        const ip = (part.properties ?? []).find((x) => x.id === k);
        if (!ip) error(where, `${at}[${i}] sets unknown property "${k}" of part "${partId}"`);
        else checkValue(ip, val, `${at}[${i}].${k}`);
      }
      for (const ip of part.properties ?? []) if (ip.required && fields[ip.id] === undefined) error(where, `${at}[${i}] misses required property "${ip.id}" of part "${partId}"`);
    });
  };
  for (const ex of spec.examples ?? []) {
    if (!onWeb(ex)) warn(where, `example "${ex.id}" excludes the web (${scope(ex)}): listed by the site, not rendered`);
    for (const [k, v] of Object.entries(ex.props)) {
      const prop = spec.properties.find((p) => p.id === k);
      if (!prop) { error(where, `example "${ex.id}" sets unknown property "${k}"`); continue; }
      checkValue(prop, v, `example "${ex.id}" sets ${k}`);
    }
  }
  if (!(spec.changelog ?? []).some((c) => c.version === spec.version)) error(where, `changelog has no entry for version ${spec.version}`);
  else if (spec.changelog[0].version !== spec.version) error(where, `changelog must list the newest entry (${spec.version}) first`);
  checkDecisions(where, spec);
  if (a11y) report(where, checkSpecA11y(spec, a11y));
  const profile = a11y?.roles[spec.role];
  if (spec.tokens.prefix !== id) error(where, `tokens.prefix "${spec.tokens.prefix}" must equal id "${id}"`);
  if (spec.tokens.source !== artifacts(id).tokens) error(where, `tokens.source must be ${artifacts(id).tokens}`);
  for (const r of spec.related ?? []) {
    if (!exists(path.join(specsDir, `${r}.spec.json`))) warn(where, `related component "${r}" has no spec yet`);
  }

  // 3b. component tokens
  const tokenFile = path.join(root, spec.tokens.source);
  if (!exists(tokenFile)) {
    error(where, `missing token file ${spec.tokens.source}`);
  } else if (loaded) {
    const tokens = loaded.all.filter((t) => t.tier === 'component' && t.segments[0] === id);
    if (tokens.length === 0) error(rel(tokenFile), `defines no tokens under root group "${id}"`);
    const usedParts = new Set();
    for (const t of tokens) {
      const [, part, ...rest] = t.segments;
      if (!partIds.includes(part)) { error(rel(tokenFile), `${t.path}: "${part}" is not a part of ${id} (parts: ${partIds.join(', ')})`); continue; }
      usedParts.add(part);
      if (rest.length === 0) error(rel(tokenFile), `${t.path}: needs a property segment after the part`);
      for (const seg of rest.slice(1)) {
        if (stateVocabulary.has(seg) && !stateIds.includes(seg)) error(rel(tokenFile), `${t.path}: state "${seg}" is not declared in the spec`);
        if (enumOptions.has(seg)) continue;
        // A segment that matches an option of NO property but looks like a variant is suspicious only if states/options exist with similar names; keep permissive.
      }
    }
    // A part that is another component (and the parts inside it) is styled by that component's tokens.
    const inSubcomponent = (id) => { for (let p = spec.anatomy.find((x) => x.id === id); p; p = spec.anatomy.find((x) => x.id === p.parent)) if (p.component) return true; return false; };
    for (const p of partIds) if (!usedParts.has(p) && !inSubcomponent(p)) warn(rel(tokenFile), `part "${p}" has no tokens (fine if it only inherits, e.g. icons using currentColor)`);
    // Every enum option and every non-default state should appear at least once somewhere in the token paths,
    // except the options of properties that only affect subcomponent parts (forwarded to that component).
    const segs = new Set(tokens.flatMap((t) => t.segments.slice(2)));
    const forwarded = new Set(spec.properties.filter((p) => p.affects?.length && p.affects.every(inSubcomponent)).map((p) => p.id));
    for (const [opt, prop] of enumOptions) if (!segs.has(opt) && !forwarded.has(prop)) warn(rel(tokenFile), `option "${opt}" of property "${prop}" never appears in a token path`);
    for (const s of stateIds) if (s !== 'default' && !segs.has(s)) warn(rel(tokenFile), `state "${s}" never appears in a token path`);
    // Active-token rule (scripts/lib/token-map.mjs, packages/tokens/AGENTS.md): one token per slot in every configuration.
    const map = checkTokenMap(spec, tokens);
    for (const a of map.ambiguous) error(rel(tokenFile), `${a.pair} both apply to ${JSON.stringify(a.props)} in state "${a.state}" with as many options: name one more option or state in one of them`);
    for (const p of map.unreachable) warn(rel(tokenFile), `${p} is active in no configuration (another token of its slot always wins)`);
    const kindless = new Set();
    for (const t of tokens) {
      const parsed = parseTokenPath(spec, t.segments);
      if (kindOf(parsed.property, t.type) === 'other') kindless.add(parsed.property);
      for (const k of parsed.keys) if (enumOptions.has(k)) warn(rel(tokenFile), `${t.path}: "${k}" is an option of "${enumOptions.get(k)}", which does not affect part "${parsed.part}", so it reads as a key`);
    }
    for (const p of kindless) warn(rel(tokenFile), `property "${p}" has no kind: add it to PROPERTY_KINDS in scripts/lib/token-map.mjs`);
  }

  // 3c. docs
  const docRel = artifacts(id).docs;
  const docFile = path.join(root, docRel);
  if (!exists(docFile)) error(where, `missing docs page ${docRel}`);
  else {
    const fm = read(docFile).match(/^---\n([\s\S]*?)\n---/);
    const front = fm ? fm[1] : '';
    if (!new RegExp(`^component:\\s*${id}\\s*$`, 'm').test(front)) error(docRel, `frontmatter must declare "component: ${id}"`);
    if (!/^title:\s*\S/m.test(front)) error(docRel, 'frontmatter must declare a title');
    if (a11y) report(docRel, checkDocsA11y(read(docFile), spec, a11y));
    checkPlatformHeadings(docRel, read(docFile));
  }

  // 3d. web implementation
  const web = spec.implementations.web;
  const cssFile = path.join(root, web.css);
  const tplFile = path.join(root, web.template);
  if (web.css !== artifacts(id).css) error(where, `implementations.web.css must be ${artifacts(id).css}`);
  if (web.template !== artifacts(id).template) error(where, `implementations.web.template must be ${artifacts(id).template}`);
  if (web.selector !== `.ds-${id}`) error(where, `implementations.web.selector must be .ds-${id}`);
  for (const [prop, attr] of Object.entries(web.attributes ?? {})) {
    if (!propIds.includes(prop)) error(where, `implementations.web.attributes maps unknown property "${prop}"`);
    void attr;
  }
  for (const part of Object.keys(web.partSelectors ?? {})) {
    if (!partIds.includes(part)) error(where, `implementations.web.partSelectors names unknown part "${part}"`);
  }
  if (web.rolePart && !partIds.includes(web.rolePart)) error(where, `implementations.web.rolePart names unknown part "${web.rolePart}"`);
  else if (web.rolePart && !web.partSelectors?.[web.rolePart]) error(where, `implementations.web.rolePart "${web.rolePart}" needs a selector in partSelectors`);

  if (!exists(cssFile)) error(where, `missing CSS file ${web.css}`);
  else {
    const css = read(cssFile);
    const available = cssVarsByComponent.get(id) ?? new Set();
    const used = new Set([...css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]));
    for (const v of used) {
      if (v.startsWith('--_')) continue; // private, component-local
      if (!v.startsWith(`--${id}-`)) error(rel(cssFile), `uses ${v}; only --${id}-* component tokens (and private --_*) are allowed`);
      else if (!available.has(v)) error(rel(cssFile), `uses ${v} which no component token generates`);
    }
    for (const v of available) if (!used.has(v)) warn(rel(cssFile), `token ${v} is generated but never used`);
    if (/#[0-9a-fA-F]{3,8}\b|\b\d+(\.\d+)?(px|rem|em|ms)\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\d+(\.\d+)?%/g, ''))) {
      warn(rel(cssFile), 'contains literal colors or lengths; values should come from tokens');
    }
    if (!css.includes(web.selector)) error(rel(cssFile), `does not define the root selector ${web.selector}`);
    const stateAttr = web.stateAttribute ?? 'data-state';
    const webStateIds = spec.states.filter(onWeb).map((s) => s.id);
    for (const s of webStateIds) {
      if (s === 'default') continue;
      if (!css.includes(`[${stateAttr}="${s}"]`)) error(rel(cssFile), `state "${s}" has no forced-state selector [${stateAttr}="${s}"]`);
    }
    // Every state is written twice: native pseudo-class and forced attribute (agents/conventions.md).
    for (const s of webStateIds) {
      const nativeProp = s === 'disabled' && web.attributes?.[spec.states.find((x) => x.id === s)?.property] === 'disabled';
      const pseudo = NATIVE_STATE[s];
      if (pseudo && (s !== 'disabled' || nativeProp) && !css.includes(pseudo)) error(rel(cssFile), `state "${s}" has no native ${pseudo} selector next to [${stateAttr}="${s}"]`);
    }
    if (profile?.focusable && !css.includes(':focus-visible')) error(rel(cssFile), `role "${spec.role}" is focusable: draw a visible focus indicator with :focus-visible (WCAG 2.4.7)`);
    if (/\b(transition|animation)\s*:/.test(css) && !/prefers-reduced-motion:\s*reduce/.test(css)) error(rel(cssFile), 'declares transitions or animations without a @media (prefers-reduced-motion: reduce) override (WCAG 2.3.3, packages/components/AGENTS.md)');
    // Instance enum properties are data-<property> attributes on each instance of their part.
    for (const part of spec.anatomy) {
      for (const p of (part.properties ?? []).filter((x) => x.type === 'enum')) {
        const attr = `data-${p.id.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
        for (const o of p.options) if (o.value !== p.default && !css.includes(`[${attr}="${o.value}"]`)) error(rel(cssFile), `option ${part.id}.${p.id}=${o.value} has no selector [${attr}="${o.value}"]`);
      }
    }
    for (const [prop, attr] of Object.entries(web.attributes ?? {})) {
      const p = spec.properties.find((x) => x.id === prop);
      if (p?.type === 'enum' && attr.startsWith('data-')) {
        for (const o of p.options) {
          if (o.value === p.default) continue; // default may be implicit
          if (!css.includes(`[${attr}="${o.value}"]`)) error(rel(cssFile), `option ${prop}=${o.value} has no selector [${attr}="${o.value}"]`);
        }
      }
    }
  }

  if (!exists(tplFile)) error(where, `missing template ${web.template}`);
  else {
    try {
      const mod = await import(pathToFileURL(tplFile).href);
      if (typeof mod.render !== 'function') error(rel(tplFile), 'must export render(props)');
      else {
        const decorative = spec.anatomy.filter((p) => p.decorative && web.partSelectors?.[p.id]);
        for (const ex of (spec.examples ?? []).filter(onWeb)) {
          const html = mod.render(ex.props);
          const at = `render() for example "${ex.id}"`;
          if (typeof html !== 'string' || !html.includes(`class="ds-${id}`)) { error(rel(tplFile), `${at} did not produce an element with class ds-${id}`); continue; }
          const rootTag = html.match(/^\s*<([a-z][a-z0-9-]*)\b([^>]*)>/i);
          if (!rootTag) { error(rel(tplFile), `${at} does not start with an element`); continue; }
          const [, tag, rootAttrs] = rootTag;
          if (tag !== web.element) error(rel(tplFile), `${at} renders <${tag}> but implementations.web.element is "${web.element}"`);
          // The element carrying the role: the root, or the rolePart's element inside a wrapper root.
          let roleTag = tag;
          let roleAttrs = rootAttrs;
          let roleHtml = html;
          if (web.rolePart) {
            const marker = classMarker(web.partSelectors[web.rolePart]);
            const m = [...html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)].find((x) => new RegExp(`class="[^"]*\\b${marker}\\b`).test(x[2]));
            if (!m) { error(rel(tplFile), `${at} has no element for rolePart "${web.rolePart}" (${web.partSelectors[web.rolePart]})`); continue; }
            [, roleTag, roleAttrs] = m;
            // A void element (input) has no content: its name comes from a label element or ARIA.
            roleHtml = VOID_ELEMENTS.has(roleTag) ? m[0] : html.slice(m.index, html.indexOf(`</${roleTag}>`, m.index) + roleTag.length + 3);
          }
          if (profile?.web && !profile.web.elements.includes(roleTag) && !roleAttrs.includes(`role="${profile.ariaRole}"`)) {
            error(rel(tplFile), `${at} renders <${roleTag}>${web.rolePart ? ` for part "${web.rolePart}"` : ''}, which has no implicit role "${profile.ariaRole}"; use ${profile.web.elements.map((e) => `<${e}>`).join(' or ')} (${FILES.a11y}/roles.json)`);
          }
          // A role the native element does not carry by itself (switch on a checkbox) must be written out.
          if (profile?.web?.explicitRole && !roleAttrs.includes(`role="${profile.ariaRole}"`)) error(rel(tplFile), `${at}: the element carrying role "${profile.ariaRole}" must say so with role="${profile.ariaRole}" (${FILES.a11y}/roles.json)`);
          // A role whose state must be exposed (a disclosure's expanded state) needs one of the attributes that expose it.
          const exposing = profile?.web?.stateAttributes ?? [];
          // A summary element exposes its expanded state from its parent details' open attribute (HTML-AAM): nothing to check on it.
          if (exposing.length && roleTag !== 'summary' && !exposing.some((a) => new RegExp(`\\s${a}(\\s|=|$)`).test(roleAttrs))) error(rel(tplFile), `${at}: the element with role "${profile.ariaRole}" must expose its state with one of ${exposing.join(', ')} (${FILES.a11y}/roles.json)`);
          for (const [prop, attr] of Object.entries(web.attributes ?? {})) {
            if (ex.props[prop] === true && !attr.startsWith('data-') && !new RegExp(`\\s${attr}(\\s|=|$)`).test(rootAttrs)) error(rel(tplFile), `${at} sets ${prop} but the root has no native ${attr} attribute`);
          }
          for (const part of decorative) {
            const marker = classMarker(web.partSelectors[part.id]);
            for (const m of html.matchAll(/<[a-z][a-z0-9-]*\b[^>]*>/gi)) {
              if (new RegExp(`class="[^"]*\\b${marker}\\b`).test(m[0]) && !m[0].includes('aria-hidden="true"')) error(rel(tplFile), `${at}: decorative part "${part.id}" must carry aria-hidden="true" (WCAG 1.1.1)`);
            }
          }
          // Name from content, from ARIA, or from a label element pointing at the control (for/id): the native way for form controls (HTML-AAM).
          if (profile?.nameRequired && !visibleTextContent(roleHtml) && !/\saria-label(ledby)?="[^"]+"/.test(roleAttrs) && !labelText(html, roleAttrs)) error(rel(tplFile), `${at} has no accessible name (WCAG 4.1.2): text content, aria-label, aria-labelledby or a label element with for="<its id>"`);
        }
        const html = mod.render({});
        for (const [part, sel] of Object.entries(web.partSelectors ?? {})) {
          const optional = spec.anatomy.find((p) => p.id === part)?.required === false;
          const marker = classMarker(sel);
          if (!optional && !html.includes(marker)) error(rel(tplFile), `render({}) has no element matching part "${part}" (${sel})`);
        }
      }
    } catch (e) {
      error(rel(tplFile), `failed to import: ${e.message}`);
    }
  }
}

// 3e. orphans: artifacts without a spec
const specIds = new Set(specs.map((s) => s.spec.id));
for (const f of fs.readdirSync(path.join(root, PATHS.tokensSrc, 'components'))) {
  const id = f.replace(/\.tokens\.json$/, '');
  if (f.endsWith('.tokens.json') && !specIds.has(id)) error(`${PATHS.tokensSrc}/components/${f}`, 'has no matching spec');
}
for (const f of fs.readdirSync(path.join(root, PATHS.content, 'components'))) {
  const id = f.replace(/\.md$/, '');
  if (f.endsWith('.md') && !specIds.has(id)) error(`${PATHS.content}/components/${f}`, 'has no matching spec');
}
for (const d of fs.readdirSync(path.join(root, PATHS.web, 'components'))) {
  if (!specIds.has(d)) error(`${PATHS.web}/components/${d}`, 'has no matching spec');
}
// The generated token entry point imports every component's token file; the components' entry point imports every component.
const tokensIndexCss = exists(path.join(root, FILES.tokensIndexCss)) ? read(path.join(root, FILES.tokensIndexCss)) : '';
if (!tokensIndexCss) error(FILES.tokensIndexCss, 'is missing: run pnpm tokens:build');
const indexCss = read(path.join(root, FILES.webIndexCss));
for (const id of specIds) {
  if (tokensIndexCss && !tokensIndexCss.includes(`./components/${id}.css`)) error(FILES.tokensIndexCss, `must @import "./components/${id}.css": run pnpm tokens:build`);
  if (!indexCss.includes(`./components/${id}/${id}.css`)) error(FILES.webIndexCss, `must @import "./components/${id}/${id}.css"`);
}

// fonts.css must load the primary family of every web font-family token (generic families excepted;
// aliases are skipped: the token they point to is checked)
const fontsCss = exists(path.join(root, FILES.webFontsCss)) ? read(path.join(root, FILES.webFontsCss)) : '';
if (!indexCss.includes('./fonts.css')) error(FILES.webIndexCss, 'must @import "./fonts.css" first');
const genericFamilies = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', 'fangsong']);
const families = new Set((loaded?.all ?? []).filter((t) => t.type === 'fontFamily').map((t) => [t.value].flat()[0]).filter((f) => typeof f === 'string' && !isAlias(f) && !genericFamilies.has(f)));
for (const family of families) {
  if (!fontsCss.includes(`family=${family.replace(/ /g, '+')}`)) error(FILES.webFontsCss, `must load the "${family}" font family named by the tokens`);
}

// ---------------------------------------------------------------------------
// 3f. Foundations: global specifications shared by every component (specs/foundations/)
// ---------------------------------------------------------------------------
const foundationsDir = path.join(root, PATHS.specs, 'foundations');
const foundationFiles = exists(foundationsDir) ? fs.readdirSync(foundationsDir).filter((f) => f.endsWith('.spec.json')).sort() : [];
const foundations = [];
const contexts = loaded ? allContexts(loaded) : [];
const tokenPathsOf = (pattern) => (loaded?.all ?? []).filter((t) => (pattern.endsWith('.*') ? t.path.startsWith(pattern.slice(0, -1)) : t.path === pattern));
for (const file of foundationFiles) {
  const where = `${PATHS.specs}/foundations/${file}`;
  let spec;
  try {
    spec = JSON.parse(read(path.join(foundationsDir, file)));
  } catch (e) {
    error(where, `invalid JSON: ${e.message}`);
    continue;
  }
  if (!validateFoundation(spec)) {
    for (const e of validateFoundation.errors) error(where, `${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : ''}`);
    continue;
  }
  const id = spec.id;
  foundations.push(spec);
  if (file !== `${id}.spec.json`) error(where, `file name must be ${id}.spec.json`);
  if (specIds.has(id)) error(where, `id "${id}" is also a component id; foundation and component ids share one namespace`);
  if (!(spec.changelog ?? []).some((c) => c.version === spec.version)) error(where, `changelog has no entry for version ${spec.version}`);
  else if (spec.changelog[0].version !== spec.version) error(where, `changelog must list the newest entry (${spec.version}) first`);
  checkDecisions(where, spec);
  if (a11y) report(where, checkCitations(spec, a11y));

  // Owned tokens are semantic decisions; rule tokens are among them.
  const owned = new Set();
  for (const pattern of spec.tokens) {
    const hits = tokenPathsOf(pattern);
    if (loaded && hits.length === 0) error(where, `tokens: "${pattern}" matches no token`);
    for (const t of hits) {
      if (t.tier !== 'semantic') error(where, `tokens: ${t.path} is a ${t.tier} token; a foundation owns semantic tokens`);
      owned.add(t.path);
    }
  }
  const ruleIds = spec.rules.map((r) => r.id);
  if (new Set(ruleIds).size !== ruleIds.length) error(where, 'duplicate rule ids');
  for (const r of spec.rules) {
    for (const pattern of r.tokens ?? []) {
      const hits = tokenPathsOf(pattern);
      if (loaded && hits.length === 0) error(where, `rule "${r.id}" names token "${pattern}", which matches no token`);
      for (const t of hits) if (!owned.has(t.path)) warn(where, `rule "${r.id}" names ${t.path}, which the foundation does not own (tokens)`);
    }
  }

  // Specimens: what the foundation page draws, raw primitives included.
  const specimenIds = (spec.specimens ?? []).map((x) => x.id);
  if (new Set(specimenIds).size !== specimenIds.length) error(where, 'duplicate specimen ids');
  if (loaded) for (const sp of spec.specimens ?? []) for (const p of checkSpecimen(sp, loaded.all)) error(where, p);

  // Contrast, computed from the resolved tokens in every platform x mode context.
  // A requirement with knownIssue reports its failures as warnings, and must still have one.
  const known = new Map((spec.contrast ?? []).filter((c) => c.knownIssue).map((c) => [c.id, { issue: c.knownIssue, failing: 0 }]));
  for (const c of spec.contrast ?? []) if (c.knownIssue && !c.minimum) error(where, `contrast "${c.id}" has knownIssue but no minimum`);
  for (const row of evaluateContrast(spec.contrast ?? [], contexts)) {
    const ctx = [row.platform ?? 'base', row.mode].filter(Boolean).join(' / ');
    const k = known.get(row.requirement);
    if (row.error) error(where, `contrast "${row.requirement}" [${ctx}] ${row.foreground} on ${row.background}: ${row.error}`);
    else if (!row.pass) {
      const message = `contrast "${row.requirement}" [${ctx}] ${row.foreground} ${row.fg} on ${row.background}${row.surface ? ` over ${row.surface}` : ''} ${row.bg} is ${formatRatio(row.ratio)}, under the ${row.minimum}:1 required`;
      if (k) { k.failing++; warn(where, `${message} (known issue: ${k.issue})`); } else error(where, message);
    }
  }
  for (const [id, k] of known) if (k.failing === 0) error(where, `contrast "${id}" passes everywhere: remove its knownIssue (${k.issue})`);

  // Components that must follow the foundation alias every exact path it owns.
  if (spec.appliesTo && loaded) {
    const required = spec.tokens.filter((p) => !p.endsWith('.*'));
    for (const { spec: comp, where: compWhere } of specs) {
      const inScope = spec.appliesTo === 'every-component' || (spec.appliesTo === 'focusable-components' && a11y?.roles[comp.role]?.focusable);
      if (!inScope) continue;
      const refs = new Set(loaded.all.filter((t) => t.tier === 'component' && t.segments[0] === comp.id).flatMap((t) => t.references));
      for (const p of required) if (!refs.has(p)) error(compWhere, `follows the "${id}" foundation (${spec.appliesTo}): a component token must alias ${p} (${where})`);
    }
  }

  // Examples render with the component's template; `state` forces one of its declared states.
  // Code samples live next to the spec, in specs/foundations/<id>/, and each file is shown.
  const exampleIds = (spec.examples ?? []).map((e) => e.id);
  if (new Set(exampleIds).size !== exampleIds.length) error(where, 'duplicate example ids');
  const sources = new Set((spec.examples ?? []).filter((ex) => ex.source).map((ex) => ex.source));
  const samples = foundationArtifacts(id).samples;
  for (const src of sources) {
    if (!src.startsWith(`${samples}/`)) error(where, `code example ${src} must live in ${samples}/`);
    else if (!exists(path.join(root, src))) error(where, `code example ${src} does not exist`);
    else if (!read(path.join(root, src)).trim()) error(where, `code example ${src} is empty`);
  }
  const sampleDir = path.join(root, samples);
  if (exists(sampleDir)) for (const f of fs.readdirSync(sampleDir)) if (!sources.has(`${samples}/${f}`)) warn(where, `${samples}/${f} is not shown by any example`);
  for (const ex of spec.examples ?? []) {
    if (ex.source) continue;
    const at = `example "${ex.id}"`;
    const comp = specs.find((s) => s.spec.id === ex.component)?.spec;
    if (!comp) { error(where, `${at} names unknown component "${ex.component}"`); continue; }
    for (const [k, v] of Object.entries(ex.props)) {
      if (k === 'state') { if (!comp.states.some((st) => st.id === v)) error(where, `${at} forces state "${v}", which ${comp.id} does not declare`); continue; }
      const prop = comp.properties.find((p) => p.id === k);
      if (!prop) error(where, `${at} sets unknown property "${k}" of ${comp.id}`);
      else if (prop.type === 'enum' && !prop.options.some((o) => o.value === v)) error(where, `${at} sets ${k}="${v}", which is not an option of ${comp.id}`);
    }
    if (!onWeb(ex)) continue;
    try {
      const mod = await import(pathToFileURL(path.join(root, comp.implementations.web.template)).href);
      if (!String(mod.render(ex.props)).includes(`class="ds-${comp.id}`)) error(where, `${at} does not render a ds-${comp.id} element`);
    } catch (e) {
      error(where, `${at} failed to render: ${e.message}`);
    }
  }

  // Docs page.
  const docRel = foundationArtifacts(id).docs;
  if (!exists(path.join(root, docRel))) error(where, `missing docs page ${docRel}`);
  else {
    const md = read(path.join(root, docRel));
    const front = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    if (!new RegExp(`^foundation:\\s*${id}\\s*$`, 'm').test(front)) error(docRel, `frontmatter must declare "foundation: ${id}"`);
    if (!/^title:\s*\S/m.test(front)) error(docRel, 'frontmatter must declare a title');
    if (a11y) report(docRel, checkDocsA11y(md, spec, a11y));
    checkPlatformHeadings(docRel, md);
  }
}
const foundationIds = new Set(foundations.map((f) => f.id));
// Specimen displays: the schema enum and the library that draws them agree.
const displayEnum = validateFoundation.schema.properties.specimens.items.properties.display.enum;
if (displayEnum.join() !== Object.keys(DISPLAYS).join()) error(FILES.foundationSchema, `specimen display enum (${displayEnum.join(', ')}) must equal DISPLAYS in scripts/lib/specimens.mjs (${Object.keys(DISPLAYS).join(', ')})`);
// Every raw and semantic token reaches a Foundations page: a foundation owns it or presents it.
if (loaded && foundations.length) {
  const uncovered = uncoveredTokens(foundations, loaded.all);
  if (uncovered.length) warn(`${PATHS.specs}/foundations`, `${uncovered.length} raw or semantic token(s) no foundation owns or presents in a specimen: ${uncovered.slice(0, 8).join(', ')}${uncovered.length > 8 ? '…' : ''}`);
}
if (exists(path.join(root, PATHS.content, 'foundations'))) {
  for (const f of fs.readdirSync(path.join(root, PATHS.content, 'foundations'))) {
    if (f.endsWith('.md') && !foundationIds.has(f.replace(/\.md$/, ''))) error(`${PATHS.content}/foundations/${f}`, 'has no matching foundation spec');
  }
}

// ---------------------------------------------------------------------------
// 3g. Mirrored components: the same rendering as their original (scripts/lib/mirrors.mjs)
// ---------------------------------------------------------------------------
for (const m of MIRRORS) {
  for (const id of [m.component, m.of]) if (!specIds.has(id)) error('scripts/lib/mirrors.mjs', `names unknown component "${id}"`);
  if (specIds.has(m.component) && specIds.has(m.of)) for (const p of checkMirror(m, contexts)) error(artifacts(m.component).tokens, p.message);
}

// ---------------------------------------------------------------------------
// 4. Documentation site: built with the design system (apps/docs/AGENTS.md)
// ---------------------------------------------------------------------------
const siteSrc = path.join(root, PATHS.docsSrc);
const siteFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? siteFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]));
// Native controls the design system's components cover must be those components (docs site and
// screens). The control a component covers is the element carrying its role: the root, or the
// rolePart's element inside a wrapper root (a text field's input), which carries that part's class.
const covering = [];
{
  for (const { spec } of specs) {
    const web = spec.implementations?.web;
    const role = spec.accessibility?.ariaRole ?? spec.role;
    const rootClass = web?.selector?.replace(/^\./, '');
    if (!web?.element || !role || !rootClass) continue;
    let element = web.element;
    let roleClass = null;
    if (web.rolePart && web.partSelectors?.[web.rolePart]) {
      roleClass = classMarker(web.partSelectors[web.rolePart]);
      try {
        const mod = await import(pathToFileURL(path.join(root, web.template)).href);
        const m = [...String(mod.render({})).matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)].find((x) => new RegExp(`class="[^"]*\\b${roleClass}\\b`).test(x[2]));
        if (m) element = m[1];
      } catch { /* reported above */ }
    }
    covering.push({ id: spec.id, name: spec.name, element, role, rootClass, roleClass });
  }
}
if (exists(siteSrc)) {
  const files = siteFiles(siteSrc);
  for (const f of files.filter((x) => x.endsWith('.css'))) report(rel(f), checkSiteCss(read(f), cssVarsByTier));
  for (const f of files.filter((x) => x.endsWith('.astro'))) {
    const src = read(f);
    for (const [, style] of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) report(rel(f), checkSiteCss(style, cssVarsByTier));
  }
  for (const f of files.filter((x) => x.endsWith('.astro'))) report(rel(f), checkSiteMarkup(read(f), covering));
}

// ---------------------------------------------------------------------------
// 5. Screens: real-world pages built with the design system (apps/docs/screens/AGENTS.md)
// ---------------------------------------------------------------------------
const screensData = await loadScreens(root);
if (exists(path.join(root, PATHS.screens))) {
  const reportAll = (problems) => { for (const p of problems) (p.level === 'warn' ? warn : error)('screens', p.message); };
  reportAll(screensData.problems);
  reportAll(checkSections(screensData.sections));
  for (const source of screensData.sources) reportAll(checkSource(source, { exists: (p) => exists(path.join(root, p)) }));
  const sectionIds = new Set(screensData.sections.map((s) => s.id));
  const cssFile = path.join(root, FILES.screensCss);
  const css = exists(cssFile) ? read(cssFile) : '';
  if (!css) error('screens', `${FILES.screensCss} is missing`);
  report(FILES.screensCss, checkSiteCss(css, cssVarsByTier, { own: SCREEN_OWN_VARS, who: 'screens.css' }));
  reportAll(checkScreensCssSelectors(css, FILES.screensCss));
  const defined = definedScreenClasses(css);
  const componentIds = specs.map(({ spec }) => spec.id);
  for (const screen of screensData.screens) {
    reportAll(checkScreenMeta(screen, sectionIds));
    if (!screen.html) continue;
    screen.components = screenComponents(screen.html, componentIds);
    reportAll(checkScreenHtml(screen, { definedClasses: defined, components: screen.components }));
    report(screen.file, checkSiteMarkup(screen.html, covering, { parts: true }).map((p) => ({ ...p, message: p.message.replace(/: render it with the component's template instead of a site look-alike$/, `: render it with the component's template (${FILES.screensDs})`) })));
  }
  for (const file of screenSourceFiles(root)) reportAll(checkScreenSource(read(path.join(root, file)), file));
  const used = new Set(screensData.screens.map((s) => s.meta?.section));
  for (const s of screensData.sections) if (!used.has(s.id)) warn(FILES.screensSections, `section "${s.id}" has no screen`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(`\nValidated ${specs.length} component(s), ${foundations.length} foundation(s), ${screensData.screens.length} screen(s), ${loaded?.all.length ?? 0} tokens: ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
