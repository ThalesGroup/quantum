/**
 * The component CSS follows the reading direction (Iconography rule `direction`, apps/docs/AGENTS.md
 * "Reading direction"): it lays parts out with logical properties and values, so a right-to-left
 * layout mirrors it with no rule of its own. Pure check, zero dependencies, used by
 * scripts/validate.mjs and the tests:
 *
 * - checkLogicalCss: no physical horizontal property (`margin-left`, `padding-right`,
 *   `border-left-color`, `border-top-left-radius`, `left`, `right`…), no physical horizontal value
 *   (`text-align`, `float` or `clear` set to `left` or `right`, a gradient going `to left` or
 *   `to right`). A rule whose selector reads `:dir(…)` is written for one direction, so it may use them.
 *
 * Problems are { level: 'error' | 'warn', message }.
 */

/** A property naming a physical side or corner: left, right, top-left, bottom-right… */
const PHYSICAL_PROPERTY = /(^|-)(left|right)(-|$)/;
/** Properties whose `left` or `right` keyword has a logical `start` or `end` equivalent. */
const SIDE_KEYWORD_PROPERTIES = new Set(['text-align', 'text-align-last', 'float', 'clear']);
const SIDE_KEYWORD = /(?<![-\w])(left|right)(?![-\w])/;
const GRADIENT_SIDE = /gradient\(\s*to\s+(?:(?:top|bottom)\s+)?(left|right)\b/;

const LOGICAL = {
  margin: 'margin-inline-start / margin-inline-end',
  padding: 'padding-inline-start / padding-inline-end',
  border: 'border-inline-start-* / border-inline-end-*',
  radius: 'border-start-start-radius, border-start-end-radius, border-end-start-radius, border-end-end-radius',
  inset: 'inset-inline-start / inset-inline-end',
};

const hint = (prop) => {
  if (/radius$/.test(prop)) return LOGICAL.radius;
  if (/^(left|right)$/.test(prop)) return LOGICAL.inset;
  const head = prop.replace(/^-(webkit|moz)-/, '').split('-')[0];
  return LOGICAL[head] ?? `the ${prop.replace(/left|right/, 'inline-start/inline-end')} equivalent`;
};

/** Innermost { … } blocks with their selector, split into [selector, property, value]. */
function declarations(css) {
  const out = [];
  for (const [, selector, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    for (const decl of body.split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const prop = decl.slice(0, i).trim().toLowerCase();
      const value = decl.slice(i + 1).trim();
      if (prop && value) out.push([selector.trim(), prop, value]);
    }
  }
  return out;
}

/**
 * @param {string} css the component's stylesheet
 * @returns {{ level: 'error' | 'warn', message: string }[]}
 */
export function checkLogicalCss(css) {
  const problems = [];
  const seen = new Set();
  const problem = (message) => { if (!seen.has(message)) { seen.add(message); problems.push({ level: 'error', message }); } };

  for (const [selector, prop, value] of declarations(css)) {
    if (/:dir\(/.test(selector) || prop.startsWith('--')) continue;
    const where = `${prop}: ${value}`;
    if (PHYSICAL_PROPERTY.test(prop)) problem(`"${where}" is a physical property; use ${hint(prop)} so a right-to-left layout mirrors it`);
    else if (SIDE_KEYWORD_PROPERTIES.has(prop) && SIDE_KEYWORD.test(value)) problem(`"${where}" is a physical side; use ${prop}: start or end so a right-to-left layout mirrors it`);
    const gradient = value.match(GRADIENT_SIDE);
    if (gradient) problem(`"${where}" goes to the ${gradient[1]} in every direction; write the reading-direction case in a :dir(rtl) rule, or use an angle when the drawing is symmetric`);
  }
  return problems;
}
