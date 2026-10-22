import { screen } from '../lib/ds.mjs';
import { shell, sidebar, group, teams, user, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { PLATFORM_NAV, projects } from './data/app-nav.mjs';

/** shadcn/ui block sidebar-07: A sidebar that collapses to icons. */
export const meta = {
  block: 'sidebar-07',
  name: 'Sidebar that collapses to icons',
  section: 'application-shell',
  description: 'A sidebar that collapses to icons.',
  changes: [
    'Collapsing to an icon rail needs script and a toggle the design system cannot render without it: the sidebar stays expanded on wide screens and stacks above the content on narrow ones. The sidebar trigger and its separator are dropped.',
    CHANGES.rail,
    'The "More" item that closes the projects list is a link (the original is a button with no action).',
  ],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.collapsible, GAPS.trigger, GAPS.itemMenu],
};

export function render() {
  return screen({},
    shell({
      sidebar: sidebar({
        header: teams({ id: 'sidebar-07-teams' }),
        content: [
          group({ label: 'Platform', id: 'sidebar-07-platform', items: PLATFORM_NAV }),
          group({ label: 'Projects', id: 'sidebar-07-projects', items: projects('sidebar-07') }),
        ],
        footer: user({ id: 'sidebar-07-user' }),
      }),
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
    }),
  );
}
