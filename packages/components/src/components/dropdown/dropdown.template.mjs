/**
 * Dropdown — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/dropdown.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script needed:
 * the trigger opens the menu with the native popover API (popovertarget), and every item closes
 * it (popovertargetaction="hide"); the browser handles Escape, outside clicks and focus.
 *
 * The trigger is the Button component, rendered by its own template, with a chevron as its
 * trailing icon. Items are native buttons, or links when they have an href.
 *
 * Extra props: `id` names the menu (popovertarget needs one, unique in the page; the trigger
 * gets `<id>-trigger`, which names the menu); without it instances are numbered in render order.
 * Extra sandbox-only props: `state` forces a state of the trigger (data-state on the Button;
 * `expanded` shows the menu, data-state on the root), and an entry's `state` forces a state of
 * that item.
 */
import { escapeHtml, escapeAttr, renderIcon, ICONS } from '../../lib/template-utils.mjs';
import { render as renderButton } from '../button/button.template.mjs';

export const meta = {
  id: 'dropdown',
  selector: '.ds-dropdown',
  icons: ICONS,
};

let count = 0;

function renderItem(entry, menuId) {
  const { label = 'Item', icon = null, intent = 'neutral', disabled = false, href = null, state = null } = entry;
  const attrs = ['class="ds-dropdown__item"', 'data-part="item"', `data-intent="${escapeAttr(intent)}"`];
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  const content = [
    icon ? `<span class="ds-dropdown__item-icon" data-part="item-icon" aria-hidden="true">${renderIcon(icon)}</span>` : '',
    `<span class="ds-dropdown__item-label" data-part="item-label">${escapeHtml(label)}</span>`,
  ].join('');
  if (href) {
    // A disabled link has no href (not focusable, not followed) and says it is disabled.
    const link = disabled ? 'role="link" aria-disabled="true"' : `href="${escapeAttr(href)}"`;
    return `<a ${attrs.join(' ')} ${link}>${content}</a>`;
  }
  attrs.unshift('type="button"');
  attrs.push(`popovertarget="${escapeAttr(menuId)}"`, 'popovertargetaction="hide"');
  if (disabled) attrs.push('disabled');
  return `<button ${attrs.join(' ')}>${content}</button>`;
}

export function render(props = {}) {
  const {
    label = 'Actions',
    emphasis = 'accent',
    intent = 'neutral',
    size = 'medium',
    iconStart = null,
    disabled = false,
    items = [{ label: 'Item' }],
    state = null,
    id = null,
  } = props;

  const menuId = id ?? `ds-dropdown-${++count}`;
  const expanded = state === 'expanded';
  const trigger = renderButton({
    emphasis,
    intent,
    size,
    label,
    iconStart,
    iconEnd: 'expand_more',
    disabled,
    state: expanded ? null : state,
    attrs: { class: 'ds-dropdown__trigger', 'data-part': 'trigger', id: `${menuId}-trigger`, popovertarget: menuId },
  });

  // Entries between separators form one group (a list); empty groups are dropped.
  const groups = [[]];
  for (const entry of items) {
    if (entry.part === 'separator') groups.push([]);
    else groups.at(-1).push(entry);
  }
  const menu = groups
    .filter((g) => g.length)
    .map((g) => `<ul class="ds-dropdown__group" data-part="group">${g.map((e) => `<li>${renderItem(e, menuId)}</li>`).join('')}</ul>`)
    .join('<hr class="ds-dropdown__separator" data-part="separator">');

  const rootAttrs = ['class="ds-dropdown"'];
  if (expanded) rootAttrs.push('data-state="expanded"');
  return `<div ${rootAttrs.join(' ')}>${trigger}<div class="ds-dropdown__menu" data-part="menu" id="${escapeAttr(menuId)}" popover aria-labelledby="${escapeAttr(menuId)}-trigger">${menu}</div></div>`;
}
