/**
 * Icon button — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/icon-button.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework.
 *
 * The label is the accessible name, given as aria-label; the glyph is aria-hidden so its
 * ligature name ("delete") is never read.
 * Extra sandbox-only prop: `state` forces a visual state through data-state.
 */
import { escapeAttr, renderIcon, ICONS } from '../../lib/template-utils.mjs';

export const meta = {
  id: 'icon-button',
  selector: '.ds-icon-button',
  icons: ICONS,
};

export function render(props = {}) {
  const {
    emphasis = 'accent',
    intent = 'neutral',
    size = 'medium',
    icon = 'add',
    label = 'Add',
    disabled = false,
    state = null,
    type = 'button',
  } = props;

  const attrs = [
    `type="${escapeAttr(type)}"`,
    'class="ds-icon-button"',
    `data-emphasis="${escapeAttr(emphasis)}"`,
    `data-intent="${escapeAttr(intent)}"`,
    `data-size="${escapeAttr(size)}"`,
    `aria-label="${escapeAttr(label)}"`,
  ];
  if (disabled) attrs.push('disabled');
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);

  const glyph = `<span class="ds-icon-button__icon" data-part="icon" aria-hidden="true">${renderIcon(icon || 'add')}</span>`;
  return `<button ${attrs.join(' ')}>${glyph}</button>`;
}
