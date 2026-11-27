/**
 * Textarea — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/textarea.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native
 * textarea named by its label, described by its description and, with a severity, by its message.
 *
 * Extra props: `id` names the control (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the control.
 * `severityIconLabel` names the severity icon (default "Error", "Warning" or "Success"), for another language.
 * `markLabel` replaces the words of the required mark ("(optional)" or "(required)"), for another language.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

/** The glyph of each severity's icon and its default name (the name says the severity; pass severityIconLabel to translate it). */
const SEVERITY_GLYPHS = { error: 'error', warning: 'warning', success: 'check_circle' };
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
    labelPlacement = 'above',
    markedFields = 'optional',
    markLabel = null,
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

  // The required mark the form asks for (decision marked-fields): "(optional)" on a field that is not required,
  // "(required)" on a required one, hidden from assistive technology since the required attribute says it (mark-part).
  // A read-only field is never required: required has no effect with readonly (MDN), so neither the attribute nor a mark.
  const isRequired = required && !readonly;
  const mark = readonly && required ? null : markedFields === 'optional' && !required ? 'optional' : markedFields === 'required' && required ? 'required' : null;

  const controlId = id ?? `ds-textarea-${++count}`;
  const descriptionId = `${controlId}-description`;
  const messageId = `${controlId}-message`;
  const iconId = `${controlId}-severity-icon`;
  const rootAttrs = ['class="ds-textarea"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (readonly) rootAttrs.push('data-readonly');
  if (severity && severity !== 'none') rootAttrs.push(`data-severity="${escapeAttr(severity)}"`);
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  // The form's label column (decision label-placement): the field carries its row of the form's grid.
  if (labelPlacement === 'start') rootAttrs.push('data-label-placement=\"start\"');
  if (iconPlace === 'after-control') rootAttrs.push('data-severity-icon="after-control"');

  const controlAttrs = ['class="ds-textarea__control"', 'data-part="control"', `id="${escapeAttr(controlId)}"`, `rows="${escapeAttr(Math.max(1, Number(rows) || 3))}"`];
  if (name) controlAttrs.push(`name="${escapeAttr(name)}"`);
  if (placeholder) controlAttrs.push(`placeholder="${escapeAttr(placeholder)}"`);
  if (isRequired) controlAttrs.push('required');
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
    `<label class="ds-textarea__label" data-part="label" for="${escapeAttr(controlId)}">${escapeHtml(label)}${mark ? ` <span class="ds-textarea__mark" data-part="mark"${mark === 'required' ? ' aria-hidden="true"' : ''}>${escapeHtml(markLabel ?? `(${mark})`)}</span>` : ''}</label>`,
    `<textarea ${controlAttrs.join(' ')}>${escapeHtml(value ?? '')}</textarea>${iconPlace === 'after-control' ? icon('after-control') : ''}`,
  ];
  if (description) parts.push(`<p class="ds-textarea__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (hasMessage) parts.push(`<p class="ds-textarea__message" data-part="message" id="${escapeAttr(messageId)}">${iconPlace === 'message' ? icon('message') : ''}${escapeHtml(message)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
