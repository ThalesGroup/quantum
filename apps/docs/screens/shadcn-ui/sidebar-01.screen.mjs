import { screen } from '../lib/ds.mjs';
import { shell, sidebar, group, versions, search, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { DOCS_NAV } from './data/docs-nav.mjs';

/** shadcn/ui block sidebar-01: A simple sidebar with navigation grouped by section. */
export const meta = {
  block: 'sidebar-01',
  name: 'Sidebar with grouped navigation',
  section: 'application-shell',
  description: 'A simple sidebar with navigation grouped by section.',
  changes: [CHANGES.collapse, CHANGES.rail],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.trigger],
};

export function render() {
  return screen({},
    shell({
      sidebar: sidebar({
        label: 'Documentation',
        header: [versions({ id: 'sidebar-01-version' }), search({ id: 'sidebar-01-search' })],
        content: DOCS_NAV.slice(0, 4).map((g, i) => group({ ...g, id: `sidebar-01-group-${i}` })),
      }),
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
    }),
  );
}
