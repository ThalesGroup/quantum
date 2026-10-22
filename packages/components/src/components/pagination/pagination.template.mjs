/**
 * Pagination — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/pagination.spec.json) -> HTML string.
 * A nav landmark labelled "Pagination" holding a list of page links; the current page carries
 * aria-current="page" and is not a link; previous and next are links with a chevron and a visible
 * label, rendered without a destination (aria-disabled) at the first and last pages.
 *
 * Extra sandbox-only props: `state` on the root forces a state on every item; an entry's `state`
 * forces it on that item.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

export const meta = { id: 'pagination', selector: '.ds-pagination' };

export function render(props = {}) {
  const {
    pages = [{ label: '1', href: '#', current: true }, { label: '2', href: '#' }, { label: '3', href: '#' }],
    previous = null,
    next = null,
    label = 'Pagination',
    size = 'medium',
    state = null,
  } = props;
  const rootAttrs = ['class="ds-pagination"', `aria-label="${escapeAttr(label)}"`, `data-size="${escapeAttr(size)}"`];
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const link = (content, href, extra = []) => (href
    ? `<a class="ds-pagination__link" data-part="link" href="${escapeAttr(href)}" ${extra.join(' ')}>${content}</a>`
    : `<span class="ds-pagination__link" data-part="link" role="link" aria-disabled="true" ${extra.join(' ')}>${content}</span>`);
  const item = (content, itemState = null, part = 'item') => {
    const attrs = [`class="ds-pagination__${part === 'item' ? 'item' : part}"`, `data-part="${part}"`];
    if (part !== 'item') attrs[0] = 'class="ds-pagination__item"';
    if (itemState && itemState !== 'default') attrs.push(`data-state="${escapeAttr(itemState)}"`);
    return `<li ${attrs.join(' ')}>${content}</li>`;
  };

  const items = [];
  items.push(item(link(`<span class="ds-pagination__icon" aria-hidden="true">${renderIcon('chevron_left')}</span><span>Previous</span>`, previous), null, 'previous'));
  pages.forEach((entry, i) => {
    const { label: text = String(i + 1), href = null, current = false, state: itemState = null } = entry;
    const content = current
      ? `<span class="ds-pagination__link" data-part="link" aria-current="page">${escapeHtml(text)}</span>`
      : link(escapeHtml(text), href ?? '#');
    items.push(item(content, itemState));
  });
  items.push(item(link(`<span>Next</span><span class="ds-pagination__icon" aria-hidden="true">${renderIcon('chevron_right')}</span>`, next), null, 'next'));
  return `<nav ${rootAttrs.join(' ')}><ul class="ds-pagination__list" data-part="list">${items.join('')}</ul></nav>`;
}
