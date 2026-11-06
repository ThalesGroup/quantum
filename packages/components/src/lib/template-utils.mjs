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

/**
 * The glyphs that flip in a right-to-left layout: the names of the Iconography rule direction
 * (packages/components/specs/foundations/iconography.spec.json), which pnpm validate keeps in step.
 */
export const DIRECTIONAL_ICONS = [
  'arrow_back',
  'arrow_back_ios',
  'arrow_back_ios_new',
  'arrow_forward',
  'arrow_forward_ios',
  'arrow_left',
  'arrow_right',
  'chevron_left',
  'chevron_right',
  'exit_to_app',
  'first_page',
  'format_indent_decrease',
  'format_indent_increase',
  'format_list_bulleted',
  'forward',
  'keyboard_arrow_left',
  'keyboard_arrow_right',
  'keyboard_double_arrow_left',
  'keyboard_double_arrow_right',
  'last_page',
  'list',
  'login',
  'logout',
  'navigate_before',
  'navigate_next',
  'notes',
  'redo',
  'reply',
  'reply_all',
  'send',
  'short_text',
  'sort',
  'subject',
  'toc',
  'undo',
  'volume_down',
  'volume_mute',
  'volume_off',
  'volume_up',
  'wrap_text',
];

/** Attribute of the icon part marking a directional glyph, which its CSS flips under :dir(rtl); empty otherwise. */
export function iconDirection(name) {
  return DIRECTIONAL_ICONS.includes(name) ? ' data-directional' : '';
}
