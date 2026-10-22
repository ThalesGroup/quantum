import { el, screen } from '../lib/ds.mjs';
import { shell, sidebar, group, user, search, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { PLATFORM_NAV, SECONDARY_NAV } from './data/app-nav.mjs';
import { home } from './data/home-nav.mjs';

/** shadcn/ui block sidebar-16: A sidebar with a sticky site header. */
export const meta = {
  block: 'sidebar-16',
  name: 'Sidebar with a sticky site header',
  section: 'application-shell',
  description: 'A sidebar with a sticky site header.',
  changes: [
    CHANGES.collapse,
    'The sidebar runs the height of the content below the sticky header and scrolls with the page (the original fixes it below the header).',
    'The search field shows its label, "Search" (the original hides it visually).',
    'Items with sub-items are disclosure summaries: the original makes the item a link and puts the toggle beside it.',
    'The "More" item that closes the projects list is a link (the original is a button with no action).',
  ],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.collapsible, GAPS.trigger, GAPS.itemMenu],
};

const PROJECTS = [
  { label: 'Design Engineering', icon: 'crop_free' },
  { label: 'Sales & Marketing', icon: 'pie_chart' },
  { label: 'Travel', icon: 'map' },
];

function projects() {
  return [
    ...PROJECTS.map((p, i) => ({
      ...p,
      href: '#',
      menu: {
        id: `sidebar-16-project-${i}`,
        items: [{ label: 'View Project', icon: 'folder' }, { label: 'Share Project', icon: 'share' }, { part: 'separator' }, { label: 'Delete Project', icon: 'delete' }],
      },
    })),
    { label: 'More', icon: 'more_horiz', href: '#' },
  ];
}

export function render() {
  return screen({},
    // The site header spans the page above the sidebar and the content, and stays on top when the page scrolls.
    el('div', { class: 'scr-site' },
      header({ breadcrumb: BREADCRUMB, end: search({ id: 'sidebar-16-search', placeholder: 'Type to search...' }), sticky: true }),
      shell({
        sidebar: sidebar({
          header: home({ icon: 'keyboard_command_key', title: 'Acme Inc', subtitle: 'Enterprise' }),
          content: [
            group({ label: 'Platform', id: 'sidebar-16-platform', items: PLATFORM_NAV }),
            group({ label: 'Projects', id: 'sidebar-16-projects', items: projects() }),
          ],
          footer: [group({ items: SECONDARY_NAV }), user({ id: 'sidebar-16-user' })],
        }),
        main: placeholder(),
      }),
    ),
  );
}
