/**
 * Select — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/select.spec.json) -> HTML string.
 * Used by the docs site (server and client side). No DOM, no framework, no script: a native
 * select named by its label; the browser opens and renders the list of options, with the keyboard
 * and assistive technology support of the platform.
 *
 * Extra props: `id` names the select (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds HTML attributes to the select.
 * `markLabel` replaces the words of the required mark ("(optional)" or "(required)"), for another language.
 * `severityIconLabel` names the severity icon (default "Error", "Warning" or "Success"), for another language.
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

/** The glyph of each severity's icon and its default name, the Text field's (decision severity-icon). */
const SEVERITY_GLYPHS = { error: 'error', warning: 'warning', success: 'check_circle' };
const SEVERITY_LABELS = { error: 'Error', warning: 'Warning', success: 'Success' };

export const meta = { id: 'select', selector: '.ds-select' };

let count = 0;

export function render(props = {}) {
  const {
    label = 'Label',
    options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
    placeholder = null,
    description = null,
    message = null,
    size = 'medium',
    required = false,
    labelPlacement = 'above',
    markedFields = 'optional',
    markLabel = null,
    disabled = false,
    severity = 'none',
    severityIcon = 'message',
    severityIconLabel = null,
    state = null,
    id = null,
    name = null,
    attrs: extra = {},
  } = props;
  const hasMessage = severity !== 'none' && Boolean(message);
  // The required mark the form asks for (decision mark-part): "(optional)" on a field that is not required, "(required)" on a
  // required one, hidden from assistive technology since the required state says it.
  const mark = markedFields === 'optional' && !required ? 'optional' : markedFields === 'required' && required ? 'required' : null;
  const markHtml = mark ? ` <span class="ds-select__mark" data-part="mark"${mark === 'required' ? ' aria-hidden="true"' : ''}>${escapeHtml(markLabel ?? `(${mark})`)}</span>` : '';
  const glyph = SEVERITY_GLYPHS[severity] ?? null;
  const iconPlace = glyph ? (severityIcon === 'after-control' ? 'after-control' : severityIcon === 'message' && hasMessage ? 'message' : null) : null;

  const controlId = id ?? `ds-select-${++count}`;
  const descriptionId = `${controlId}-description`;
  const messageId = `${controlId}-message`;
  const iconId = `${controlId}-severity-icon`;
  const rootAttrs = ['class="ds-select"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (severity && severity !== 'none') rootAttrs.push(`data-severity="${escapeAttr(severity)}"`);
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  // The form's label column (decision label-placement): the field carries its row of the form's grid.
  if (labelPlacement === 'start') rootAttrs.push('data-label-placement=\"start\"');
  if (iconPlace === 'after-control') rootAttrs.push('data-severity-icon="after-control"');

  const controlAttrs = ['class="ds-select__control"', 'data-part="control"', `id="${escapeAttr(controlId)}"`];
  if (name) controlAttrs.push(`name="${escapeAttr(name)}"`);
  if (required) controlAttrs.push('required');
  if (disabled) controlAttrs.push('disabled');
  if (severity === 'error') controlAttrs.push('aria-invalid="true"');
  const describedBy = [description ? descriptionId : null, iconPlace === 'after-control' ? iconId : null, hasMessage ? messageId : null].filter(Boolean);
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

  const iconLabel = severityIconLabel ?? SEVERITY_LABELS[severity];
  const icon = (where) => `<span class="ds-select__severity-icon" data-part="severity-icon" data-place="${where}"${where === 'after-control' ? ` id="${escapeAttr(iconId)}"` : ''} role="img" aria-label="${escapeAttr(iconLabel)}">${renderIcon(glyph)}</span>`;
  const parts = [
    `<label class="ds-select__label" data-part="label" for="${escapeAttr(controlId)}">${escapeHtml(label)}${markHtml}</label>`,
    `<div class="ds-select__field" data-part="field"><select ${controlAttrs.join(' ')}>${items.join('')}</select><span class="ds-select__indicator" data-part="indicator" aria-hidden="true">${renderIcon('expand_more')}</span></div>${iconPlace === 'after-control' ? icon('after-control') : ''}`,
  ];
  if (description) parts.push(`<p class="ds-select__description" data-part="description" id="${escapeAttr(descriptionId)}">${escapeHtml(description)}</p>`);
  if (hasMessage) parts.push(`<p class="ds-select__message" data-part="message" id="${escapeAttr(messageId)}">${iconPlace === 'message' ? icon('message') : ''}${escapeHtml(message)}</p>`);
  return `<div ${rootAttrs.join(' ')}>${parts.join('')}</div>`;
}
