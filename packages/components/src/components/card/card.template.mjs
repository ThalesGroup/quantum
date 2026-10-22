/**
 * Card — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/card.spec.json) -> HTML string.
 * A plain container (a div: no role of its own) on a surface level, with a heading as its title
 * and a paragraph as its description; `headingLevel` (2 to 6, default 3) fits the card into the
 * page's heading outline.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'card', selector: '.ds-card' };

export function render(props = {}) {
  const { title = 'Title', description = null, surface = 'level-1', headingLevel = 3, state = null } = props;
  const level = Math.min(6, Math.max(2, Number(headingLevel) || 3));
  const attrs = ['class="ds-card"', `data-surface="${escapeAttr(surface)}"`];
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  const parts = [`<h${level} class="ds-card__title" data-part="title">${escapeHtml(title)}</h${level}>`];
  if (description) parts.push(`<p class="ds-card__description" data-part="description">${escapeHtml(description)}</p>`);
  return `<div ${attrs.join(' ')}>${parts.join('')}</div>`;
}
