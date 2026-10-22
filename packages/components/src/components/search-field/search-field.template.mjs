/**
 * Search field — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/search-field.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native search
 * input named by its label and described by its description; the browser provides the clear control.
 *
 * Extra props: `id` names the input (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the input (autocomplete,
 * inputmode, maxlength…).
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

export const meta = { id: 'search-field', selector: '.ds-search-field' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    value = '',
    placeholder = null,
    description = null,
    size = 'medium',
    required = false,
    disabled = false,
    state = null,
    id = null,
    name = null,
    attrs: extra = {},
  } = props;

  const inputId = id ?? `ds-search-field-${++count}`;
  const descriptionId = `${inputId}-description`;
  const rootAttrs = ['class="ds-search-field"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const inputAttrs = ['type="search"', 'class="ds-search-field__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (value !== '' && value != null) inputAttrs.push(`value="${escapeAttr(value)}"`);
  if (placeholder) inputAttrs.push(`placeholder="${escapeAttr(placeholder)}"`);
  if (required) inputAttrs.push('required');
  if (disabled) inputAttrs.push('disabled');
  const describedBy = [description ? descriptionId : null].filter(Boolean);
  if (describedBy.length) inputAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const parts = [
    `<label class="ds-search-field__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`,
    `<div class="ds-search-field__field" data-part="field"><span class="ds-search-field__icon" data-part="icon" aria-hidden="true">${renderIcon('search')}</span><input ${inputAttrs.join(' ')}></div>`,
  ];
  if (description) parts.push(`<p class="ds-search-field__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
