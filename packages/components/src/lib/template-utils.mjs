/** Shared helpers for web templates. Framework-free, runs in Node and browsers. */

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

/**
 * Icons are glyphs of the Material Symbols Outlined font (tokens: icon.*, fonts.css),
 * written as their ligature name: https://fonts.google.com/icons lists every name.
 * ICONS is the short list the playground offers; any valid name renders.
 */
export const ICONS = [
  'add',
  'arrow_back',
  'arrow_forward',
  'check',
  'close',
  'content_copy',
  'delete',
  'download',
  'edit',
  'expand_more',
  'favorite',
  'menu',
  'more_vert',
  'search',
  'settings',
  'share',
];

/** Ligature text of an icon. The caller wraps it in the icon part, hidden from assistive technology. */
export function renderIcon(name) {
  return escapeHtml(name);
}
