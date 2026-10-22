/**
 * The design system as screens consume it: every component template of the web reference
 * implementation (packages/components/src/, in the repository only: @quantum-ds/components publishes
 * the specs alone), and the helpers screens share. A screen renders components only through these functions, so the markup,
 * the classes and the tokens stay the components' own (apps/docs/screens/AGENTS.md).
 *
 * Pure functions, no DOM: screens render in Node (pnpm validate) and in the Astro site alike.
 */
import { escapeHtml, escapeAttr } from '../../../../packages/components/src/lib/template-utils.mjs';
import { render as accordion } from '../../../../packages/components/src/components/accordion/accordion.template.mjs';
import { render as alert } from '../../../../packages/components/src/components/alert/alert.template.mjs';
import { render as avatar } from '../../../../packages/components/src/components/avatar/avatar.template.mjs';
import { render as badge } from '../../../../packages/components/src/components/badge/badge.template.mjs';
import { render as breadcrumb } from '../../../../packages/components/src/components/breadcrumb/breadcrumb.template.mjs';
import { render as button } from '../../../../packages/components/src/components/button/button.template.mjs';
import { render as card } from '../../../../packages/components/src/components/card/card.template.mjs';
import { render as checkbox } from '../../../../packages/components/src/components/checkbox/checkbox.template.mjs';
import { render as divider } from '../../../../packages/components/src/components/divider/divider.template.mjs';
import { render as dropdown } from '../../../../packages/components/src/components/dropdown/dropdown.template.mjs';
import { render as icon } from '../../../../packages/components/src/components/icon/icon.template.mjs';
import { render as iconButton } from '../../../../packages/components/src/components/icon-button/icon-button.template.mjs';
import { render as pagination } from '../../../../packages/components/src/components/pagination/pagination.template.mjs';
import { render as progressBar } from '../../../../packages/components/src/components/progress-bar/progress-bar.template.mjs';
import { render as radioGroup } from '../../../../packages/components/src/components/radio-group/radio-group.template.mjs';
import { render as searchField } from '../../../../packages/components/src/components/search-field/search-field.template.mjs';
import { render as select } from '../../../../packages/components/src/components/select/select.template.mjs';
import { render as switchControl } from '../../../../packages/components/src/components/switch/switch.template.mjs';
import { render as textField } from '../../../../packages/components/src/components/text-field/text-field.template.mjs';
import { render as textarea } from '../../../../packages/components/src/components/textarea/textarea.template.mjs';

export { escapeHtml, escapeAttr };

/** Component templates, keyed by a camelCase form of the component id. */
export const ds = {
  accordion,
  alert,
  avatar,
  badge,
  breadcrumb,
  button,
  card,
  checkbox,
  divider,
  dropdown,
  icon,
  iconButton,
  pagination,
  progressBar,
  radioGroup,
  searchField,
  select,
  switch: switchControl,
  textField,
  textarea,
};

/**
 * Content inside a component that has no part for it yet: inserted before the closing tag of the
 * component's root, so the component's own layout (Card: a column with its gap and padding) lays
 * it out. A composition shim, not a restyle: it disappears once the component gets a content part
 * (a Card content part is a known gap). Use it only where apps/docs/screens/AGENTS.md allows it.
 */
export function slot(componentHtml, ...content) {
  const at = componentHtml.lastIndexOf('</');
  return componentHtml.slice(0, at) + join(content) + componentHtml.slice(at);
}

/** Joins nested arrays of HTML strings, dropping null, undefined and false. */
export function join(...parts) {
  return parts.flat(Infinity).filter((p) => p !== null && p !== undefined && p !== false).join('');
}

/** An element with a screens class (scr-*) and optional attributes. */
export function el(tag, attrs, ...children) {
  const list = Object.entries(attrs ?? {})
    .filter(([, v]) => v !== false && v !== null && v !== undefined)
    .map(([k, v]) => (v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`));
  return `<${tag}${list.length ? ' ' + list.join(' ') : ''}>${join(children)}</${tag}>`;
}

/**
 * The root of every screen: the viewport the screen's container queries read (.scr-viewport), and
 * the screen itself, with its base text style and surface. `class` adds scr-* classes.
 */
export function screen({ class: extra = null, ...attrs } = {}, ...children) {
  return el('div', { class: 'scr-viewport' }, el('div', { class: ['scr-screen', extra].filter(Boolean).join(' '), ...attrs }, ...children));
}

/** Text, escaped. */
export const text = (value) => escapeHtml(value);

/** A link (no Link component yet). */
export function link(label, { href = '#', className = 'scr-link', current = false } = {}) {
  return el('a', { class: className, href, 'aria-current': current ? 'page' : null }, escapeHtml(label));
}
