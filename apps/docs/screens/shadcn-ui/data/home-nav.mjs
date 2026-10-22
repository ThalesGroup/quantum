/**
 * Sample header row and section navigation of the shadcn/ui sidebars sidebar-03 to sidebar-06,
 * sidebar-08 and sidebar-09, as in the original. Native HTML laid out by screens/screens.css
 * (no Navigation or Link component yet).
 */
import { ds, el, text } from '../../lib/ds.mjs';
import { navList } from '../../lib/shell.mjs';

/**
 * The header row that links home: an icon tile, a title and a subtitle (the original's large
 * sidebar menu button). Same layout as the shell's identity row, as a link.
 */
export function home({ icon = 'view_agenda', title = 'Documentation', subtitle = 'v1.0.0', href = '#' } = {}) {
  return el('a', { class: 'scr-identity scr-home', href },
    el('span', { class: 'scr-tile-mark' }, ds.icon({ name: icon, size: 'small' })),
    el('span', { class: 'scr-identity__text' }, el('span', { class: 'scr-identity__title' }, text(title)), el('span', { class: 'scr-identity__subtitle' }, text(subtitle))),
  );
}

/**
 * Sections whose sub-items are always visible: each section title is a link in medium weight,
 * its items a sub-list below it. `flat`: the sub-lists are not indented and have no rule
 * (sidebar-04), and the sections are further apart.
 */
export function sections(groups, { flat = false } = {}) {
  return el('div', { class: 'scr-nav-group', 'data-sub': flat ? 'flat' : null },
    el('ul', { class: 'scr-nav' }, groups.map((g) => el('li', { class: 'scr-nav__item' },
      el('a', { class: 'scr-nav__link', href: g.href ?? '#' }, el('span', { class: 'scr-nav__label scr-strong' }, text(g.label))),
      g.items?.length ? navList(g.items, { sub: true }) : null,
    ))),
  );
}
