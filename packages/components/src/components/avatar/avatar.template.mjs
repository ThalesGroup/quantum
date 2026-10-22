/**
 * Avatar — HTML template for the web implementation.
 * Pure function of the spec properties (packages/components/specs/components/avatar.spec.json) -> HTML string.
 * A span with role="img" named by the person (aria-label), holding either the picture (an img with
 * an empty alt: the span already carries the name) or the initials derived from the name. When the
 * name is written next to the avatar, `decorative` hides the avatar instead of repeating it.
 */
import { escapeHtml, escapeAttr } from '../../lib/template-utils.mjs';

export const meta = { id: 'avatar', selector: '.ds-avatar' };

/** Up to two initials: first letters of the first and last words of the name. */
export function initialsOf(name) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? words.at(-1)[0] ?? '' : '';
  return (first + last).toUpperCase();
}

export function render(props = {}) {
  const { name = 'Unknown', src = null, size = 'medium', shape = 'circle', decorative = false, state = null } = props;
  const attrs = ['class="ds-avatar"', `data-size="${escapeAttr(size)}"`, `data-shape="${escapeAttr(shape)}"`];
  if (decorative) attrs.push('aria-hidden="true"');
  else attrs.push('role="img"', `aria-label="${escapeAttr(name)}"`);
  if (state && state !== 'default') attrs.push(`data-state="${escapeAttr(state)}"`);
  const content = src
    ? `<img class="ds-avatar__image" data-part="image" src="${escapeAttr(src)}" alt="">`
    : `<span class="ds-avatar__initials" data-part="initials" aria-hidden="true">${escapeHtml(initialsOf(name))}</span>`;
  return `<span ${attrs.join(' ')}>${content}</span>`;
}
