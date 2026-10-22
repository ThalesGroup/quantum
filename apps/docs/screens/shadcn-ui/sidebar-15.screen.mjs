import { el, screen, text } from '../lib/ds.mjs';
import { shell, header, GAPS, CHANGES } from '../lib/shell.mjs';
import { workspaceSidebar, WORKSPACE_CHANGES } from './data/workspace-nav.mjs';
import { calendarSidebar, CALENDAR_CHANGES, CALENDAR_GAP } from './data/calendar-nav.mjs';

/** shadcn/ui block sidebar-15: A left and right sidebar. */
export const meta = {
  block: 'sidebar-15',
  name: 'Left and right sidebars',
  section: 'application-shell',
  description: 'A left and right sidebar.',
  changes: [
    CHANGES.collapse,
    CHANGES.rail,
    'The right sidebar is a complementary region named "Calendars". Between medium and large widths it sits below the content (the original hides it), and on narrow screens both sidebars stack around the content.',
    ...WORKSPACE_CHANGES,
    ...CALENDAR_CHANGES,
  ],
  gaps: [GAPS.collapse, GAPS.navigation, GAPS.collapsible, CALENDAR_GAP, GAPS.trigger, GAPS.itemMenu],
};

const PAGE = 'Project Management & Task Tracking';

export function render() {
  return screen({},
    shell({
      sidebar: workspaceSidebar('sidebar-15'),
      main: [
        header({ breadcrumb: [{ label: PAGE }], sticky: true }),
        // The original's content is two empty panels in a centred column; a visually hidden heading names it.
        el('main', { class: 'scr-content' },
          el('h1', { class: 'scr-sr' }, text(PAGE)),
          el('div', { class: 'scr-stack scr-column', 'aria-hidden': 'true' }, el('div', { class: 'scr-tile', 'data-size': 'row' }), el('div', { class: 'scr-tile', 'data-size': 'large' })),
        ),
      ],
      aside: calendarSidebar('sidebar-15'),
    }),
  );
}
