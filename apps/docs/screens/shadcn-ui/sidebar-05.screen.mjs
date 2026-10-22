import { screen } from '../lib/ds.mjs';
import { shell, sidebar, group, search, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { DOCS_NAV } from './data/docs-nav.mjs';
import { home } from './data/home-nav.mjs';

/** shadcn/ui block sidebar-05: A sidebar with collapsible submenus. */
export const meta = {
  block: 'sidebar-05',
  name: 'Sidebar with collapsible submenus',
  section: 'application-shell',
  description: 'A sidebar with collapsible submenus.',
  changes: [
    CHANGES.collapse,
    CHANGES.rail,
    'The plus and minus icons that show whether a submenu is open are the chevron every collapsible item of the shells has, rotated when open.',
  ],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.collapsible],
};

export function render() {
  return screen({},
    shell({
      sidebar: sidebar({
        label: 'Documentation',
        header: [home(), search({ id: 'sidebar-05-search' })],
        // The second section starts open, as in the original.
        content: group({ items: DOCS_NAV.map((g, i) => ({ label: g.label, items: g.items, open: i === 1 })) }),
      }),
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
    }),
  );
}
