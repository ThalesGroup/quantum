#!/usr/bin/env node
/**
 * Scaffold the four artifacts of a new component.
 *   pnpm new:component <id> --name "Display name" --role <componentRole> [--summary "..."]
 * Creates: spec, component tokens, docs page, web CSS + template (paths in scripts/lib/paths.mjs);
 * builds the tokens (the generated entry point of @quantum-ds/tokens then imports the component's
 * token file), then registers the component's CSS in the components' index.css.
 * Then: fill the TODOs, run `pnpm tokens:build` and `pnpm check`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadA11y, criterion } from './lib/a11y.mjs';
import { PATHS, FILES, artifacts } from './lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
if (!id || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: pnpm new:component <kebab-id> --name "Display name" --role <role> [--summary "..."]');
  process.exit(1);
}
const name = opt('name', id.replace(/(^|-)([a-z])/g, (_, __, c) => ` ${c.toUpperCase()}`).trim());
const role = opt('role', 'presentation');
const summary = opt('summary', `TODO: one sentence describing what ${name} does.`);
const today = new Date().toISOString().slice(0, 10);

const schema = JSON.parse(fs.readFileSync(path.join(root, FILES.componentSchema), 'utf8'));
const roles = schema.$defs.componentRole.enum;
if (!roles.includes(role)) {
  console.error(`Unknown role "${role}". Allowed: ${roles.join(', ')}`);
  process.exit(1);
}

// Accessibility contract seeded from the role profile (specs/a11y/roles.json in the components package): only sourced
// obligations are prefilled; every TODO must be written from, and cite, a trusted source.
const a11y = loadA11y(root);
const profile = a11y.roles[role];
const profileRefs = (profile?.references ?? []).map((r, i) => ({ id: `ref-${i + 1}`, ...r }));
const firstRef = profileRefs[0]?.id;
const accessibility = profile
  ? {
      ariaRole: profile.ariaRole,
      ...(profile.nameRequired ? { name: { text: 'TODO: how the accessible name is computed.', refs: [firstRef] } } : {}),
      // Profile keys come from the APG pattern, a web source: scoped to the web until a platform source is cited.
      ...(profile.keyboard?.length ? { keyboard: profile.keyboard.map((key) => ({ key, action: 'TODO: from the APG pattern.', refs: [firstRef], platforms: ['web'] })) } : {}),
      guidelines: [
        { text: `TODO: how ${name} exposes the ${profile.ariaRole ?? role} role on each platform (native element first).`, refs: profileRefs.map((r) => r.id) },
        ...Object.entries(profile.requiredCriteria ?? {}).map(([sc, why]) => ({ text: why, refs: [`wcag:${sc}`] })),
      ],
      references: profileRefs,
    }
  : { guidelines: [{ text: 'TODO', refs: ['todo'] }], references: [{ id: 'todo', title: 'TODO: trusted source', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/' }] };
const element = profile?.web?.elements?.[0] ?? 'div';
const focusable = Boolean(profile?.focusable);
const docsLinks = profile
  ? [...profileRefs.map((r) => `- [${r.title}](${r.url})`), ...Object.keys(profile.requiredCriteria ?? {}).map((sc) => {
      const c = criterion(sc, a11y);
      return `- [WCAG ${sc} ${c.title}](${c.url})`;
    })].join('\n')
  : '- TODO: explain the behaviour and link the trusted sources that back it.';

const paths = artifacts(id);
const files = {
  [paths.spec]: JSON.stringify({
    $schema: '../schema/component.schema.json',
    id, name, version: '0.1.0', status: 'draft', role, summary,
    description: 'TODO',
    anatomy: [
      { id: 'container', role: 'container', required: true, description: 'Root element.' },
      { id: 'label', role: 'label', required: true, description: 'TODO' },
    ],
    properties: [
      { id: 'variant', name: 'Variant', type: 'enum', default: 'default', affects: ['container', 'label'], options: [{ value: 'default', description: 'TODO' }, { value: 'subtle', description: 'TODO' }] },
      { id: 'label', name: 'Label', type: 'string', required: true, bindsTo: 'label' },
    ],
    states: [
      { id: 'default', trigger: 'interaction', description: 'Resting state.' },
      ...(focusable ? [{ id: 'focus-visible', trigger: 'interaction', inputs: ['keyboard'], description: 'Keyboard focus. Shows the shared focus ring.' }] : []),
    ],
    layout: { direction: 'horizontal', align: 'center', notes: [] },
    accessibility,
    content: { guidelines: ['TODO'] },
    examples: [{ id: 'default', name: 'Default', props: { variant: 'default', label: name } }],
    tokens: { source: paths.tokens, prefix: id },
    implementations: {
      web: {
        css: paths.css,
        template: paths.template,
        selector: `.ds-${id}`,
        element,
        attributes: { variant: 'data-variant' },
        stateAttribute: 'data-state',
        partSelectors: { container: `.ds-${id}`, label: `.ds-${id}__label` },
      },
    },
    related: [],
    decisions: [],
    changelog: [{ version: '0.1.0', date: today, note: 'Scaffolded.' }],
  }, null, 2) + '\n',

  [paths.tokens]: JSON.stringify({
    $description: `Component tokens for ${name}. Path grammar: ${id}.<part>.<property>[.<option>][.<state>]. Values alias semantic tokens only.`,
    [id]: {
      container: {
        background: { $type: 'color', default: { default: { $value: '{global.bg.level.0.default}' } }, subtle: { default: { $value: '{global.bg.level.1.default}' } } },
        'border-color': { $type: 'color', $value: '{global.border.level.edge.level.0}' },
        'border-width': { $type: 'dimension', $value: '{stroke-width.sm}' },
        'border-radius': { $type: 'dimension', $value: '{corner-radius.xs}' },
        'padding-inline': { $type: 'dimension', $value: '{space.12}' },
        ...(focusable ? {
          'outline-width': { $type: 'dimension', 'focus-visible': { $value: '{focus.ring.width}' } },
          'outline-offset': { $type: 'dimension', 'focus-visible': { $value: '{focus.ring.offset}' } },
          'outline-color': { $type: 'color', 'focus-visible': { $value: '{color.focus.ring}' } },
        } : {}),
      },
      label: {
        color: { $type: 'color', default: { default: { $value: '{global.text.on-base.neutral.primary}' } }, subtle: { default: { $value: '{global.text.on-base.neutral.tertiary}' } } },
        typography: { $type: 'typography', $value: { fontFamily: '{body.family}', fontSize: '{body.size.md}', fontWeight: '{body.weight.regular}', lineHeight: '{font.line-height.normal}', letterSpacing: '{font.letter-spacing.normal}' } },
      },
    },
  }, null, 2) + '\n',

  [paths.docs]: `---
component: ${id}
title: ${JSON.stringify(name)}
summary: ${JSON.stringify(summary)}
order: 100
---

## Overview

TODO: what ${name} is for, in two or three sentences.

## When to use

- TODO

## When not to use

- TODO

## Variants

| Variant | Use for |
| --- | --- |
| Default | TODO |
| Subtle | TODO |

## Content

- TODO

## Accessibility

TODO: explain the accessibility decisions (why, not what: the spec holds the contract), each
backed by a link to a trusted source (${FILES.a11y}/sources.json). Starting points for this role:

${docsLinks}
`,

  [paths.css]: `/*
 * ${name} — vanilla CSS reference implementation.
 * Spec:   ${paths.spec}
 * Tokens: ${paths.generated} (generated)
 * Only --${id}-* tokens and private --_* properties may appear here.
 */

.ds-${id} {
  --_background: var(--${id}-container-background-default-default);
  --_color: var(--${id}-label-color-default-default);

  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  padding-inline: var(--${id}-container-padding-inline);
  border: var(--${id}-container-border-width) solid var(--${id}-container-border-color);
  border-radius: var(--${id}-container-border-radius);
  background-color: var(--_background);
  color: var(--_color);
  font-family: var(--${id}-label-typography-font-family);
  font-size: var(--${id}-label-typography-font-size);
  font-weight: var(--${id}-label-typography-font-weight);
  line-height: var(--${id}-label-typography-line-height);
  letter-spacing: var(--${id}-label-typography-letter-spacing);
}

.ds-${id}__label {
  display: inline-block;
}

.ds-${id}[data-variant="subtle"] {
  --_background: var(--${id}-container-background-subtle-default);
  --_color: var(--${id}-label-color-subtle-default);
}
${focusable ? `
.ds-${id}:focus {
  outline: none;
}

.ds-${id}:is(:focus-visible, [data-state="focus-visible"]) {
  outline: var(--${id}-container-outline-width-focus-visible) solid var(--${id}-container-outline-color-focus-visible);
  outline-offset: var(--${id}-container-outline-offset-focus-visible);
}
` : ''}`,

  [paths.template]: `/**
 * ${name} — HTML template. Pure function of the spec properties -> HTML string.
 * Extra sandbox-only prop: \`state\` forces a visual state through data-state.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: '${id}', selector: '.ds-${id}' };

export function render(props = {}) {
  const { variant = 'default', label = '${name}', state = null } = props;
  const attrs = [${element === 'button' ? `'type="button"', ` : ''}'class="ds-${id}"', \`data-variant="\${escapeAttr(variant)}"\`];
  if (state && state !== 'default') attrs.push(\`data-state="\${escapeAttr(state)}"\`);
  return \`<${element} \${attrs.join(' ')}><span class="ds-${id}__label" data-part="label">\${escapeHtml(label)}</span></${element}>\`;
}
`,
};

for (const rel of Object.keys(files)) {
  if (fs.existsSync(path.join(root, rel))) {
    console.error(`Refusing to overwrite existing ${rel}`);
    process.exit(1);
  }
}
for (const [rel, content] of Object.entries(files)) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(`  + ${rel}`);
}

// Generate the component's token CSS (and the tokens entry point importing it) before the components' index.css imports the component.
const imports = [`@import "./components/${id}/${id}.css";`];
console.log('\nBuilding tokens:');
const build = spawnSync(process.execPath, [path.join(root, 'scripts/build-tokens.mjs')], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) {
  console.error(`\nThe token build failed, so ${FILES.webIndexCss} was left unchanged. Fix the tokens, run "pnpm tokens:build", then add:\n  ${imports.join('\n  ')}`);
  process.exit(1);
}

const indexPath = path.join(root, FILES.webIndexCss);
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(/(@import "\.\/components\/[^"]+";\n)(?![\s\S]*@import "\.\/components\/)/, `$1${imports[0]}\n`);
fs.writeFileSync(indexPath, index);
console.log(`  ~ ${FILES.webIndexCss} (import added)`);
if (!profile) console.log(`\nRole "${role}" has no accessibility profile: add it to ${FILES.a11y}/roles.json from its APG pattern and WAI-ARIA role (trusted sources only) before "pnpm check" can pass.`);
console.log('\nNext: fill the TODOs, citing trusted sources for every accessibility statement, then run "pnpm tokens:build" after any token change, "pnpm check" and "pnpm impact".');
console.log(`The docs are built with the design system: once implementations.web is final, "pnpm validate" lists every native <${element}> of the site that ${name} now covers; switch them to the component and update the table in ${PATHS.docs}/AGENTS.md.`);
