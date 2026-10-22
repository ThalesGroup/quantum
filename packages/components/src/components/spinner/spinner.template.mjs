/**
 * Spinner — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/spinner.spec.json) -> HTML string.
 * A status live region holding the ring (decorative) and the label, visible or visually hidden:
 * assistive technology announces the label when the spinner appears.
 *
 * Extra sandbox-only prop: `state` (no state other than default).
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'spinner', selector: '.ds-spinner' };

export function render(props = {}) {
  const { label = 'Loading', showLabel = false, size = 'medium', state = null } = props;
  const attrs = ['class="ds-spinner"', 'role="status"', `data-size="${escapeAttr(size)}"`];
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  return `<div ${attrs.join(' ')}><span class="ds-spinner__ring" data-part="ring" aria-hidden="true"></span><span class="ds-spinner__label" data-part="label"${showLabel ? '' : ' data-hidden'}>${escapeHtml(label)}</span></div>`;
}
