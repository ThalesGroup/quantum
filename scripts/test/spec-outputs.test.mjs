import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planSpecOutputs } from '../lib/spec-outputs.mjs';

const specsPath = 'packages/components/specs';
const files = [
  'AGENTS.md',
  'platforms.json',
  'a11y/roles.json',
  'schema/component.schema.json',
  'components/button.spec.json',
  'foundations/code.spec.json',
  'foundations/code/cards.css',
  'foundations/code/readme.md',
  'foundations/code/unused.js',
];
const specs = {
  'foundations/code.spec.json': {
    examples: [
      { id: 'css', source: `${specsPath}/foundations/code/cards.css` },
      { id: 'md', source: `${specsPath}/foundations/code/readme.md` },
      { id: 'focus', component: 'button' },
    ],
  },
};
const read = (f) => specs[f] ?? {};

test('planSpecOutputs keeps every JSON file and the samples examples show, nothing else', () => {
  const { outputs, problems } = planSpecOutputs(files, read, specsPath);
  assert.deepEqual(problems, []);
  assert.deepEqual(outputs, [
    'a11y/roles.json',
    'components/button.spec.json',
    'foundations/code.spec.json',
    'foundations/code/cards.css',
    'foundations/code/readme.md',
    'platforms.json',
    'schema/component.schema.json',
  ]);
});

test('planSpecOutputs reports a sample source outside the specs or missing', () => {
  const broken = { 'foundations/code.spec.json': { examples: [
    { id: 'gone', source: `${specsPath}/foundations/code/gone.css` },
    { id: 'outside', source: 'apps/docs/screens/screens.css' },
  ] } };
  const { problems } = planSpecOutputs(files, (f) => broken[f] ?? {}, specsPath);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /"gone"/);
  assert.match(problems[1], /"outside"/);
});
