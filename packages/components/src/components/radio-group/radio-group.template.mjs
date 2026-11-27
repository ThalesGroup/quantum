/**
 * Radio group — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/radio-group.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: native radio
 * buttons sharing one name form the group, the fieldset's legend names it, the browser moves the
 * check with the arrow keys.
 *
 * Extra props: `id` names the group (option ids derive from it; unique in the page; without it
 * instances are numbered in render order); `attrs` adds HTML attributes to every radio.
 * `markLabel` replaces the words of the required mark ("(optional)" or "(required)"), for another language.
 * `severityIconLabel` names the severity icon (default "Error"), for another language.
 * Extra sandbox-only props: `state` forces a visual state through data-state on the root (every
 * option); an entry's `state` forces it on that option only.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

/** The glyph of each severity's icon and its default name, the Text field's (decision severity-icon). */
const SEVERITY_GLYPHS = { error: 'error', warning: 'warning', success: 'check_circle' };
const SEVERITY_LABELS = { error: 'Error', warning: 'Warning', success: 'Success' };

export const meta = { id: 'radio-group', selector: '.ds-radio-group' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Options',
    description = null,
    message = null,
    name = null,
    orientation = 'vertical',
    size = 'medium',
    options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
    required = false,
    markedFields = 'optional',
    markLabel = null,
    disabled = false,
    severity = 'none',
    severityIcon = 'message',
    severityIconLabel = null,
    state = null,
    id = null,
    attrs: extra = {},
  } = props;
  const hasMessage = severity !== 'none' && Boolean(message);
  // The required mark the form asks for (decision mark-part): "(optional)" on a group that is not required, "(required)" on a
  // required one, hidden from assistive technology since the required state says it.
  const mark = markedFields === 'optional' && !required ? 'optional' : markedFields === 'required' && required ? 'required' : null;
  const markHtml = mark ? ` <span class="ds-radio-group__mark" data-part="mark"${mark === 'required' ? ' aria-hidden="true"' : ''}>${escapeHtml(markLabel ?? `(${mark})`)}</span>` : '';
  // A choice control draws its icon at the start of the message only: after-control falls back to it (Forms forms-severity-icon-placement).
  const iconPlace = SEVERITY_GLYPHS[severity] && severityIcon !== 'none' && hasMessage ? 'message' : null;

  const groupId = id ?? `ds-radio-group-${++count}`;
  const groupName = name ?? groupId;
  const descriptionId = `${groupId}-description`;
  const messageId = `${groupId}-message`;
  const describedBy = [description ? descriptionId : null, hasMessage ? messageId : null].filter(Boolean).join(' ');

  const rootAttrs = ['class="ds-radio-group"', `data-orientation="${escapeAttr(orientation)}"`, `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled', 'disabled');
  if (severity && severity !== 'none') rootAttrs.push(`data-severity="${escapeAttr(severity)}"`);
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const items = options.map((entry, i) => {
    const { label: optionLabel = `Option ${i + 1}`, value = String(i + 1), description: optionDescription = null, checked = false, disabled: optionDisabled = false, state: optionState = null } = entry;
    const optionId = `${groupId}-${i + 1}`;
    const optionDescriptionId = `${optionId}-description`;
    const optionAttrs = ['class="ds-radio-group__option"', 'data-part="option"'];
    if (optionState && optionState !== 'default') optionAttrs.push(`data-state="${escapeAttr(optionState)}"`);
    const inputAttrs = ['type="radio"', 'class="ds-radio-group__control"', 'data-part="control"', `id="${escapeAttr(optionId)}"`, `name="${escapeAttr(groupName)}"`, `value="${escapeAttr(value)}"`];
    if (checked) inputAttrs.push('checked');
    if (optionDisabled) inputAttrs.push('disabled');
    if (required) inputAttrs.push('required');
    if (severity === 'error') inputAttrs.push('aria-invalid="true"');
    const ownDescribedBy = [optionDescription ? optionDescriptionId : null, describedBy || null].filter(Boolean).join(' ');
    if (ownDescribedBy) inputAttrs.push(`aria-describedby="${escapeAttr(ownDescribedBy)}"`);
    for (const [k, v] of Object.entries(extra)) {
      if (v === false || v == null) continue;
      inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
    }
    const parts = [
      `<input ${inputAttrs.join(' ')}>`,
      `<label class="ds-radio-group__option-label" data-part="option-label" for="${escapeAttr(optionId)}">${escapeHtml(optionLabel)}</label>`,
    ];
    if (optionDescription) parts.push(`<p class="ds-radio-group__option-description" data-part="option-description" id="${escapeAttr(optionDescriptionId)}">${escapeHtml(optionDescription)}</p>`);
    return `<li><div ${optionAttrs.join(' ')}>${parts.join('')}</div></li>`;
  });

  const parts = [`<legend class="ds-radio-group__legend" data-part="legend">${escapeHtml(label)}${markHtml}</legend>`];
  if (description) parts.push(`<p class="ds-radio-group__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  parts.push(`<ul class="ds-radio-group__options">${items.join('')}</ul>`);
  const icon = iconPlace ? `<span class="ds-radio-group__severity-icon" data-part="severity-icon" data-place="message" role="img" aria-label="${escapeAttr(severityIconLabel ?? SEVERITY_LABELS[severity])}">${renderIcon(SEVERITY_GLYPHS[severity])}</span>` : '';
  if (hasMessage) parts.push(`<p class="ds-radio-group__message" data-part="message" id="${escapeAttr(messageId)}">${icon}${escapeHtml(message)}</p>`);
  return `<fieldset ${rootAttrs.join(' ')}>${parts.join('')}</fieldset>`;
}
