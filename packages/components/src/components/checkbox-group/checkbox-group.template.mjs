/**
 * Checkbox group — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/checkbox-group.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: native
 * checkboxes in a fieldset whose legend names the group; each option is checked independently.
 *
 * Extra props: `id` names the group (option ids derive from it; unique in the page; without it
 * instances are numbered in render order); `attrs` adds HTML attributes to every radio.
 * Extra sandbox-only props: `state` forces a visual state through data-state on the root (every
 * option); an entry's `state` forces it on that option only.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'checkbox-group', selector: '.ds-checkbox-group' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Options',
    description = null,
    errorMessage = null,
    name = null,
    orientation = 'vertical',
    size = 'medium',
    options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
    required = false,
    disabled = false,
    invalid = false,
    state = null,
    id = null,
    attrs: extra = {},
  } = props;

  const groupId = id ?? `ds-checkbox-group-${++count}`;
  const groupName = name ?? groupId;
  // Each checkbox submits its own value under the shared name (name[] conventions belong to the consumer).
  const descriptionId = `${groupId}-description`;
  const errorId = `${groupId}-error`;
  const describedBy = [description ? descriptionId : null, invalid && errorMessage ? errorId : null].filter(Boolean).join(' ');

  const rootAttrs = ['class="ds-checkbox-group"', `data-orientation="${escapeAttr(orientation)}"`, `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled', 'disabled');
  if (invalid) rootAttrs.push('data-invalid');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const items = options.map((entry, i) => {
    const { label: optionLabel = `Option ${i + 1}`, value = String(i + 1), description: optionDescription = null, checked = false, disabled: optionDisabled = false, state: optionState = null } = entry;
    const optionId = `${groupId}-${i + 1}`;
    const optionDescriptionId = `${optionId}-description`;
    const optionAttrs = ['class="ds-checkbox-group__option"', 'data-part="option"'];
    if (optionState && optionState !== 'default') optionAttrs.push(`data-state="${escapeAttr(optionState)}"`);
    const inputAttrs = ['type="checkbox"', 'class="ds-checkbox-group__control"', 'data-part="control"', `id="${escapeAttr(optionId)}"`, `name="${escapeAttr(groupName)}"`, `value="${escapeAttr(value)}"`];
    if (checked) inputAttrs.push('checked');
    if (optionDisabled) inputAttrs.push('disabled');
    if (required && i === 0) inputAttrs.push('required');
    if (invalid) inputAttrs.push('aria-invalid="true"');
    const ownDescribedBy = [optionDescription ? optionDescriptionId : null, describedBy || null].filter(Boolean).join(' ');
    if (ownDescribedBy) inputAttrs.push(`aria-describedby="${escapeAttr(ownDescribedBy)}"`);
    for (const [k, v] of Object.entries(extra)) {
      if (v === false || v == null) continue;
      inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
    }
    const parts = [
      `<input ${inputAttrs.join(' ')}>`,
      `<label class="ds-checkbox-group__option-label" data-part="option-label" for="${escapeAttr(optionId)}">${escapeHtml(optionLabel)}</label>`,
    ];
    if (optionDescription) parts.push(`<p class="ds-checkbox-group__option-description" data-part="option-description" id="${escapeAttr(optionDescriptionId)}">${escapeHtml(optionDescription)}</p>`);
    return `<li><div ${optionAttrs.join(' ')}>${parts.join('')}</div></li>`;
  });

  const parts = [`<legend class="ds-checkbox-group__legend" data-part="legend">${escapeHtml(label)}</legend>`];
  if (description) parts.push(`<p class="ds-checkbox-group__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  parts.push(`<ul class="ds-checkbox-group__options">${items.join('')}</ul>`);
  if (invalid && errorMessage) parts.push(`<p class="ds-checkbox-group__error-message" data-part="error-message" id="${escapeAttr(errorId)}">${escapeHtml(errorMessage)}</p>`);
  return `<fieldset ${rootAttrs.join(' ')}>${parts.join('')}</fieldset>`;
}
