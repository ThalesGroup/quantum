/**
 * Textarea — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/textarea.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native
 * textarea named by its label, described by its description and, when invalid, by its error message.
 *
 * Extra props: `id` names the control (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the control.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'textarea', selector: '.ds-textarea' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    value = '',
    placeholder = null,
    description = null,
    errorMessage = null,
    rows = 3,
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

  const controlId = id ?? `ds-textarea-${++count}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const rootAttrs = ['class="ds-textarea"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (readonly) rootAttrs.push('data-readonly');
  if (invalid) rootAttrs.push('data-invalid');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const controlAttrs = ['class="ds-textarea__control"', 'data-part="control"', `id="${escapeAttr(controlId)}"`, `rows="${escapeAttr(Math.max(1, Number(rows) || 3))}"`];
  if (name) controlAttrs.push(`name="${escapeAttr(name)}"`);
  if (placeholder) controlAttrs.push(`placeholder="${escapeAttr(placeholder)}"`);
  if (required) controlAttrs.push('required');
  if (disabled) controlAttrs.push('disabled');
  if (readonly) controlAttrs.push('readonly');
  if (invalid) controlAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, invalid && errorMessage ? errorId : null].filter(Boolean);
  if (describedBy.length) controlAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    controlAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const parts = [
    `<label class="ds-textarea__label" data-part="label" for="${escapeAttr(controlId)}">${escapeHtml(label)}</label>`,
    `<textarea ${controlAttrs.join(' ')}>${escapeHtml(value ?? '')}</textarea>`,
  ];
  if (description) parts.push(`<p class="ds-textarea__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (invalid && errorMessage) parts.push(`<p class="ds-textarea__error-message" data-part="error-message" id="${escapeAttr(errorId)}">${escapeHtml(errorMessage)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
