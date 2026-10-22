/**
 * Skeleton — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/skeleton.spec.json) -> HTML string.
 * A placeholder shape hidden from assistive technology: the region that loads says so itself
 * (aria-busy, a status message), not each shape.
 */
import { escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'skeleton', selector: '.ds-skeleton' };

const LENGTH = /^\d*\.?\d+(px|rem|em|%|ch|vw)$/;

export function render(props = {}) {
  const { shape = 'text', width = null, height = null, state = null } = props;
  const attrs = ['class="ds-skeleton"', `data-shape="${escapeAttr(shape)}"`, 'aria-hidden="true"'];
  const style = [];
  if (width && LENGTH.test(String(width))) style.push(`--_width: ${width}`);
  if (height && LENGTH.test(String(height))) style.push(`--_height: ${height}`);
  if (style.length) attrs.push(`style="${escapeAttr(style.join('; '))}"`);
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  return `<span ${attrs.join(' ')}></span>`;
}
