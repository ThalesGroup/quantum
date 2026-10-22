/**
 * The documentation site is built with the design system (apps/docs/AGENTS.md "Built with the design
 * system"). Pure checks, zero dependencies, used by scripts/validate.mjs and the tests:
 *
 * - checkSiteCss: the chrome's colors, typography, radii, border widths and outlines come from
 *   semantic tokens. No literal color, no raw or component token, no unknown variable.
 * - checkSiteMarkup: a native control that a design system component covers (same web element,
 *   same ARIA role) is rendered as that component, so a new component lands in the site too.
 *
 * Problems are { level: 'error' | 'warn', message }.
 */

/** Custom properties the site may define and read besides semantic tokens. */
export const SITE_OWN_VARS = /^--(site-|ca-|_|swatch$)/;

const TYPOGRAPHY = new Set(['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing']);
const KEYWORDS = /^(inherit|initial|unset|revert|normal|none|0)$/;
const COLOR_FUNCTION = /(?<![-\w])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|light-dark)\(/;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const NAMED_COLOR = /(?<![-\w])(white|black|gr[ae]y|silver|red|green|blue|yellow|orange|purple|pink|navy|teal)(?![-\w])/;
const LENGTH = /(?<![-\w.])\d*\.?\d+(px|rem|em)\b/;

/** Innermost { … } blocks, split into [property, value] declarations. */
function declarations(css) {
  const out = [];
  for (const [, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\{([^{}]*)\}/g)) {
    for (const decl of body.split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const prop = decl.slice(0, i).trim().toLowerCase();
      const value = decl.slice(i + 1).trim();
      if (prop && value) out.push([prop, value]);
    }
  }
  return out;
}

/**
 * @param {string} css
 * @param {{ semantic: Set<string>, raw: Set<string>, component: Set<string> }} vars CSS variable names per tier
 * @param {{ own?: RegExp, who?: string }} [options] the custom properties the stylesheet may define
 *   and read besides semantic tokens, and who reads them (in messages). The screens' stylesheet
 *   (screens/screens.css) follows the same rules with its own --scr-* variables.
 */
export function checkSiteCss(css, vars, { own = SITE_OWN_VARS, who = 'the site' } = {}) {
  const problems = [];
  const seen = new Set();
  const problem = (message) => { if (!seen.has(message)) { seen.add(message); problems.push({ level: 'error', message }); } };

  for (const [prop, value] of declarations(css)) {
    const where = `${prop}: ${value}`;
    if (HEX.test(value) || COLOR_FUNCTION.test(value) || NAMED_COLOR.test(value)) problem(`"${where}" has a literal color; use a semantic color token`);
    if (!prop.startsWith('--')) {
      if (TYPOGRAPHY.has(prop) && !/^var\(--[a-z0-9-]+\)$/.test(value) && !KEYWORDS.test(value)) problem(`"${where}" is a literal ${prop}; use the typography tokens (--body-*, --heading-*, --mono-*, --font-line-height-*)`);
      if (prop === 'font' && !KEYWORDS.test(value)) problem(`"${where}": the font shorthand only takes "inherit"; set the text style's properties`);
      if (/^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width)?$/.test(prop) && LENGTH.test(value)) problem(`"${where}" has a literal border width; use --stroke-width-*`);
      if (/radius$/.test(prop) && LENGTH.test(value)) problem(`"${where}" has a literal radius; use --corner-radius-*`);
      if (/^outline(-width)?$/.test(prop) && LENGTH.test(value)) problem(`"${where}" has a literal outline width; use --focus-ring-width`);
    }
    for (const [, name] of value.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
      if (own.test(name) || vars.semantic.has(name)) continue;
      if (vars.raw.has(name)) problem(`reads raw token ${name}; ${who} reads semantic tokens only`);
      else if (vars.component.has(name)) problem(`reads component token ${name}; render the component instead`);
      else problem(`reads ${name}, which is neither a semantic token nor a variable of ${who}`);
    }
  }
  return problems;
}

/**
 * Implicit ARIA role of a native element (HTML-AAM, https://www.w3.org/TR/html-aam-1.0/; ARIA in
 * HTML, https://www.w3.org/TR/html-aria/). Only the elements a component can be built on.
 */
export function implicitRole(tag, attrs) {
  const attr = (name) => new RegExp(`(?:^|\\s)${name}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{[^}]*\\}|([^\\s>]+)))?(?=\\s|$)`).exec(attrs);
  const val = (name) => { const m = attr(name); return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null; };
  switch (tag) {
    case 'button': return 'button';
    case 'a': return attr('href') ? 'link' : null;
    case 'textarea': return 'textbox';
    case 'select': return attr('multiple') || Number(val('size')) > 1 ? 'listbox' : 'combobox';
    case 'details': return 'group';
    case 'dialog': return 'dialog';
    case 'progress': return 'progressbar';
    case 'meter': return 'meter';
    case 'input': {
      const type = (val('type') ?? 'text').toLowerCase();
      return { button: 'button', submit: 'button', reset: 'button', image: 'button', checkbox: 'checkbox', radio: 'radio', range: 'slider', number: 'spinbutton', search: 'searchbox', email: 'textbox', tel: 'textbox', text: 'textbox', url: 'textbox' }[type] ?? null;
    }
    default: return null;
  }
}

/**
 * Roles of the native controls a component can cover. A landmark or container component (a
 * Breadcrumb's navigation, a Card's article) does not claim every element with its role: a `nav`
 * of the chrome is not a Breadcrumb. Only controls (widgets people operate or read a value from)
 * are checked.
 */
export const COVERING_ROLES = new Set(['button', 'link', 'checkbox', 'radio', 'switch', 'textbox', 'searchbox', 'spinbutton', 'slider', 'combobox', 'listbox', 'option', 'progressbar', 'meter']);

/**
 * @param {string} source an .astro (or HTML) file
 * @param {{ id: string, name: string, element: string, role: string, rootClass: string, roleClass?: string }[]} components
 *   `element` and `role` are those of the element carrying the component's role: the root, or the
 *   rolePart's element inside a wrapper root, which then carries `roleClass` (a text field's input).
 * @param {{ parts?: boolean }} [options] `parts`: the source is rendered HTML (a screen), where a
 *   control carrying a component's part class (ds-<id>__<part>) is that component's own markup.
 */
export function checkSiteMarkup(source, components, { parts = false } = {}) {
  const problems = [];
  // Rendered HTML (screens): a control inside a component is one of its parts (a Dropdown's items
  // are buttons carrying ds-dropdown__item), rendered by the component's own template.
  const partClass = parts ? new RegExp(`(?:^|[\\s"'])ds-(?:${components.map((c) => c.id).join('|')})__[a-z0-9-]+(?=[\\s"']|$)`) : null;
  components = components.filter((c) => COVERING_ROLES.has(c.role));
  const tags = [...new Set(components.map((c) => c.element))];
  if (!tags.length) return problems;
  const tagPattern = new RegExp(`<(${tags.join('|')})\\b((?:[^>{]|\\{[^}]*\\})*)>`, 'g');
  for (const m of source.matchAll(tagPattern)) {
    const [, tag, attrs] = m;
    const explicit = /(?:^|\s)role\s*=\s*["']([a-z]+)/.exec(attrs)?.[1];
    const role = explicit ?? implicitRole(tag, attrs);
    const covering = components.filter((c) => c.element === tag && c.role === role);
    const carries = (cls) => cls && new RegExp(`(?:^|[\\s"'{\`])${cls}(?=[\\s"'}\`]|$)`).test(attrs);
    if (!covering.length || covering.some((c) => carries(c.rootClass) || carries(c.roleClass)) || partClass?.test(attrs)) continue;
    const line = source.slice(0, m.index).split('\n').length;
    problems.push({
      level: 'error',
      line,
      message: `line ${line}: native <${tag}> with role "${role}" is covered by ${covering.map((c) => `${c.name} (${c.id})`).join(', ')}: render it with the component's template instead of a site look-alike`,
    });
  }
  return problems;
}
