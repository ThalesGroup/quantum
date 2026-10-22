/**
 * Icon — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/icon.spec.json) -> HTML string.
 * A glyph of the icon font written as its ligature name. Without a label it is decorative and
 * hidden; with one it is an image named by the label.
 */
import { escapeAttr, renderIcon, ICONS } from '../../lib/template-utils.mjs';

export const meta = { id: 'icon', selector: '.ds-icon', icons: ICONS };

export function render(props = {}) {
  const { name = 'add', label = null, size = 'medium', color = 'current', state = null } = props;
  const attrs = ['class="ds-icon"', `data-size="${escapeAttr(size)}"`, `data-color="${escapeAttr(color)}"`];
  if (label) attrs.push('role="img"', `aria-label="${escapeAttr(label)}"`);
  else attrs.push('aria-hidden="true"');
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  return `<span ${attrs.join(' ')}>${renderIcon(name || 'add')}</span>`;
}
