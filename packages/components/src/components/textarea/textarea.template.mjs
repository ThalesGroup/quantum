/**
 * Textarea — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/textarea.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native
 * textarea named by its label, described by its description and, with a severity, by its message.
 *
 * Extra props: `id` names the control (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the control.
 * `severityIconLabel` names the severity icon (default "Error"), for another language.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

/** The glyph of each severity's icon and its default name (the name says the severity; pass severityIconLabel to translate it). */
const SEVERITY_GLYPHS = { error: 'error' };
const SEVERITY_LABELS = { error: 'Error', warning: 'Warning', success: 'Success' };

export const meta = { id: 'textarea', selector: '.ds-textarea' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    value = '',
    placeholder = null,
    description = null,
    message = null,
    rows = 3,
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
  // The severity icon: only the error has one today (warning and success with #103 step 13).
  const glyph = SEVERITY_GLYPHS[severity] ?? null;
  const iconPlace = glyph ? (severityIcon === 'after-control' ? 'after-control' : severityIcon === 'message' && hasMessage ? 'message' : null) : null;

  const controlId = id ?? `ds-textarea-${++count}`;
  const descriptionId = `${controlId}-description`;
  const messageId = `${controlId}-message`;
  const iconId = `${controlId}-severity-icon`;
  const rootAttrs = ['class="ds-textarea"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (readonly) rootAttrs.push('data-readonly');
  if (severity && severity !== 'none') rootAttrs.push(`data-severity="${escapeAttr(severity)}"`);
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  if (iconPlace === 'after-control') rootAttrs.push('data-severity-icon="after-control"');

  const controlAttrs = ['class="ds-textarea__control"', 'data-part="control"', `id="${escapeAttr(controlId)}"`, `rows="${escapeAttr(Math.max(1, Number(rows) || 3))}"`];
  if (name) controlAttrs.push(`name="${escapeAttr(name)}"`);
  if (placeholder) controlAttrs.push(`placeholder="${escapeAttr(placeholder)}"`);
  if (required) controlAttrs.push('required');
  if (disabled) controlAttrs.push('disabled');
  if (readonly) controlAttrs.push('readonly');
  if (severity === 'error') controlAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, iconPlace === 'after-control' ? iconId : null, hasMessage ? messageId : null].filter(Boolean);
  if (describedBy.length) controlAttrs.push(`aria-describedby="${escapeAttr(describedBy.join(' '))}"`);
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    controlAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }

  const iconLabel = severityIconLabel ?? SEVERITY_LABELS[severity];
  const icon = (where) => `<span class="ds-textarea__severity-icon" data-part="severity-icon" data-place="${where}"${where === 'after-control' ? ` id="${escapeAttr(iconId)}"` : ''} role="img" aria-label="${escapeAttr(iconLabel)}">${renderIcon(glyph)}</span>`;
  const parts = [
    `<label class="ds-textarea__label" data-part="label" for="${escapeAttr(controlId)}">${escapeHtml(label)}</label>`,
    `<textarea ${controlAttrs.join(' ')}>${escapeHtml(value ?? '')}</textarea>${iconPlace === 'after-control' ? icon('after-control') : ''}`,
  ];
  if (description) parts.push(`<p class="ds-textarea__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (hasMessage) parts.push(`<p class="ds-textarea__message" data-part="message" id="${escapeAttr(messageId)}">${iconPlace === 'message' ? icon('message') : ''}${escapeHtml(message)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
