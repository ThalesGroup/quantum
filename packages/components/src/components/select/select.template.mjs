/**
 * Select — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/select.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native
 * select named by its label; the browser opens and renders the list of options, with the keyboard
 * and assistive technology support of the platform.
 *
 * Extra props: `id` names the select (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the select.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

export const meta = { id: 'select', selector: '.ds-select' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
    placeholder = null,
    description = null,
    errorMessage = null,
    size = 'medium',
    required = false,
    disabled = false,
    invalid = false,
    state = null,
    id = null,
    name = null,
    attrs: extra = {},
  } = props;

  const controlId = id ?? `ds-select-${++count}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const rootAttrs = ['class="ds-select"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (invalid) rootAttrs.push('data-invalid');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const controlAttrs = ['class="ds-select__control"', 'data-part="control"', `id="${escapeAttr(controlId)}"`];
  if (name) controlAttrs.push(`name="${escapeAttr(name)}"`);
  if (required) controlAttrs.push('required');
  if (disabled) controlAttrs.push('disabled');
  if (invalid) controlAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, invalid && errorMessage ? errorId : null].filter(Boolean);
  if (describedBy.length) controlAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    controlAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  // The placeholder is a disabled option with an empty value, selected unless an option is.
  const anySelected = options.some((o) => o.selected);
  const items = [];
  if (placeholder) items.push(`<option class="ds-select__option" data-part="option" value="" disabled${anySelected ? '' : ' selected'}>${escapeHtml(placeholder)}</option>`);
  options.forEach((entry, i) => {
    const { label: optionLabel = `Option ${i + 1}`, value = String(i + 1), disabled: optionDisabled = false, selected = false } = entry;
    const a = ['class="ds-select__option"', 'data-part="option"', `value="${escapeAttr(value)}"`];
    if (optionDisabled) a.push('disabled');
    if (selected) a.push('selected');
    items.push(`<option ${a.join(' ')}>${escapeHtml(optionLabel)}</option>`);
  });

  const parts = [
    `<label class="ds-select__label" data-part="label" for="${escapeAttr(controlId)}">${escapeHtml(label)}</label>`,
    `<div class="ds-select__field" data-part="field"><select ${controlAttrs.join(' ')}>${items.join('')}</select><span class="ds-select__indicator" data-part="indicator" aria-hidden="true">${renderIcon('expand_more')}</span></div>`,
  ];
  if (description) parts.push(`<p class="ds-select__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (invalid && errorMessage) parts.push(`<p class="ds-select__error-message" data-part="error-message" id="${escapeAttr(errorId)}">${escapeHtml(errorMessage)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
