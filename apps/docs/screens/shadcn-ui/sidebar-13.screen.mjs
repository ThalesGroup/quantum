import { ds, el, screen } from '../lib/ds.mjs';
import { shell, sidebar, group, GAPS } from '../lib/shell.mjs';

/** shadcn/ui block sidebar-13: A sidebar in a dialog. */
export const meta = {
  block: 'sidebar-13',
  name: 'Sidebar in a dialog',
  section: 'application-shell',
  description: 'A sidebar in a dialog.',
  changes: [
    'There is no Dialog component: the settings dialog is shown open on the page, below its "Open Dialog" button, as a non-modal native dialog. The button opens nothing and the dialog has no close button (both need the Dialog component or script).',
    'On narrow screens the dialog\'s sidebar stacks above its content (the original hides it).',
    'The dialog shows three of the original\'s ten empty panels and does not scroll.',
  ],
  gaps: [
    { text: 'The settings dialog is a native dialog element shown open, on semantic tokens: there is no Dialog component yet.' },
    GAPS.navigation,
  ],
};

const NAV = [
  ['Notifications', 'notifications'],
  ['Navigation', 'menu'],
  ['Home', 'home'],
  ['Appearance', 'brush'],
  ['Messages & media', 'chat'],
  ['Language & region', 'language'],
  ['Accessibility', 'keyboard'],
  ['Mark as read', 'check'],
  ['Audio & video', 'videocam'],
  ['Connected accounts', 'link'],
  ['Privacy & visibility', 'lock'],
  ['Advanced', 'settings'],
];
const CURRENT = 'Messages & media';

export function render() {
  return screen({ class: 'scr-dialog-stage' },
    ds.button({ label: 'Open Dialog', size: 'small' }),
    el('dialog', { class: 'scr-dialog', open: true, 'aria-labelledby': 'sidebar-13-title', 'aria-describedby': 'sidebar-13-description' },
      // The original's title and description are visually hidden.
      el('h2', { class: 'scr-sr', id: 'sidebar-13-title' }, 'Settings'),
      el('p', { class: 'scr-sr', id: 'sidebar-13-description' }, 'Customize your settings here.'),
      shell({
        sidebar: sidebar({ label: 'Settings', content: group({ items: NAV.map(([label, icon]) => ({ label, icon, href: '#', current: label === CURRENT })) }) }),
        main: [
          el('div', { class: 'scr-header' }, ds.breadcrumb({ size: 'small', items: [{ label: 'Settings', href: '#' }, { label: CURRENT }] })),
          el('div', { class: 'scr-content', 'aria-hidden': 'true' }, Array.from({ length: 3 }, () => el('div', { class: 'scr-tile' }))),
        ],
      }),
    ),
  );
}
