/**
 * Accordion — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/accordion.spec.json) -> HTML string.
 * No script: each item is a native details element whose summary is the trigger; the browser
 * toggles it, exposes its expanded state and keeps the content out of the tab order when closed.
 *
 * Extra prop: `id` names the accordion (item ids derive from it). The title is not a heading: a
 * summary is exposed as a button, whose children are presentational, so a heading inside it would
 * be lost (see the spec).
 * Extra sandbox-only props: `state` on the root forces a state on every item; an entry's `state`
 * forces it on that item. The forced expanded state also sets the item open.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

export const meta = { id: 'accordion', selector: '.ds-accordion' };

let count = 0;

export function render(props = {}) {
  const { items = [{ title: 'Section', content: 'Content' }], size = 'medium', state = null, id = null } = props;
  const rootId = id ?? `ds-accordion-${++count}`;
  const rootAttrs = ['class="ds-accordion"', `data-size="${escapeAttr(size)}"`];
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  const list = items.map((entry, i) => {
    const { title = `Section ${i + 1}`, content = '', open = false, state: itemState = null } = entry;
    const itemAttrs = ['class="ds-accordion__item"', 'data-part="item"', `id="${escapeAttr(`${rootId}-${i + 1}`)}"`];
    const expanded = open || itemState === 'expanded' || state === 'expanded';
    if (expanded) itemAttrs.push('open');
    if (itemState && itemState !== 'default') itemAttrs.push(`data-state="${escapeAttr(itemState)}"`);
    return `<details ${itemAttrs.join(' ')}><summary class="ds-accordion__trigger" data-part="trigger"><span class="ds-accordion__title" data-part="title">${escapeHtml(title)}</span><span class="ds-accordion__indicator" data-part="indicator" aria-hidden="true">${renderIcon('expand_more')}</span></summary><div class="ds-accordion__panel" data-part="panel"><p>${escapeHtml(content)}</p></div></details>`;
  });
  return `<div ${rootAttrs.join(' ')}>${list.join('')}</div>`;
}
