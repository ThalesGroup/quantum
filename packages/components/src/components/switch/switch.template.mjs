/**
 * Switch — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/switch.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native
 * checkbox with role="switch" holds the on/off state (ARIA in HTML allows the role on it), the label
 * activates it, the browser announces it as a switch.
 *
 * Extra props: `id` names the input (unique in the page; without it instances are numbered in
 * render order); `name` and `value` are the form field's; `attrs` adds HTML attributes to the input.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'switch', selector: '.ds-switch' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    description = null,
    size = 'medium',
    checked = false,
    disabled = false,
    state = null,
    id = null,
    name = null,
    value = null,
    attrs: extra = {},
  } = props;

  const inputId = id ?? `ds-switch-${++count}`;
  const descriptionId = `${inputId}-description`;
  const rootAttrs = ['class="ds-switch"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const inputAttrs = ['type="checkbox"', 'role="switch"', 'class="ds-switch__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (value != null) inputAttrs.push(`value="${escapeAttr(value)}"`);
  if (checked) inputAttrs.push('checked');
  if (disabled) inputAttrs.push('disabled');
  if (description) inputAttrs.push(`aria-describedby="${escapeAttr(descriptionId)}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const parts = [
    `<input ${inputAttrs.join(' ')}>`,
    `<label class="ds-switch__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`,
  ];
  if (description) parts.push(`<p class="ds-switch__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
