/**
 * Text field — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/text-field.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native text
 * input named by its label, described by its description and, with a severity, by its message.
 *
 * Extra props: `id` names the input (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the input (autocomplete,
 * inputmode, maxlength…).
 * `severityIconLabel` names the severity icon (default "Error", "Warning" or "Success"), for another language.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

/** The glyph of each severity's icon and its default name (the name says the severity; pass severityIconLabel to translate it). */
const SEVERITY_GLYPHS = { error: 'error', warning: 'warning', success: 'check_circle' };
const SEVERITY_LABELS = { error: 'Error', warning: 'Warning', success: 'Success' };

export const meta = { id: 'text-field', selector: '.ds-text-field' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    value = '',
    placeholder = null,
    iconStart = null,
    description = null,
    message = null,
    size = 'medium',
    required = false,
    disabled = false,
    readonly = false,
    severity = 'none',
    severityIcon = 'message',
    severityIconLabel = null,
    state = null,
    id = null,
    name = null,
    attrs: extra = {},
  } = props;
  const hasMessage = severity !== 'none' && Boolean(message);
  // The severity icon: the Alert's glyph of the severity (decision severity-icon-glyphs).
  const glyph = SEVERITY_GLYPHS[severity] ?? null;
  const iconPlace = glyph ? (severityIcon === 'after-control' ? 'after-control' : severityIcon === 'message' && hasMessage ? 'message' : null) : null;

  const inputId = id ?? `ds-text-field-${++count}`;
  const descriptionId = `${inputId}-description`;
  const messageId = `${inputId}-message`;
  const iconId = `${inputId}-severity-icon`;
  const rootAttrs = ['class="ds-text-field"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (readonly) rootAttrs.push('data-readonly');
  if (severity && severity !== 'none') rootAttrs.push(`data-severity="${escapeAttr(severity)}"`);
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  if (iconPlace === 'after-control') rootAttrs.push('data-severity-icon="after-control"');

  const inputAttrs = ['type="text"', 'class="ds-text-field__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (value !== '' && value != null) inputAttrs.push(`value="${escapeAttr(value)}"`);
  // With a leading icon, always a placeholder attribute (empty when there is none): the icon's color reads
  // :placeholder-shown to tell an empty field (decision leading-icon-color).
  if (placeholder || iconStart) inputAttrs.push(`placeholder="${escapeAttr(placeholder ?? '')}"`);
  if (required) inputAttrs.push('required');
  if (disabled) inputAttrs.push('disabled');
  if (readonly) inputAttrs.push('readonly');
  if (severity === 'error') inputAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, iconPlace === 'after-control' ? iconId : null, hasMessage ? messageId : null].filter(Boolean);
  if (describedBy.length) inputAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const iconLabel = severityIconLabel ?? SEVERITY_LABELS[severity];
  const icon = (where) => `<span class="ds-text-field__severity-icon" data-part="severity-icon" data-place="${where}"${where === 'after-control' ? ` id="${escapeAttr(iconId)}"` : ''} role="img" aria-label="${escapeAttr(iconLabel)}">${renderIcon(glyph)}</span>`;
  const parts = [
    `<label class="ds-text-field__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`,
    // The leading icon is decorative: hidden from assistive technology, never the name (decision leading-icon-decorative).
    `${iconStart ? `<div class="ds-text-field__field" data-part="field"><span class="ds-text-field__icon" data-part="icon" aria-hidden="true">${renderIcon(iconStart)}</span><input ${inputAttrs.join(' ')}></div>` : `<input ${inputAttrs.join(' ')}>`}${iconPlace === 'after-control' ? icon('after-control') : ''}`,
  ];
  if (description) parts.push(`<p class="ds-text-field__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (hasMessage) parts.push(`<p class="ds-text-field__message" data-part="message" id="${escapeAttr(messageId)}">${iconPlace === 'message' ? icon('message') : ''}${escapeHtml(message)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
