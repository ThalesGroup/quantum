import { ds, el, text, screen } from '../lib/ds.mjs';
import { shell, sidebar, group, search, user, header, placeholder, GAPS } from '../lib/shell.mjs';
import { home } from './data/home-nav.mjs';

/** shadcn/ui block sidebar-09: Collapsible nested sidebars. */
export const meta = {
  block: 'sidebar-09',
  name: 'Nested sidebars for a mail app',
  section: 'application-shell',
  description: 'Collapsible nested sidebars.',
  changes: [
    'Both sidebars are always shown: the outer sidebar does not collapse to its icon rail (that needs script, and so does the trigger button), and the sidebar trigger and its separator are dropped. On wide screens the folder rail shows icons only and the mail list sits beside it; on narrow ones the rail shows its labels and both stack above the content (the original hides the mail list there).',
    'Choosing a folder does not reshuffle the mail list or change the list title (that needs script): the folders are links, Inbox is the current one.',
    'The user row sits at the foot of the mail list instead of the foot of the rail, where its menu does not fit: the Dropdown has no icon-only trigger.',
    'The "Unreads" switch filters nothing (the original does not either).',
  ],
  gaps: [
    GAPS.collapse,
    GAPS.navigation,
    GAPS.trigger,
    { text: 'The folder rail names its icons with visually hidden labels: there is no Tooltip to show them on hover and focus.' },
    { text: 'The mail list (sender, date, subject, a two-line teaser) is native links on semantic tokens: there is no list or mail item component.' },
  ],
};

const FOLDERS = [
  { label: 'Inbox', icon: 'inbox', current: true },
  { label: 'Drafts', icon: 'description' },
  { label: 'Sent', icon: 'send' },
  { label: 'Junk', icon: 'archive' },
  { label: 'Trash', icon: 'delete' },
].map((f) => ({ href: '#', ...f }));

const MAILS = [
  { name: 'William Smith', subject: 'Meeting Tomorrow', date: '09:34 AM', teaser: 'Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.' },
  { name: 'Alice Smith', subject: 'Re: Project Update', date: 'Yesterday', teaser: "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps." },
  { name: 'Bob Johnson', subject: 'Weekend Plans', date: '2 days ago', teaser: "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?" },
  { name: 'Emily Davis', subject: 'Re: Question about Budget', date: '2 days ago', teaser: "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?" },
  { name: 'Michael Wilson', subject: 'Important Announcement', date: '1 week ago', teaser: "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future." },
  { name: 'Sarah Brown', subject: 'Re: Feedback on Proposal', date: '1 week ago', teaser: "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?" },
  { name: 'David Lee', subject: 'New Project Idea', date: '1 week ago', teaser: "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?" },
  { name: 'Olivia Wilson', subject: 'Vacation Plans', date: '1 week ago', teaser: "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave." },
  { name: 'James Martin', subject: 'Re: Conference Registration', date: '1 week ago', teaser: "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end." },
  { name: 'Sophia White', subject: 'Team Dinner', date: '1 week ago', teaser: "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences." },
];

const mail = (m) => el('li', {}, el('a', { class: 'scr-mail', href: '#' },
  el('span', { class: 'scr-mail__top' }, el('span', {}, text(m.name)), el('span', { class: 'scr-mail__date' }, text(m.date))),
  el('span', { class: 'scr-mail__subject' }, text(m.subject)),
  el('span', { class: 'scr-mail__teaser' }, text(m.teaser)),
));

export function render() {
  const rail = sidebar({
    label: 'Folders',
    header: home({ icon: 'keyboard_command_key', title: 'Acme Inc', subtitle: 'Enterprise' }),
    content: group({ items: FOLDERS }),
  });
  const mails = sidebar({
    tag: 'aside',
    label: 'Inbox',
    header: [
      el('div', { class: 'scr-row', 'data-justify': 'between' },
        el('h2', { class: 'scr-title', 'data-size': 'small' }, text('Inbox')),
        ds.switch({ label: 'Unreads', size: 'small', id: 'sidebar-09-unreads' }),
      ),
      search({ id: 'sidebar-09-search', placeholder: 'Type to search...' }),
    ],
    content: el('ul', { class: 'scr-mail-list' }, MAILS.map(mail)),
    footer: user({ id: 'sidebar-09-user' }),
  });
  // The original's outer sidebar is 350px wide: the rail and the mail list share it.
  return screen({ style: '--scr-sidebar: 350px' },
    shell({
      sidebar: el('div', { class: 'scr-nested' }, rail, mails),
      main: [header({ breadcrumb: [{ label: 'All Inboxes', href: '#' }, { label: 'Inbox' }], sticky: true }), placeholder({ rows: 24, heading: 'Inbox' })],
    }),
  );
}
