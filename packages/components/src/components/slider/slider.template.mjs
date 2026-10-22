/**
 * Slider — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/slider.spec.json) -> HTML string.
 * A native range input named by its label: the browser exposes the slider role, the value, its
 * bounds and the keyboard interaction (arrow keys, Home, End). The value, when shown, is an
 * output element bound to the input; without script it shows the initial value.
 *
 * Extra props: `id` names the input (unique in the page; without it instances are numbered in
 * render order); `name` is the form field's; `attrs` adds attributes to the input (aria-valuetext…).
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'slider', selector: '.ds-slider' };

let count = 0;

export function render(props = {}) {
  const { label = 'Value', value = 50, min = 0, max = 100, step = 1, showValue = false, size = 'medium', disabled = false, state = null, id = null, name = null, attrs: extra = {} } = props;
  const inputId = id ?? `ds-slider-${++count}`;
  const rootAttrs = ['class="ds-slider"', `data-size="${escapeAttr(size)}"`];
  if (disabled) rootAttrs.push('data-disabled');
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  const inputAttrs = ['type="range"', 'class="ds-slider__control"', 'data-part="control"', `id="${escapeAttr(inputId)}"`, `min="${escapeAttr(min)}"`, `max="${escapeAttr(max)}"`, `step="${escapeAttr(step)}"`, `value="${escapeAttr(value)}"`];
  if (name) inputAttrs.push(`name="${escapeAttr(name)}"`);
  if (disabled) inputAttrs.push('disabled');
  for (const [k, v] of Object.entries(extra)) {
    if (v === false || v == null) continue;
    inputAttrs.push(v === true ? escapeAttr(k) : `${escapeAttr(k)}="${escapeAttr(v)}"`);
  }
  const header = [`<label class="ds-slider__label" data-part="label" for="${escapeAttr(inputId)}">${escapeHtml(label)}</label>`];
  if (showValue) header.push(`<output class="ds-slider__value" data-part="value" for="${escapeAttr(inputId)}">${escapeHtml(value)}</output>`);
  return `<div ${rootAttrs.join(' ')}><div class="ds-slider__header">${header.join('')}</div><input ${inputAttrs.join(' ')}></div>`;
}
