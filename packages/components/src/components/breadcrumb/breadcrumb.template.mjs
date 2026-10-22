/**
 * Breadcrumb — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/breadcrumb.spec.json) -> HTML string.
 * A nav landmark labelled "Breadcrumb" holding an ordered list of links; the last item is the
 * current page, marked with aria-current="page" and not linked. The separators are decorative.
 *
 * Extra sandbox-only props: `state` on the root forces a state on every item; an entry's `state`
 * forces it on that item.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

export const meta = { id: 'breadcrumb', selector: '.ds-breadcrumb' };

export function render(props = {}) {
  const { items = [{ label: 'Home', href: '#' }, { label: 'Current page' }], label = 'Breadcrumb', size = 'medium', state = null } = props;
  const rootAttrs = ['class="ds-breadcrumb"', `aria-label="${escapeAttr(label)}"`, `data-size="${escapeAttr(size)}"`];
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  const last = items.length - 1;
  const list = items.map((entry, i) => {
    const { label: text = `Page ${i + 1}`, href = null, state: itemState = null } = entry;
    const current = i === last;
    const itemAttrs = ['class="ds-breadcrumb__item"', 'data-part="item"'];
    if (itemState && itemState !== 'default') itemAttrs.push(`data-state="${escapeAttr(itemState)}"`);
    const link = current
      ? `<span class="ds-breadcrumb__link" data-part="link" aria-current="page">${escapeHtml(text)}</span>`
      : `<a class="ds-breadcrumb__link" data-part="link" href="${escapeAttr(href ?? '#')}">${escapeHtml(text)}</a>`;
    const separator = current ? '' : `<span class="ds-breadcrumb__separator" data-part="separator" aria-hidden="true">${renderIcon('chevron_right')}</span>`;
    return `<li ${itemAttrs.join(' ')}>${link}${separator}</li>`;
  });
  return `<nav ${rootAttrs.join(' ')}><ol class="ds-breadcrumb__list" data-part="list">${list.join('')}</ol></nav>`;
}
