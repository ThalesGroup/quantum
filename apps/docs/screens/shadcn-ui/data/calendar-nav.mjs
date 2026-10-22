/**
 * Sample data of the shadcn/ui calendar sidebar (sidebar-12, and the right sidebar of sidebar-15),
 * as in the original: the user menu, a month calendar, the calendar lists and "New Calendar".
 *
 * There is no Calendar component (the gap is listed by each screen): the month is a static native
 * table on semantic tokens, laid out by screens.css. Days are text, not buttons; today is marked
 * with aria-current="date". The calendar lists are the design system's Checkboxes inside native
 * details elements (no Disclosure component yet).
 *
 * The original shows the current month: the screen fixes it to October 2024 (the month the
 * original's header names), with today on the 8th ("Edit Oct 08" in sidebar-10), so the render is
 * a pure function.
 */
import { ds, el, text } from '../../lib/ds.mjs';
import { sidebar, user } from '../../lib/shell.mjs';

export const CALENDARS = [
  { name: 'My Calendars', items: ['Personal', 'Work', 'Family'] },
  { name: 'Favorites', items: ['Holidays', 'Birthdays'] },
  { name: 'Other', items: ['Travel', 'Reminders', 'Deadlines'] },
];

export const MONTH = { name: 'October 2024', year: 2024, month: 10, days: 31, firstWeekday: 2, previousDays: 30, today: 8 };

const WEEKDAYS = [['Su', 'Sunday'], ['Mo', 'Monday'], ['Tu', 'Tuesday'], ['We', 'Wednesday'], ['Th', 'Thursday'], ['Fr', 'Friday'], ['Sa', 'Saturday']];
const pad = (n) => String(n).padStart(2, '0');

/** The month as a table: weekday headers, then weeks; days of the adjacent months are muted. */
export function calendarMonth({ name, year, month, days, firstWeekday, previousDays, today } = MONTH) {
  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ day: previousDays - i, date: `${year}-${pad(month - 1)}-${pad(previousDays - i)}`, outside: true });
  for (let d = 1; d <= days; d++) cells.push({ day: d, date: `${year}-${pad(month)}-${pad(d)}`, today: d === today });
  for (let d = 1; cells.length % 7; d++) cells.push({ day: d, date: `${year}-${pad(month + 1)}-${pad(d)}`, outside: true });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return el('table', { class: 'scr-calendar' },
    el('caption', { class: 'scr-calendar__caption' }, text(name)),
    el('thead', {}, el('tr', {}, WEEKDAYS.map(([short, long]) => el('th', { scope: 'col' }, el('span', { 'aria-hidden': 'true' }, short), el('span', { class: 'scr-sr' }, long))))),
    el('tbody', {}, weeks.map((week) => el('tr', {}, week.map((c) => el('td', { class: 'scr-calendar__day', 'data-outside': c.outside ?? false, 'aria-current': c.today ? 'date' : null }, el('time', { datetime: c.date }, String(c.day))))))),
  );
}

/** The calendar lists: one collapsible group each (the first one open), the first two calendars checked. */
export function calendarLists(prefix) {
  return CALENDARS.map((calendar, index) => [
    el('div', { class: 'scr-nav-group' }, el('details', { open: index === 0 },
      el('summary', { class: 'scr-nav__summary' }, el('span', { class: 'scr-nav__label' }, text(calendar.name)), el('span', { class: 'scr-nav__chevron' }, ds.icon({ name: 'chevron_right', size: 'small' }))),
      el('ul', { class: 'scr-checklist' }, calendar.items.map((item, i) => el('li', {}, ds.checkbox({
        label: item,
        size: 'small',
        checked: i < 2,
        id: `${prefix}-calendar-${item.toLowerCase()}`,
        name: 'calendars',
        value: item.toLowerCase(),
      })))),
    )),
    ds.divider({}),
  ]);
}

/** The whole sidebar: the user menu, the month, the calendar lists and "New Calendar". */
export function calendarSidebar(prefix, { label = 'Calendars' } = {}) {
  return sidebar({
    label,
    tag: 'aside',
    header: user({ id: `${prefix}-user` }),
    content: [ds.divider({}), calendarMonth(), ds.divider({}), calendarLists(prefix)],
    footer: ds.button({ label: 'New Calendar', iconStart: 'add', emphasis: 'ghost', size: 'small' }),
  });
}

/** What both screens change from the original sidebar. */
export const CALENDAR_CHANGES = [
  'The calendar shows October 2024 with today on the 8th: the original shows the current month. The previous and next month buttons are dropped (changing month needs script), and days are text, not buttons.',
  'Calendars are checkboxes (the original draws a checked square inside a menu button).',
];

/** The calendar gap both screens share (no issue yet). */
export const CALENDAR_GAP = { text: 'The month calendar is a static native table on semantic tokens: there is no Calendar component, so days cannot be selected and the month cannot change.' };
