/**
 * Checkbox — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/checkbox.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: the native
 * checkbox holds the state, the label activates it, the browser announces it.
 *
 * Extra props: `id` names the input (the label points at it; unique in the page; without it
 * instances are numbered in render order); `name` and `value` are the form field's; `attrs` adds
 * HTML attributes to the input (so the docs site can wire its own forms).
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'checkbox', selector: '.ds-checkbox' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    description = null,
    size = 'medium',
    checked = false,
    disabled = false,
    invalid = false,
    required = false,
    state = null,
    id = null,
    name = null,
    value = null,
    attrs: extra = {},
  } = props;

  const inputId = id ?? `ds-checkbox-${++count}`;
  const descriptionId = `${inputId}-description`;
  const rootAttrs = ['class="ds-checkbox"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (invalid) rootAttrs.push('data-invalid');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const inputAttrs = ['type="checkbox"', 'class="ds-checkbox__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (value != null) inputAttrs.push(`value="${escapeAttr(value)}"`);
  if (checked) inputAttrs.push('checked');
  if (disabled) inputAttrs.push('disabled');
  if (required) inputAttrs.push('required');
  if (invalid) inputAttrs.push('aria-invalid="true"');
  if (description) inputAttrs.push(`aria-describedby="${escapeAttr(descriptionId)}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const parts = [
    `<input ${inputAttrs.join(' ')}>`,
    `<label class="ds-checkbox__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`,
  ];
  if (description) parts.push(`<p class="ds-checkbox__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
