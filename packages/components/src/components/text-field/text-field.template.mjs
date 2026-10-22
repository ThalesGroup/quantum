/**
 * Text field — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/text-field.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native text
 * input named by its label, described by its description and, when invalid, by its error message.
 *
 * Extra props: `id` names the input (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the input (autocomplete,
 * inputmode, maxlength…).
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'text-field', selector: '.ds-text-field' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    value = '',
    placeholder = null,
    description = null,
    errorMessage = null,
    size = 'medium',
    required = false,
    disabled = false,
    readonly = false,
    invalid = false,
    state = null,
    id = null,
    name = null,
    attrs: extra = {},
  } = props;

  const inputId = id ?? `ds-text-field-${++count}`;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const rootAttrs = ['class="ds-text-field"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (readonly) rootAttrs.push('data-readonly');
  if (invalid) rootAttrs.push('data-invalid');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const inputAttrs = ['type="text"', 'class="ds-text-field__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (value !== '' && value != null) inputAttrs.push(`value="${escapeAttr(value)}"`);
  if (placeholder) inputAttrs.push(`placeholder="${escapeAttr(placeholder)}"`);
  if (required) inputAttrs.push('required');
  if (disabled) inputAttrs.push('disabled');
  if (readonly) inputAttrs.push('readonly');
  if (invalid) inputAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, invalid && errorMessage ? errorId : null].filter(Boolean);
  if (describedBy.length) inputAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const parts = [
    `<label class="ds-text-field__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`,
    `<input ${inputAttrs.join(' ')}>`,
  ];
  if (description) parts.push(`<p class="ds-text-field__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (invalid && errorMessage) parts.push(`<p class="ds-text-field__error-message" data-part="error-message" id="${escapeAttr(errorId)}">${escapeHtml(errorMessage)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
