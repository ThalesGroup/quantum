/**
 * Divider — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/divider.spec.json) -> HTML string.
 * An hr: a thematic break with the implicit separator role; a vertical divider says so with
 * aria-orientation, a property of the separator role.
 */
import { escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'divider', selector: '.ds-divider' };

export function render(props = {}) {
  const { orientation = 'horizontal', state = null } = props;
  const attrs = ['class="ds-divider"', `data-orientation="${escapeAttr(orientation)}"`];
  if (orientation === 'vertical') attrs.push('aria-orientation="vertical"');
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  return `<hr ${attrs.join(' ')}>`;
}
