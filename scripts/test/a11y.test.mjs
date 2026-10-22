import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadA11y, trustedPublisher, criterion, criterionFromUrl, resolveRef, citedCriteria,
  checkRegistry, checkSpecA11y, checkCitations, checkDocsA11y, docsAccessibilitySection, visibleTextContent,
} from '../lib/a11y.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registry = loadA11y(root);

const spec = (accessibility, extra = {}) => ({
  id: 'fixture',
  role: 'button',
  states: [{ id: 'default' }, { id: 'focus-visible' }],
  accessibility,
  ...extra,
});

const complete = () => ({
  ariaRole: 'button',
  name: { text: 'From content.', refs: ['apg'] },
  keyboard: [
    { key: 'Enter', action: 'Activates.', refs: ['apg'] },
    { key: 'Space', action: 'Activates.', refs: ['apg'] },
  ],
  guidelines: [{ text: 'Rules.', refs: ['wcag:1.4.3', 'wcag:1.4.11', 'wcag:2.1.1', 'wcag:2.4.7', 'wcag:2.5.8', 'wcag:4.1.2'] }],
  references: [{ id: 'apg', title: 'APG: Button', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/' }],
});

const errors = (problems) => problems.filter((p) => p.level === 'error').map((p) => p.message);

test('registry is self-consistent', () => {
  assert.deepEqual(errors(checkRegistry(registry)), []);
  assert.equal(registry.sources.conformanceTarget.level, 'AA');
});

test('trusted publishers match by URL prefix only', () => {
  assert.equal(trustedPublisher('https://www.w3.org/WAI/ARIA/apg/patterns/button/', registry), 'apg');
  assert.equal(trustedPublisher('https://developer.mozilla.org/en-US/docs/Web/HTML', registry), 'mdn');
  assert.equal(trustedPublisher('https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html', registry), 'wcag-guidance');
  assert.equal(trustedPublisher('https://example.com/a11y-tips', registry), null);
  assert.equal(trustedPublisher('https://www.w3.org.evil.test/TR/WCAG22/', registry), null);
});

test('criteria come from the generated WCAG 2.2 registry', () => {
  const c = criterion('2.5.8', registry);
  assert.equal(c.title, 'Target Size (Minimum)');
  assert.equal(c.level, 'AA');
  assert.equal(c.inTarget, true);
  assert.equal(c.url, 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html');
  assert.equal(criterion('2.5.5', registry).inTarget, false); // AAA
  assert.equal(criterion('4.1.1', registry).inWcag22, false); // removed in 2.2
  assert.equal(criterionFromUrl('https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html', registry), '2.4.7');
  assert.equal(criterionFromUrl('https://www.w3.org/TR/WCAG22/#use-of-color', registry), '1.4.1');
});

test('refs resolve to WCAG criteria or local references', () => {
  const s = spec(complete());
  assert.equal(resolveRef('wcag:2.1.1', s, registry).criterion.sc, '2.1.1');
  assert.equal(resolveRef('apg', s, registry).publisher, 'apg');
  assert.equal(resolveRef('nope', s, registry), null);
  assert.deepEqual(citedCriteria(s, registry).map((c) => c.sc), ['1.4.3', '1.4.11', '2.1.1', '2.4.7', '2.5.8', '4.1.2']);
});

test('a complete button contract passes', () => {
  assert.deepEqual(errors(checkSpecA11y(spec(complete()), registry)), []);
});

test('uncited, untrusted, unknown and removed citations are errors', () => {
  const a = complete();
  a.guidelines.push({ text: 'No source.', refs: [] });
  a.guidelines.push({ text: 'Removed.', refs: ['wcag:4.1.1'] });
  a.guidelines.push({ text: 'Unknown.', refs: ['wcag:9.9.9', 'blog'] });
  a.references.push({ id: 'blog', title: 'A blog', url: 'https://example.com/post' });
  const msgs = errors(checkSpecA11y(spec(a), registry)).join('\n');
  assert.match(msgs, /guidelines\[1\] cites no source/);
  assert.match(msgs, /4\.1\.1 .*not part of WCAG 2\.2/);
  assert.match(msgs, /unknown WCAG success criterion wcag:9\.9\.9/);
  assert.match(msgs, /"blog" .* is not a trusted source/);
});

test('role profile obligations are enforced', () => {
  const a = complete();
  a.ariaRole = 'link';
  a.keyboard = a.keyboard.filter((k) => k.key !== 'Space');
  a.guidelines = [{ text: 'Only keyboard.', refs: ['wcag:2.1.1'] }];
  delete a.name;
  const msgs = errors(checkSpecA11y(spec(a, { states: [{ id: 'default' }] }), registry)).join('\n');
  assert.match(msgs, /ariaRole must be "button"/);
  assert.match(msgs, /requires accessibility\.name/);
  assert.match(msgs, /keyboard entry for "Space"/);
  assert.match(msgs, /declare the "focus-visible" state/);
  assert.match(msgs, /requires WCAG 2\.4\.7/);
});

test('a role without profile is an error', () => {
  assert.match(errors(checkSpecA11y(spec(complete(), { role: 'tooltip' }), registry))[0], /no accessibility profile/);
});

test('docs need a sourced Accessibility section consistent with the spec', () => {
  const s = spec(complete());
  assert.equal(docsAccessibilitySection('## Overview\n\nx\n'), null);
  assert.match(errors(checkDocsA11y('## Overview\n', s, registry))[0], /needs a "## Accessibility" section/);
  assert.match(errors(checkDocsA11y('## Accessibility\n\nTrust me.\n\n## Related\n', s, registry))[0], /must link the trusted sources/);
  const md = '## Accessibility\n\n- [blog](https://example.com/x)\n- [1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)\n';
  const msgs = errors(checkDocsA11y(md, s, registry)).join('\n');
  assert.match(msgs, /example\.com\/x, which is not a trusted source/);
  assert.match(msgs, /relies on WCAG 1\.4\.1 but the spec does not cite wcag:1\.4\.1/);
  const ok = '## Accessibility\n\n[APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)\n';
  assert.deepEqual(errors(checkDocsA11y(ok, s, registry)), []);
});

test('visible text content ignores aria-hidden subtrees', () => {
  assert.equal(visibleTextContent('<button><span aria-hidden="true"><svg><path/></svg></span><span>Save</span></button>'), 'Save');
  assert.equal(visibleTextContent('<button><span aria-hidden="true">x</span></button>'), '');
});

test('decisions citing sources are checked and count as cited criteria', () => {
  const a = complete();
  const ok = spec(a, { decisions: [{ id: 'target', refs: ['wcag:2.5.5', 'apg'] }, { id: 'border' }] });
  assert.deepEqual(errors(checkSpecA11y(ok, registry)), []);
  assert.ok(citedCriteria(ok, registry).some((c) => c.sc === '2.5.5'));
  const bad = spec(a, { decisions: [{ id: 'target', refs: ['nowhere', 'wcag:4.1.1'] }] });
  const msgs = errors(checkSpecA11y(bad, registry));
  assert.ok(msgs.some((m) => m.includes('decision "target" cites "nowhere"')));
  assert.ok(msgs.some((m) => m.includes('decision "target" cites wcag:4.1.1')));
});

test('checkCitations: foundation specs (no role) are checked for sources, contrast refs included', () => {
  const foundation = {
    id: 'focus',
    contrast: [{ id: 'ring', foreground: 'color.focus.ring', backgrounds: ['color.surface.*'], minimum: 3, refs: ['wcag:1.4.11', 'focus-contrast'] }],
    accessibility: {
      guidelines: [{ text: 'A visible ring.', refs: ['wcag:2.4.7'] }],
      references: [{ id: 'focus-contrast', title: 'Understanding 1.4.11', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#related-focus' }],
    },
  };
  assert.deepEqual(checkCitations(foundation, registry), []);
  assert.deepEqual(citedCriteria(foundation, registry).map((c) => c.sc), ['1.4.11', '2.4.7']);
  const bad = structuredClone(foundation);
  bad.contrast[0].refs = ['wcag:9.9.9'];
  const msgs = checkCitations(bad, registry).map((p) => p.message).join('\n');
  assert.match(msgs, /contrast "ring" cites unknown WCAG success criterion/);
  assert.match(msgs, /"focus-contrast" is never cited/);
});
