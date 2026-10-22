import { el, screen, text } from '../lib/ds.mjs';
import { shell, header, GAPS, CHANGES } from '../lib/shell.mjs';
import { calendarSidebar, CALENDAR_CHANGES, CALENDAR_GAP, MONTH } from './data/calendar-nav.mjs';

/** shadcn/ui block sidebar-12: A sidebar with a calendar. */
export const meta = {
  block: 'sidebar-12',
  name: 'Sidebar with a calendar',
  section: 'application-shell',
  description: 'A sidebar with a calendar.',
  changes: [
    CHANGES.collapse,
    CHANGES.rail,
    ...CALENDAR_CHANGES,
    'The sidebar is a complementary region named "Calendars" (it holds a calendar and settings, not navigation).',
  ],
  gaps: [GAPS.collapse, CALENDAR_GAP, GAPS.collapsible, GAPS.trigger],
};

export function render() {
  return screen({},
    shell({
      sidebar: calendarSidebar('sidebar-12'),
      main: [
        header({ breadcrumb: [{ label: MONTH.name }], sticky: true }),
        // The original's content is twenty empty squares; a visually hidden heading names it.
        el('main', { class: 'scr-content' },
          el('h1', { class: 'scr-sr' }, text(MONTH.name)),
          el('div', { class: 'scr-tile-grid', 'aria-hidden': 'true' }, Array.from({ length: 20 }, () => el('div', { class: 'scr-tile' }))),
        ),
      ],
    }),
  );
}
