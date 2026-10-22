import { ds, slot, el, screen, text, link } from '../lib/ds.mjs';
import { shell, sidebar, group, user, header, GAPS as SHELL_GAPS } from '../lib/shell.mjs';
import { stackedArea, legend } from '../lib/chart.mjs';
import { VISITORS, OUTLINE, OUTLINE_TOTAL } from './data/dashboard.mjs';

/** shadcn/ui block dashboard-01: A dashboard with sidebar, charts and data table. */
export const meta = {
  block: 'dashboard-01',
  name: 'Dashboard with charts and a data table',
  section: 'dashboard',
  description: 'A dashboard with sidebar, charts and data table.',
  changes: [
    'The sidebar does not collapse off canvas (that needs script): it is always shown on wide screens and stacks above the content on narrow ones. The sidebar trigger and its separator are dropped.',
    'The time range of the chart is a Radio group: each option shows its own pre-rendered chart (CSS :has(), no script). The original switches a toggle group to a select on narrow screens.',
    'The chart has no tooltip on hover (it needs script); a visually hidden summary gives the totals of the range.',
    'The table shows its first 10 rows, statically: no drag and drop reordering, no sorting, no "select all", no column hiding. Pagination is links.',
    'The row checkbox is labelled by the section header; the header link that opens an edit drawer is dropped (no Dialog or Drawer yet).',
    'Target, Limit and Reviewer are read-only values instead of inline fields and selects: the Text field and the Select have no visually hidden label.',
    'The "Customize Columns" menu lists the columns with a check icon instead of checkbox items.',
    'KPI trends are words and an icon in a neutral Badge, as in the original.',
  ],
  gaps: [
    SHELL_GAPS.navigation,
    SHELL_GAPS.collapse,
    SHELL_GAPS.itemMenu,
    { text: 'KPI and chart cards: the Card has no content, action or footer part, so the value, the badge and the footer lines are placed inside the Card root.' },
    { text: 'The chart is a static SVG colored with the data visualisation tokens: there is no Chart component or data visualisation foundation.' },
    { text: 'Tabs over the table are links with aria-current: there is no Tabs component.' },
    { text: 'The data table is a native table on semantic tokens: there is no Table component.' },
    { text: 'The Dropdown has no checkbox items (Customize Columns).' },
    { text: 'Form controls inside table cells need a visually hidden label: Text field and Select always show theirs.' },
    { text: 'The Badge has no icon (trend arrows, status icons).' },
  ],
};

const RANGES = [
  { value: '90d', label: 'Last 3 months', description: 'Total for the last 3 months', days: 91 },
  { value: '30d', label: 'Last 30 days', description: 'Total for the last 30 days', days: 30 },
  { value: '7d', label: 'Last 7 days', description: 'Total for the last 7 days', days: 7 },
];
const fmt = new Intl.NumberFormat('en-US');
const day = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

function kpi({ label, value, trend, up, headline, note }) {
  return slot(ds.card({ title: label, headingLevel: 3 }),
    el('div', { class: 'scr-kpi' },
      el('p', { class: 'scr-kpi__value' }, text(value)),
      ds.badge({ label: trend, size: 'small' }),
    ),
    el('p', { class: 'scr-kpi__headline' }, text(headline), ' ', ds.icon({ name: up ? 'trending_up' : 'trending_down', size: 'small' })),
    el('p', { class: 'scr-muted' }, text(note)),
  );
}

function chart() {
  const series = (rows) => [
    { label: 'Mobile', values: rows.map((r) => r[2]) },
    { label: 'Desktop', values: rows.map((r) => r[1]) },
  ];
  const plots = RANGES.map((r) => {
    const rows = VISITORS.slice(-r.days);
    const s = series(rows);
    const totals = s.map((x) => `${x.label.toLowerCase()} ${fmt.format(x.values.reduce((a, b) => a + b, 0))}`).join(', ');
    return el('figure', { class: 'scr-chart__plot', 'data-range': r.value },
      el('figcaption', { class: 'scr-sr' }, text(`Stacked area chart of visitors per day, ${day(rows[0][0])} to ${day(rows.at(-1)[0])} 2024: ${totals} visitors.`)),
      stackedArea({ series: s, labels: rows.map((x) => day(x[0])), ticks: r.days > 7 ? 6 : 7 }),
    );
  });
  return slot(ds.card({ title: 'Total Visitors', description: 'Visitors per day on desktop and mobile', headingLevel: 2 }),
    el('div', { class: 'scr-chart' },
      ds.radioGroup({ label: 'Time range', name: 'dashboard-01-range', id: 'dashboard-01-range', orientation: 'horizontal', size: 'small', options: RANGES.map((r, i) => ({ label: r.label, value: r.value, checked: i === 0 })) }),
      plots,
      legend([{ label: 'Mobile' }, { label: 'Desktop' }]),
    ),
  );
}

const STATUS = { Done: { intent: 'success' }, 'In Process': { intent: 'neutral' } };

function table() {
  const rows = OUTLINE.map((r) => el('tr', {},
    el('td', {}, ds.checkbox({ label: r.header, id: `dashboard-01-row-${r.id}`, name: 'rows', size: 'small' })),
    el('td', {}, ds.badge({ label: r.type, size: 'small' })),
    el('td', {}, ds.badge({ label: r.status, size: 'small', ...STATUS[r.status] })),
    el('td', { class: 'scr-num' }, text(r.target)),
    el('td', { class: 'scr-num' }, text(r.limit)),
    el('td', { class: r.reviewer === 'Assign reviewer' ? 'scr-muted' : null }, text(r.reviewer)),
    el('td', {}, ds.dropdown({ label: 'More', emphasis: 'ghost', size: 'xsmall', id: `dashboard-01-row-${r.id}-menu`, items: [{ label: 'Edit' }, { label: 'Make a copy' }, { label: 'Favorite' }, { part: 'separator' }, { label: 'Delete', intent: 'error' }] })),
  ));
  const pages = Math.ceil(OUTLINE_TOTAL / OUTLINE.length);
  return el('section', { class: 'scr-stack', 'aria-labelledby': 'dashboard-01-outline' },
    el('div', { class: 'scr-row', 'data-justify': 'between' },
      el('nav', { class: 'scr-tabs', 'aria-label': 'Views' },
        el('a', { class: 'scr-tabs__link', href: '#', 'aria-current': 'page' }, 'Outline'),
        el('a', { class: 'scr-tabs__link', href: '#' }, 'Past Performance ', ds.badge({ label: '3', size: 'small' })),
        el('a', { class: 'scr-tabs__link', href: '#' }, 'Key Personnel ', ds.badge({ label: '2', size: 'small' })),
        el('a', { class: 'scr-tabs__link', href: '#' }, 'Focus Documents'),
      ),
      el('div', { class: 'scr-row' },
        ds.dropdown({ label: 'Customize Columns', emphasis: 'subtle', size: 'small', id: 'dashboard-01-columns', items: ['Section Type', 'Status', 'Target', 'Limit', 'Reviewer'].map((c) => ({ label: c, icon: 'check' })) }),
        ds.button({ label: 'Add Section', iconStart: 'add', emphasis: 'subtle', size: 'small' }),
      ),
    ),
    el('div', { class: 'scr-table-wrap' },
      el('table', { class: 'scr-table' },
        el('caption', { class: 'scr-sr', id: 'dashboard-01-outline' }, 'Outline: the sections of the document'),
        el('thead', {}, el('tr', {}, ['Header', 'Section Type', 'Status', 'Target', 'Limit', 'Reviewer'].map((h) => el('th', { scope: 'col', class: h === 'Target' || h === 'Limit' ? 'scr-num' : null }, text(h))), el('th', { scope: 'col' }, el('span', { class: 'scr-sr' }, 'Actions')))),
        el('tbody', {}, rows),
      ),
    ),
    el('div', { class: 'scr-row scr-table-footer', 'data-justify': 'between' },
      el('p', { class: 'scr-muted' }, text(`0 of ${OUTLINE_TOTAL} row(s) selected.`)),
      el('div', { class: 'scr-row' },
        ds.select({ label: 'Rows per page', size: 'small', id: 'dashboard-01-rows-per-page', options: [10, 20, 30, 40, 50].map((n) => ({ label: String(n), value: String(n), selected: n === 10 })) }),
        el('p', { class: 'scr-strong' }, text(`Page 1 of ${pages}`)),
        ds.pagination({ size: 'small', label: 'Outline pages', next: '#', pages: Array.from({ length: pages }, (_, i) => (i === 0 ? { label: '1', current: true } : { label: String(i + 1), href: '#' })) }),
      ),
    ),
  );
}

export function render() {
  const nav = sidebar({
    label: 'Main',
    header: el('a', { class: 'scr-brand', href: '#' }, el('span', { class: 'scr-brand__mark' }, ds.icon({ name: 'contrast', size: 'small' })), 'Acme Inc.'),
    content: [
      el('div', { class: 'scr-row scr-quick' }, ds.button({ label: 'Quick Create', iconStart: 'add_circle', size: 'small' }), ds.iconButton({ icon: 'mail', label: 'Inbox', emphasis: 'subtle', size: 'small' })),
      group({ items: [
        { label: 'Dashboard', icon: 'dashboard', current: true },
        { label: 'Lifecycle', icon: 'list_alt' },
        { label: 'Analytics', icon: 'bar_chart' },
        { label: 'Projects', icon: 'folder' },
        { label: 'Team', icon: 'group' },
      ] }),
      group({ label: 'Documents', id: 'dashboard-01-documents', items: [
        { label: 'Data Library', icon: 'database' },
        { label: 'Reports', icon: 'lab_profile' },
        { label: 'Word Assistant', icon: 'description' },
      ].map((d, i) => ({ ...d, menu: { id: `dashboard-01-document-${i}`, items: [{ label: 'Open', icon: 'folder_open' }, { label: 'Share', icon: 'share' }, { part: 'separator' }, { label: 'Delete', icon: 'delete', intent: 'error' }] } })) }),
      el('div', { class: 'scr-push' }, group({ items: [
        { label: 'Settings', icon: 'settings' },
        { label: 'Get Help', icon: 'help' },
        { label: 'Search', icon: 'search' },
      ] })),
    ],
    footer: user({ id: 'dashboard-01-user' }),
  });
  return screen({},
    shell({
      variant: 'inset',
      sidebar: nav,
      main: [
        header({ title: 'Documents', end: link('GitHub', { href: 'https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard' }) }),
        el('main', { class: 'scr-content scr-dashboard' },
          el('h2', { class: 'scr-sr' }, 'Key figures'),
          el('div', { class: 'scr-kpis' },
            kpi({ label: 'Total Revenue', value: '$1,250.00', trend: '+12.5%', up: true, headline: 'Trending up this month', note: 'Visitors for the last 6 months' }),
            kpi({ label: 'New Customers', value: '1,234', trend: '-20%', up: false, headline: 'Down 20% this period', note: 'Acquisition needs attention' }),
            kpi({ label: 'Active Accounts', value: '45,678', trend: '+12.5%', up: true, headline: 'Strong user retention', note: 'Engagement exceed targets' }),
            kpi({ label: 'Growth Rate', value: '4.5%', trend: '+4.5%', up: true, headline: 'Steady performance increase', note: 'Meets growth projections' }),
          ),
          chart(),
          table(),
        ),
      ],
    }),
  );
}
