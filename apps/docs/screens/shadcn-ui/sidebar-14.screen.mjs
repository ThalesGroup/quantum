import { el, screen, text } from '../lib/ds.mjs';
import { shell, sidebar, navList, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { DOCS_NAV } from './data/docs-nav.mjs';

/** shadcn/ui block sidebar-14: A sidebar on the right. */
export const meta = {
  block: 'sidebar-14',
  name: 'Sidebar on the right',
  section: 'application-shell',
  description: 'A sidebar on the right.',
  changes: [
    'The sidebar does not collapse (that needs script, and so does the trigger button): it is always expanded on wide screens and stacks below the content on narrow ones. The sidebar trigger at the end of the header is dropped.',
    CHANGES.rail,
  ],
  gaps: [GAPS.collapse, GAPS.navigation],
};

/** The table of contents: every section is a link, its pages are always listed below it. */
function toc(id) {
  return el('div', { class: 'scr-nav-group', role: 'group', 'aria-labelledby': `${id}-label` },
    el('p', { class: 'scr-nav-group__label', id: `${id}-label` }, 'Table of Contents'),
    el('ul', { class: 'scr-nav' }, DOCS_NAV.map((section) => el('li', { class: 'scr-nav__item' },
      el('a', { class: 'scr-nav__link', href: '#' }, el('span', { class: 'scr-nav__label scr-strong' }, text(section.label))),
      navList(section.items, { sub: true }),
    ))),
  );
}

export function render() {
  return screen({},
    // The sidebar comes after the content, in the page order and on screen.
    shell({
      side: 'right',
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
      aside: sidebar({ label: 'Table of Contents', content: toc('sidebar-14-toc') }),
    }),
  );
}
