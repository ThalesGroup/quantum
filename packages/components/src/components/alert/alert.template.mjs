/**
 * Alert — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/alert.spec.json) -> HTML string.
 * A div with role="alert": an assertive live region, announced when it is added to the page. The
 * icon names the intent visually and is hidden from assistive technology; the title and message
 * carry the meaning.
 */
import { escapeHtml, escapeAttr, renderIcon } from '../../lib/template-utils.mjs';

export const meta = { id: 'alert', selector: '.ds-alert' };

/** Icon of each intent: a Material Symbols ligature name. */
export const INTENT_ICONS = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };

export function render(props = {}) {
  const { intent = 'info', title = null, message = 'Message', state = null } = props;
  const attrs = ['class="ds-alert"', 'role="alert"', `data-intent="${escapeAttr(intent)}"`];
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  const content = [];
  if (title) content.push(`<p class="ds-alert__title" data-part="title">${escapeHtml(title)}</p>`);
  content.push(`<p class="ds-alert__message" data-part="message">${escapeHtml(message)}</p>`);
  return `<div ${attrs.join(' ')}><span class="ds-alert__icon" data-part="icon" aria-hidden="true">${renderIcon(INTENT_ICONS[intent] ?? INTENT_ICONS.info)}</span><div class="ds-alert__content" data-part="content">${content.join('')}</div></div>`;
}
