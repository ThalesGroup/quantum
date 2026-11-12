import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkLogicalCss } from '../lib/logical-css.mjs';

const messages = (css) => checkLogicalCss(css).map((p) => p.message);
const clean = (css) => assert.deepEqual(messages(css), [], css);
const flags = (css, pattern) => assert.ok(messages(css).some((m) => pattern.test(m)), `${css} -> ${JSON.stringify(messages(css))}`);

test('logical properties and values pass', () => {
  clean('.a { margin-inline-start: var(--x); padding-inline: var(--y); border-inline-end-color: var(--z); }');
  clean('.a { inset-inline-start: 0; border-start-end-radius: var(--r); text-align: start; float: inline-end; }');
  clean('.a { margin-block: 0; padding-top: var(--y); border-bottom-width: var(--w); top: 0; }');
  clean('.a { background-image: linear-gradient(90deg, transparent, currentColor); }');
  clean('.a { background-image: linear-gradient(to bottom, transparent, currentColor); }');
  clean('.a { translate: var(--x) 0; scale: -1 1; flex-direction: row; }');
});

test('comments, custom properties and :dir() rules are not checked', () => {
  clean('/* margin-left: 0; text-align: right */ .a { color: currentColor; }');
  clean('.a { --_side: right; }');
  clean('.a:dir(rtl) { text-align: right; } .b:dir(ltr)::before { left: 0; }');
  clean('@media (prefers-reduced-motion: reduce) { .a:dir(rtl) { margin-right: 0; } }');
});

test('physical horizontal properties fail with their logical equivalent', () => {
  flags('.a { margin-left: 0; }', /margin-inline-start/);
  flags('.a { padding-right: var(--x); }', /padding-inline-start/);
  flags('.a { border-left: var(--w) solid currentColor; }', /border-inline-start/);
  flags('.a { border-right-color: currentColor; }', /border-inline-start/);
  flags('.a { border-top-left-radius: var(--r); }', /border-start-start-radius/);
  flags('.a { left: 0; }', /inset-inline-start/);
  flags('.a { right: 0; }', /inset-inline-start/);
  flags('.a { scroll-margin-left: 0; }', /physical property/);
  flags('@media (min-width: 0) { .a { margin-right: 0; } }', /physical property/);
});

test('physical sides in values fail', () => {
  flags('.a { text-align: left; }', /text-align: start or end/);
  flags('.a { float: right; }', /float: start or end/);
  flags('.a { clear: left; }', /clear: start or end/);
  flags('.a { background: linear-gradient(to right, red, blue); }', /goes to the right/);
  flags('.a { background-image: repeating-linear-gradient(to top left, red, blue); }', /goes to the left/);
});

test('a problem is reported once per declaration', () => {
  assert.equal(checkLogicalCss('.a { margin-left: 0; } .b { margin-left: 0; }').length, 1);
});
