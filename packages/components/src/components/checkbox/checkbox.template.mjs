/**
 * Checkbox — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/checkbox.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: the native
 * checkbox holds the state, the label activates it, the browser announces it; with a severity, the
 * message says the error in text, after the description.
 *
 * Extra props: `id` names the input (the label points at it; unique in the page; without it
 * instances are numbered in render order); `name` and `value` are the form field's; `attrs` adds
 * HTML attributes to the input (so the docs site can wire its own forms).
 * `severityIconLabel` names the severity icon (default "Error"), for another language.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

/** The glyph of each severity's icon and its default name, the Text field's (decision severity-icon). */
const SEVERITY_GLYPHS = { error: 'error', warning: 'warning', success: 'check_circle' };
const SEVERITY_LABELS = { error: 'Error', warning: 'Warning', success: 'Success' };

export const meta = { id: 'checkbox', selector: '.ds-checkbox' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    description = null,
    message = null,
    size = 'medium',
    checked = false,
    disabled = false,
    severity = 'none',
    severityIcon = 'message',
    severityIconLabel = null,
    required = false,
    state = null,
    id = null,
    name = null,
    value = null,
    attrs: extra = {},
  } = props;

  const hasMessage = severity !== 'none' && Boolean(message);
  // A choice control draws its icon at the start of the message only: after-control falls back to it (Forms forms-severity-icon-placement).
  const iconPlace = SEVERITY_GLYPHS[severity] && severityIcon !== 'none' && hasMessage ? 'message' : null;

  const inputId = id ?? `ds-checkbox-${++count}`;
  const descriptionId = `${inputId}-description`;
  const messageId = `${inputId}-message`;
  const rootAttrs = ['class="ds-checkbox"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (severity && severity !== 'none') rootAttrs.push(`data-severity="${escapeAttr(severity)}"`);
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);

  const inputAttrs = ['type="checkbox"', 'class="ds-checkbox__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (value != null) inputAttrs.push(`value="${escapeAttr(value)}"`);
  if (checked) inputAttrs.push('checked');
  if (disabled) inputAttrs.push('disabled');
  if (required) inputAttrs.push('required');
  if (severity === 'error') inputAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, hasMessage ? messageId : null].filter(Boolean);
  if (describedBy.length) inputAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const parts = [
    `<input ${inputAttrs.join(' ')}>`,
    `<label class="ds-checkbox__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`,
  ];
  if (description) parts.push(`<p class="ds-checkbox__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  const icon = iconPlace ? `<span class="ds-checkbox__severity-icon" data-part="severity-icon" data-place="message" role="img" aria-label="${escapeAttr(severityIconLabel ?? SEVERITY_LABELS[severity])}">${renderIcon(SEVERITY_GLYPHS[severity])}</span>` : '';
  if (hasMessage) parts.push(`<p class="ds-checkbox__message" data-part="message" id="${escapeAttr(messageId)}">${icon}${escapeHtml(message)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
