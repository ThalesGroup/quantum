/**
 * Button — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/button.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework.
 *
 * Extra sandbox-only prop: `state` forces a visual state through data-state.
 * Extra composition prop: `attrs` adds HTML attributes to the button (a `class` is appended to
 * ds-button), so a component built on Button (Dropdown) can wire it without copying its markup.
 */
import { escapeHtml, escapeAttr, renderIcon, ICONS } from '../../lib/template-utils.mjs';

export const meta = {
  id: 'button',
  selector: '.ds-button',
  icons: ICONS,
};

export function render(props = {}) {
  const {
    emphasis = 'accent',
    intent = 'neutral',
    size = 'medium',
    label = 'Button',
    iconStart = null,
    iconEnd = null,
    disabled = false,
    state = null,
    type = 'button',
    attrs: extra = {},
  } = props;

  const { class: extraClass, ...extraAttrs } = extra;
  const attrs = [
    `type="${escapeAttr(type)}"`,
    `class="${['ds-button', extraClass].filter(Boolean).map(escapeAttr).join(' ')}"`,
    `data-emphasis="${escapeAttr(emphasis)}"`,
    `data-intent="${escapeAttr(intent)}"`,
    `data-size="${escapeAttr(size)}"`,
  ];
  if (disabled) attrs.push('disabled');
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  for (const [name, value] of Object.entries(extraAttrs)) {
    if (value === false || value == null) continue;
    attrs.push(value === true ? escapeAttr(name) : `${escapeAttr(name)}="${escapeAttr(value)}"`);
  }

  const parts = [];
  if (iconStart) parts.push(`<span class="ds-button__icon" data-part="icon" data-position="start" aria-hidden="true">${renderIcon(iconStart)}</span>`);
  parts.push(`<span class="ds-button__label" data-part="label">${escapeHtml(label)}</span>`);
  if (iconEnd) parts.push(`<span class="ds-button__icon" data-part="icon" data-position="end" aria-hidden="true">${renderIcon(iconEnd)}</span>`);

  return `<button ${attrs.join(' ')}>${parts.join('')}</button>`;
}
