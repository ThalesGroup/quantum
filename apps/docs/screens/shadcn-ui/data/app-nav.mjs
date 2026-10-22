/** Sample navigation of the shadcn/ui application sidebars (sidebar-07, sidebar-08 and others), as in the original. */
const sub = (...labels) => labels.map((label) => ({ label, href: '#' }));

/** "Platform": collapsible items with icons; the first one is open. Lucide icons remapped to Material Symbols. */
export const PLATFORM_NAV = [
  { label: 'Playground', icon: 'terminal', open: true, items: sub('History', 'Starred', 'Settings') },
  { label: 'Models', icon: 'smart_toy', items: sub('Genesis', 'Explorer', 'Quantum') },
  { label: 'Documentation', icon: 'menu_book', items: sub('Introduction', 'Get Started', 'Tutorials', 'Changelog') },
  { label: 'Settings', icon: 'tune', items: sub('General', 'Team', 'Billing', 'Limits') },
];

/** "Projects": each item has an action menu. `prefix` keeps the menu ids unique in the page. */
export function projects(prefix) {
  const list = [
    { label: 'Design Engineering', icon: 'crop_free' },
    { label: 'Sales & Marketing', icon: 'pie_chart' },
    { label: 'Travel', icon: 'map' },
  ];
  return [
    ...list.map((p, i) => ({
      ...p,
      href: '#',
      menu: {
        id: `${prefix}-project-${i}`,
        items: [{ label: 'View Project', icon: 'folder' }, { label: 'Share Project', icon: 'forward' }, { part: 'separator' }, { label: 'Delete Project', icon: 'delete' }],
      },
    })),
    { label: 'More', icon: 'more_horiz', href: '#' },
  ];
}

/** Secondary navigation at the bottom of a sidebar (sidebar-08, dashboard-01). */
export const SECONDARY_NAV = [
  { label: 'Support', icon: 'support', href: '#' },
  { label: 'Feedback', icon: 'send', href: '#' },
];
