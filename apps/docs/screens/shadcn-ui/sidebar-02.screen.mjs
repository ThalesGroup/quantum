import { screen } from '../lib/ds.mjs';
import { shell, sidebar, group, versions, search, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { DOCS_NAV } from './data/docs-nav.mjs';

/** shadcn/ui block sidebar-02: A sidebar with collapsible sections. */
export const meta = {
  block: 'sidebar-02',
  name: 'Sidebar with collapsible sections',
  section: 'application-shell',
  description: 'A sidebar with collapsible sections.',
  changes: [CHANGES.collapse, CHANGES.rail],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.collapsible, GAPS.trigger],
};

export function render() {
  return screen({},
    shell({
      sidebar: sidebar({
        label: 'Documentation',
        header: [versions({ id: 'sidebar-02-version' }), search({ id: 'sidebar-02-search' })],
        content: DOCS_NAV.map((g, i) => group({ ...g, collapsible: true, id: `sidebar-02-group-${i}` })),
      }),
      main: [header({ breadcrumb: BREADCRUMB, sticky: true }), placeholder({ rows: 24 })],
    }),
  );
}
