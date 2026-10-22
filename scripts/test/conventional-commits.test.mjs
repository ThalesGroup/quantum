import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREA_SCOPES, lintCommit, stripGitComments } from '../lib/conventional-commits.mjs';

const scopes = ['button', 'icon-button', 'tokens', 'site'];
const ok = (m) => assert.deepEqual(lintCommit(m, { scopes }).errors, []);
const fails = (m, pattern) => {
  const { ok: passed, errors } = lintCommit(m, { scopes });
  assert.equal(passed, false, `expected "${m}" to fail`);
  assert.ok(errors.some((e) => pattern.test(e)), `no error matching ${pattern} in ${JSON.stringify(errors)}`);
};

test('accepts type, optional scopes and breaking marker', () => {
  ok('feat(button): three emphasis variants');
  ok('fix: keep the alpha channel of DTCG colors');
  ok('feat(button,icon-button): color modes');
  ok('feat(tokens)!: rename the control radii');
  ok('docs: explain the decision loop\n\nLonger body.\n\nRefs: #6');
});

test('reads breaking changes from the marker and the footer', () => {
  assert.equal(lintCommit('feat(button)!: drop the tertiary emphasis', { scopes }).header.breaking, true);
  assert.equal(lintCommit('feat(button): drop the tertiary emphasis\n\nBREAKING CHANGE: use ghost instead', { scopes }).header.breaking, true);
  assert.equal(lintCommit('feat(button): add a loading state', { scopes }).header.breaking, false);
  fails('feat(button): x\n\nBREAKING CHANGE:', /needs a description/);
  fails('feat(button): x\n\nbreaking change: use ghost', /capitals/);
});

test('rejects the old "<Component>: <decision>" form and unknown types', () => {
  fails('Button: color modes', /must read/);
  fails('feature(button): color modes', /unknown type/);
  fails('feat(Button): color modes', /kebab-case/);
});

test('rejects unknown scopes, only when a scope list is given', () => {
  fails('feat(buton): typo in the scope', /unknown scope "buton"/);
  assert.equal(lintCommit('feat(anything): free scope').ok, true);
});

test('foundations is an area scope; foundation ids are passed like component ids', () => {
  assert.ok(AREA_SCOPES.includes('foundations'));
  const scopes = ['button', 'focus', ...AREA_SCOPES];
  assert.equal(lintCommit('feat(foundations): foundation specs', { scopes }).ok, true);
  assert.equal(lintCommit('feat(focus): the focus ring as a foundation', { scopes }).ok, true);
  assert.match(lintCommit('feat(focuss): typo', { scopes }).errors.join('\n'), /component or foundation id/);
});

test('subject and layout rules', () => {
  fails('feat(button): ', /must read/);
  fails('feat(button):    \n\nbody', /subject is empty|must read/);
  fails('feat(button): ends with a period.', /period/);
  fails('feat(button):no space', /must read/);
  fails(`feat(button): ${'x'.repeat(100)}`, /characters/);
  fails('feat(button): header\nbody without blank line', /blank line/);
});

test('ignores git comments and lets git-generated messages through', () => {
  ok('feat(site): mode switch\n# Please enter the commit message\n# ------------------------ >8 ------------------------\nnot: checked');
  assert.equal(stripGitComments('# only a comment\n'), '');
  fails('# only a comment\n', /empty/);
  assert.equal(lintCommit('Merge branch \'main\' of origin').exempt, true);
  assert.equal(lintCommit('fixup! feat(button): color modes').exempt, true);
  assert.equal(lintCommit('Revert "feat(button): color modes"').exempt, true);
});
