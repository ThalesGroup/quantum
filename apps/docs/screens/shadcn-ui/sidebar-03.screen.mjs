import { screen } from '../lib/ds.mjs';
import { shell, sidebar, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { DOCS_NAV } from './data/docs-nav.mjs';
import { home, sections } from './data/home-nav.mjs';

/** shadcn/ui block sidebar-03: A sidebar with submenus. */
export const meta = {
  block: 'sidebar-03',
  name: 'Sidebar with submenus',
  section: 'application-shell',
  description: 'A sidebar with submenus.',
  changes: [CHANGES.collapse, CHANGES.rail],
  gaps: [GAPS.collapse, GAPS.navigation],
};

export function render() {
  return screen({},
    shell({
      sidebar: sidebar({
        label: 'Documentation',
        header: home(),
        content: sections(DOCS_NAV),
      }),
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
    }),
  );
}
