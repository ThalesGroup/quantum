/**
 * Number field — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/number-field.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native number
 * input named by its label, described by its description and, with a severity, by its message.
 *
 * Extra props: `id` names the input (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the input (autocomplete,
 * inputmode, maxlength…).
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'number-field', selector: '.ds-number-field' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    value = '',
    min = null,
    max = null,
    step = null,
    placeholder = null,
    description = null,
    message = null,
    size = 'medium',
    required = false,
    disabled = false,
    readonly = false,
    severity = 'none',
    state = null,
    id = null,
    name = null,
    attrs: extra = {},
  } = props;
  const hasMessage = severity !== 'none' && Boolean(message);

  const inputId = id ?? `ds-number-field-${++count}`;
  const descriptionId = `${inputId}-description`;
  const messageId = `${inputId}-message`;
  const rootAttrs = ['class="ds-number-field"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (readonly) rootAttrs.push('data-readonly');
  if (severity && severity !== 'none') rootAttrs.push(`data-severity="${escapeAttr(severity)}"`);
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const inputAttrs = ['type="number"', 'class="ds-number-field__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (value !== '' && value != null) inputAttrs.push(`value="${escapeAttr(value)}"`);
  if (placeholder) inputAttrs.push(`placeholder="${escapeAttr(placeholder)}"`);
  if (min != null && min !== '') inputAttrs.push(`min="${escapeAttr(min)}"`);
  if (max != null && max !== '') inputAttrs.push(`max="${escapeAttr(max)}"`);
  if (step != null && step !== '') inputAttrs.push(`step="${escapeAttr(step)}"`);
  if (required) inputAttrs.push('required');
  if (disabled) inputAttrs.push('disabled');
  if (readonly) inputAttrs.push('readonly');
  if (severity === 'error') inputAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, hasMessage ? messageId : null].filter(Boolean);
  if (describedBy.length) inputAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const parts = [
    `<label class="ds-number-field__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`,
    `<input ${inputAttrs.join(' ')}>`,
  ];
  if (description) parts.push(`<p class="ds-number-field__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (hasMessage) parts.push(`<p class="ds-number-field__message" data-part="message" id="${escapeAttr(messageId)}">${escapeHtml(message)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
