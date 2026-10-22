/**
 * Progress bar — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/progress-bar.spec.json) -> HTML string.
 * A native progress element named by its label: the browser exposes the progressbar role and the
 * value; without a value the bar is indeterminate.
 *
 * Extra props: `id` names the progress element (unique in the page; without it instances are
 * numbered in render order).
 * Extra sandbox-only prop: `state` forces a visual state through data-state on the root.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'progress-bar', selector: '.ds-progress-bar' };

let count = 0;

export function render(props = {}) {
  const { label = 'Progress', value = undefined, max = 100, showValue = false, size = 'medium', state = null, id = null } = props;
  const progressId = id ?? `ds-progress-bar-${++count}`;
  const maximum = Number(max) > 0 ? Number(max) : 100;
  const determinate = value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value));
  const current = determinate ? Math.min(maximum, Math.max(0, Number(value))) : null;
  const rootAttrs = ['class="ds-progress-bar"', `data-size="${escapeAttr(size)}"`];
  if (state && state !== 'default') rootAttrs.push(`data-state="${escapeAttr(state)}"`);
  const trackAttrs = ['class="ds-progress-bar__track"', 'data-part="track"', `id="${escapeAttr(progressId)}"`, `max="${escapeAttr(maximum)}"`];
  if (determinate) trackAttrs.push(`value="${escapeAttr(current)}"`);
  const percent = determinate ? `${Math.round((current / maximum) * 100)}%` : null;
  const header = [`<label class="ds-progress-bar__label" data-part="label" for="${escapeAttr(progressId)}">${escapeHtml(label)}</label>`];
  if (showValue && determinate) header.push(`<span class="ds-progress-bar__value" data-part="value">${escapeHtml(percent)}</span>`);
  return `<div ${rootAttrs.join(' ')}><div class="ds-progress-bar__header">${header.join('')}</div><progress ${trackAttrs.join(' ')}>${determinate ? escapeHtml(percent) : ''}</progress></div>`;
}
