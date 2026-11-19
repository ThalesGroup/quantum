import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCOPES, inScope, followedByScope, componentsInScope, tiersOf, checkInputControl } from '../lib/foundation-scope.mjs';
import { loadA11y, checkRegistry } from '../lib/a11y.mjs';
import { PATHS } from '../lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registry = loadA11y(root);
const dir = path.join(root, PATHS.specs, 'components');
const specs = fs.readdirSync(dir).filter((f) => f.endsWith('.spec.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const ids = (list) => list.map((s) => s.id).sort();

test('the scopes are the appliesTo values of the foundation schema', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(root, PATHS.specs, 'schema/foundation.schema.json'), 'utf8'));
  assert.deepEqual(Object.keys(SCOPES).sort(), [...schema.properties.appliesTo.enum].sort());
});

test('input-components is every component whose role profile is marked input', () => {
  assert.deepEqual(ids(componentsInScope('input-components', specs, registry.roles)), [
    'checkbox', 'checkbox-group', 'number-field', 'radio-group', 'search-field', 'select', 'slider', 'switch', 'text-field', 'textarea',
  ]);
});

test('the input flag is on the roles that require labels or instructions, and only on them', () => {
  const flagged = Object.entries(registry.roles).filter(([, p]) => p.input).map(([role]) => role).sort();
  const requiring = Object.entries(registry.roles).filter(([, p]) => p.requiredCriteria?.['3.3.2']).map(([role]) => role).sort();
  assert.deepEqual(flagged, ['checkbox', 'combobox', 'group', 'searchbox', 'slider', 'spinbutton', 'switch', 'textarea', 'textbox']);
  assert.deepEqual(flagged, requiring);
});

test('a button that submits is not in scope: its role is not an input', () => {
  const button = specs.find((s) => s.id === 'button');
  assert.equal(inScope('input-components', button, registry.roles), false);
  assert.equal(inScope('focusable-components', button, registry.roles), true);
  assert.equal(inScope('every-component', button, registry.roles), true);
});

test('focusable-components reads the focusable flag, as before', () => {
  assert.equal(inScope('focusable-components', { role: 'button' }, registry.roles), true);
  assert.equal(inScope('focusable-components', { role: 'presentation' }, registry.roles), false);
  assert.equal(inScope('focusable-components', { role: 'unknown-role' }, registry.roles), false);
});

test('only input-components resolves its followers by scope', () => {
  assert.equal(followedByScope('input-components'), true);
  assert.equal(followedByScope('focusable-components'), false);
  assert.equal(followedByScope('every-component'), false);
  assert.equal(followedByScope(undefined), false);
});

test('tiers are read from the spec: required property, invalid state', () => {
  const by = (id) => tiersOf(specs.find((s) => s.id === id));
  assert.deepEqual(by('text-field'), ['presentation', 'required', 'validation']);
  assert.deepEqual(by('search-field'), ['presentation', 'required']);
  assert.deepEqual(by('slider'), ['presentation']);
  assert.deepEqual(by('switch'), ['presentation']);
  assert.deepEqual(tiersOf({}), ['presentation']);
});

const field = (extra = {}) => ({
  states: [{ id: 'default' }],
  anatomy: [{ id: 'container', role: 'container', required: true }, { id: 'label', role: 'label', required: true }],
  ...extra,
});

test('an input needs a required label part of the whole control', () => {
  assert.deepEqual(checkInputControl(field()), []);
  assert.equal(checkInputControl(field({ anatomy: [{ id: 'container', role: 'container', required: true }] }))[0].level, 'error');
  assert.equal(checkInputControl(field({ anatomy: [{ id: 'container', role: 'container', required: true }, { id: 'label', role: 'label', required: false }] }))[0].level, 'error');
  // the label of an option inside a group is not the group's label
  const nested = [{ id: 'container', role: 'container', required: true }, { id: 'option-label', role: 'label', required: true, parent: 'option' }];
  assert.equal(checkInputControl(field({ anatomy: nested }))[0].level, 'error');
  // a group's legend is its label
  assert.deepEqual(checkInputControl(field({ anatomy: [{ id: 'container', role: 'container', required: true }, { id: 'legend', role: 'label', required: true }] })), []);
});

test('the invalid state needs an error message part, as a warning', () => {
  const invalid = { states: [{ id: 'default' }, { id: 'invalid' }] };
  const problems = checkInputControl(field(invalid));
  assert.deepEqual(problems.map((p) => p.level), ['warn']);
  assert.match(problems[0].message, /errormessage/);
  const withMessage = field({ ...invalid, anatomy: [...field().anatomy, { id: 'error-message', role: 'errormessage', required: false }] });
  assert.deepEqual(checkInputControl(withMessage), []);
});

test('today every input has a label, and only the checkbox lacks an error message part', () => {
  const inputs = componentsInScope('input-components', specs, registry.roles);
  const problems = inputs.flatMap((s) => checkInputControl(s).map((p) => `${s.id}: ${p.level}`));
  assert.deepEqual(problems, ['checkbox: warn']);
});

test('the registry rejects an input role that does not require labels or instructions', () => {
  const broken = { ...registry, roles: { ...registry.roles, button: { ...registry.roles.button, input: true } } };
  assert.match(checkRegistry(broken).map((p) => p.message).join('\n'), /"button" is marked input but does not require 3\.3\.2/);
  assert.deepEqual(checkRegistry(registry).filter((p) => p.level === 'error'), []);
});
