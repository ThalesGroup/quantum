/**
 * Badge — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/badge.spec.json) -> HTML string.
 * A badge is text: a span with no role of its own; its label is what assistive technology reads,
 * in the flow of the content it qualifies.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'badge', selector: '.ds-badge' };

export function render(props = {}) {
  const { label = 'Badge', emphasis = 'subtle', intent = 'neutral', size = 'medium', state = null } = props;
  const attrs = ['class="ds-badge"', `data-emphasis="${escapeAttr(emphasis)}"`, `data-intent="${escapeAttr(intent)}"`, `data-size="${escapeAttr(size)}"`];
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  return `<span ${attrs.join(' ')}><span class="ds-badge__label" data-part="label">${escapeHtml(label)}</span></span>`;
}
