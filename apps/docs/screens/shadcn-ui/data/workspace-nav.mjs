/**
 * Sample data of the shadcn/ui "workspace" sidebar (sidebar-10, and the left sidebar of
 * sidebar-15), as in the original: a team switcher, the main links, favorites, workspaces and
 * secondary links. Lucide icons remapped to Material Symbols; emoji kept, hidden from assistive
 * technologies (they repeat the label).
 *
 * `workspaceSidebar(prefix)` renders the whole sidebar both screens share; `prefix` keeps the
 * Dropdown ids unique in the page.
 */
import { el } from '../../lib/ds.mjs';
import { sidebar, group, identity } from '../../lib/shell.mjs';

/** A decorative emoji before a label (the original's page icons). */
const emoji = (value) => el('span', { 'aria-hidden': 'true' }, value);

export const WORKSPACE_TEAMS = [
  { name: 'Acme Inc', plan: 'Enterprise', icon: 'keyboard_command_key' },
  { name: 'Acme Corp.', plan: 'Startup', icon: 'graphic_eq' },
  { name: 'Evil Corp.', plan: 'Free', icon: 'keyboard_command_key' },
];

/** The main links of the sidebar header ("Inbox" carries a badge in the data, which the original does not render). */
export const NAV_MAIN = [
  { label: 'Search', icon: 'search', href: '#' },
  { label: 'Ask AI', icon: 'auto_awesome', href: '#' },
  { label: 'Home', icon: 'home', href: '#', current: true },
  { label: 'Inbox', icon: 'inbox', href: '#' },
];

export const NAV_SECONDARY = [
  { label: 'Calendar', icon: 'calendar_today', href: '#' },
  { label: 'Settings', icon: 'tune', href: '#' },
  { label: 'Templates', icon: 'widgets', href: '#' },
  { label: 'Trash', icon: 'delete', href: '#' },
  { label: 'Help', icon: 'help', href: '#' },
];

/** The first six of the original's ten favorites. */
export const FAVORITES = [
  { name: 'Project Management & Task Tracking', emoji: '📊' },
  { name: 'Family Recipe Collection & Meal Planning', emoji: '🍳' },
  { name: 'Fitness Tracker & Workout Routines', emoji: '💪' },
  { name: 'Book Notes & Reading List', emoji: '📚' },
  { name: 'Sustainable Gardening Tips & Plant Care', emoji: '🌱' },
  { name: 'Language Learning Progress & Resources', emoji: '🗣️' },
];

export const WORKSPACES = [
  { name: 'Personal Life Management', emoji: '🏠', pages: [['Daily Journal & Reflection', '📔'], ['Health & Wellness Tracker', '🍏'], ['Personal Growth & Learning Goals', '🌟']] },
  { name: 'Professional Development', emoji: '💼', pages: [['Career Objectives & Milestones', '🎯'], ['Skill Acquisition & Training Log', '🧠'], ['Networking Contacts & Events', '🤝']] },
  { name: 'Creative Projects', emoji: '🎨', pages: [['Writing Ideas & Story Outlines', '✍️'], ['Art & Design Portfolio', '🖼️'], ['Music Composition & Practice Log', '🎵']] },
  { name: 'Home Management', emoji: '🏡', pages: [['Household Budget & Expense Tracking', '💰'], ['Home Maintenance Schedule & Tasks', '🔧'], ['Family Calendar & Event Planning', '📅']] },
  { name: 'Travel & Adventure', emoji: '🧳', pages: [['Trip Planning & Itineraries', '🗺️'], ['Travel Bucket List & Inspiration', '🌎'], ['Travel Journal & Photo Gallery', '📸']] },
];

/** The team switcher: the original's trigger shows the team name only. */
export function workspaceTeams(prefix) {
  const [current] = WORKSPACE_TEAMS;
  return identity({
    icon: current.icon,
    title: current.name,
    menu: {
      id: `${prefix}-teams`,
      label: 'Teams',
      items: [...WORKSPACE_TEAMS.map((t, i) => ({ label: `${t.name} (⌘${i + 1})`, icon: t.icon })), { part: 'separator' }, { label: 'Add team', icon: 'add' }],
    },
  });
}

/** Favorites: each one has an action menu. */
export function favorites(prefix) {
  return [
    ...FAVORITES.map((f, i) => ({
      label: f.name,
      href: '#',
      avatar: emoji(f.emoji),
      menu: {
        id: `${prefix}-favorite-${i}`,
        items: [
          { label: 'Remove from Favorites', icon: 'bookmark_remove' },
          { part: 'separator' },
          { label: 'Copy Link', icon: 'link' },
          { label: 'Open in New Tab', icon: 'open_in_new' },
          { part: 'separator' },
          { label: 'Delete', icon: 'delete' },
        ],
      },
    })),
    { label: 'More', icon: 'more_horiz', href: '#' },
  ];
}

/** Workspaces: each one discloses its pages. */
export function workspaces() {
  return [
    ...WORKSPACES.map((w) => ({
      label: w.name,
      avatar: emoji(w.emoji),
      items: w.pages.map(([name, e]) => ({ label: name, href: '#', avatar: emoji(e) })),
    })),
    { label: 'More', icon: 'more_horiz', href: '#' },
  ];
}

/** The whole sidebar: header (team switcher, main links), favorites, workspaces, secondary links. */
export function workspaceSidebar(prefix) {
  return sidebar({
    header: [workspaceTeams(prefix), group({ items: NAV_MAIN })],
    content: [
      group({ label: 'Favorites', id: `${prefix}-favorites`, items: favorites(prefix) }),
      group({ label: 'Workspaces', id: `${prefix}-workspaces`, items: workspaces() }),
    ],
    // The original pushes the secondary links to the bottom of the content (mt-auto): the footer.
    footer: group({ items: NAV_SECONDARY }),
  });
}

/** What both screens change from the original sidebar. */
export const WORKSPACE_CHANGES = [
  'The favorites list shows the first six of its ten items.',
  'Workspaces are disclosure summaries that open their pages: the original makes each workspace a link with a separate toggle, and an "add page" button with no action, which is dropped.',
  'The "More" items that close the favorites and workspaces lists are links (the original has buttons with no action).',
];
