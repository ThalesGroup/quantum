import { ds, el, screen, text } from '../lib/ds.mjs';
import { shell, header, GAPS, CHANGES } from '../lib/shell.mjs';
import { workspaceSidebar, WORKSPACE_CHANGES } from './data/workspace-nav.mjs';

/** shadcn/ui block sidebar-10: A sidebar in a popover. */
export const meta = {
  block: 'sidebar-10',
  name: 'Sidebar in a popover',
  section: 'application-shell',
  description: 'A sidebar in a popover.',
  changes: [
    CHANGES.collapse,
    CHANGES.rail,
    ...WORKSPACE_CHANGES,
    'The page actions popover (a sidebar menu inside a popover) is a Dropdown with the same groups of actions. It is closed until opened: the original opens it on load with script.',
    'The star button has an accessible name, "Add to favorites" (the original has none).',
  ],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.collapsible, GAPS.trigger, GAPS.itemMenu],
};

const PAGE = 'Project Management & Task Tracking';

const ACTIONS = [
  { label: 'Customize Page', icon: 'tune' },
  { label: 'Turn into wiki', icon: 'description' },
  { part: 'separator' },
  { label: 'Copy Link', icon: 'link' },
  { label: 'Duplicate', icon: 'content_copy' },
  { label: 'Move to', icon: 'redo' },
  { label: 'Move to Trash', icon: 'delete' },
  { part: 'separator' },
  { label: 'Undo', icon: 'undo' },
  { label: 'View analytics', icon: 'show_chart' },
  { label: 'Version History', icon: 'view_agenda' },
  { label: 'Show delete pages', icon: 'delete' },
  { label: 'Notifications', icon: 'notifications' },
  { part: 'separator' },
  { label: 'Import', icon: 'arrow_upward' },
  { label: 'Export', icon: 'arrow_downward' },
];

export function render() {
  return screen({},
    shell({
      sidebar: workspaceSidebar('sidebar-10'),
      main: [
        header({
          breadcrumb: [{ label: PAGE }],
          end: [
            el('span', { class: 'scr-muted scr-strong' }, 'Edit Oct 08'),
            ds.iconButton({ icon: 'star', label: 'Add to favorites', emphasis: 'ghost', size: 'small' }),
            ds.dropdown({ label: 'More', emphasis: 'ghost', size: 'small', id: 'sidebar-10-actions', items: ACTIONS }),
          ],
        }),
        // The original's content is two empty panels in a centred column; a visually hidden heading names it.
        el('main', { class: 'scr-content' },
          el('h1', { class: 'scr-sr' }, text(PAGE)),
          el('div', { class: 'scr-stack scr-column', 'aria-hidden': 'true' }, el('div', { class: 'scr-tile', 'data-size': 'row' }), el('div', { class: 'scr-tile', 'data-size': 'large' })),
        ),
      ],
    }),
  );
}
