import { screen } from '../lib/ds.mjs';
import { shell, sidebar, group, user, header, placeholder, BREADCRUMB, GAPS } from '../lib/shell.mjs';
import { PLATFORM_NAV, SECONDARY_NAV, projects } from './data/app-nav.mjs';
import { home } from './data/home-nav.mjs';

/** shadcn/ui block sidebar-08: An inset sidebar with secondary navigation. */
export const meta = {
  block: 'sidebar-08',
  name: 'Inset sidebar with secondary navigation',
  section: 'application-shell',
  description: 'An inset sidebar with secondary navigation.',
  changes: [
    'The sidebar does not collapse (that needs script, and so does the trigger button): it is always shown on wide screens and stacks above the content on narrow ones. The sidebar trigger and its separator are dropped.',
    'A "Platform" item with sub-items is one disclosure: its label opens the sub-items (the original has a link and a separate toggle button beside it).',
    'The secondary navigation (Support, Feedback) sits in the sidebar footer above the user row; the original pushes it to the bottom of the sidebar content.',
    'The "More" item that closes the projects list is a link (the original is a button with no action).',
    'The header of the main column keeps the bottom rule every shell header has (the original has none).',
  ],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.collapsible, GAPS.trigger, GAPS.itemMenu],
};

export function render() {
  return screen({},
    shell({
      variant: 'inset',
      sidebar: sidebar({
        header: home({ icon: 'keyboard_command_key', title: 'Acme Inc', subtitle: 'Enterprise' }),
        content: [
          group({ label: 'Platform', id: 'sidebar-08-platform', items: PLATFORM_NAV }),
          group({ label: 'Projects', id: 'sidebar-08-projects', items: projects('sidebar-08') }),
        ],
        footer: [group({ items: SECONDARY_NAV }), user({ id: 'sidebar-08-user' })],
      }),
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
    }),
  );
}
