/**
 * Building blocks of application shells: the shell grid, the sidebar and its navigation, the
 * header with its breadcrumb, identity rows (team, version, user) and placeholder content.
 *
 * The design system has no Navigation, Sidebar, Disclosure or Link component yet
 *: the navigation is native HTML (nav, lists, links, details)
 * laid out by screens/screens.css on semantic tokens. Everything the design system covers
 * (menus, avatars, icons, breadcrumbs, buttons, fields) is rendered by its component.
 */
import { ds, el, join, text } from './ds.mjs';

/** Gaps every shell shares (shown on each screen's page). */
export const GAPS = {
  navigation: { text: 'The sidebar navigation (groups, items, sub-items, current item) is native HTML on semantic tokens: there is no Navigation component yet.' },
  collapsible: { text: 'Collapsible groups are native details elements on semantic tokens: there is no Disclosure component yet.' },
  trigger: { text: 'Menus whose trigger is a whole row (team, version or user switcher) use the Dropdown next to the row: its trigger is a Button with a text label, it cannot hold an avatar or two lines.' },
  collapse: { text: 'Collapsing the sidebar (off canvas or to an icon rail) has no pattern without script yet.' },
  itemMenu: { text: 'Per-item action menus are Dropdowns with a visible "More" label: the Dropdown has no icon-only trigger.' },
};
export const CHANGES = {
  collapse: 'The sidebar does not collapse (that needs script, and so does the trigger button): it is always expanded on wide screens and stacks above the content on narrow ones. The sidebar trigger and its separator are dropped.',
  rail: 'The rail that resizes the sidebar is dropped.',
};

/**
 * The shell: a sidebar (or two) and the main column.
 * variant: 'sidebar' (default, flush), 'inset' (the main column is a raised panel), 'floating'
 * (the sidebar is a raised panel). side: 'left' (default), 'right', 'both' (pass `aside`).
 */
export function shell({ sidebar, aside = null, main, variant = 'sidebar', side = aside ? 'both' : 'left' }) {
  return el('div', { class: 'scr-shell', 'data-variant': variant, 'data-side': side }, sidebar, el('div', { class: 'scr-main' }, main), aside);
}

/** The sidebar: a navigation landmark with a header, groups and a footer. */
export function sidebar({ label = 'Main', header = null, content = [], footer = null, tag = 'nav' }) {
  return el(tag, { class: 'scr-sidebar', 'aria-label': tag === 'nav' || tag === 'aside' ? label : null },
    header ? el('div', { class: 'scr-sidebar__header' }, header) : null,
    el('div', { class: 'scr-sidebar__content' }, content),
    footer ? el('div', { class: 'scr-sidebar__footer' }, footer) : null,
  );
}

/**
 * A navigation group: an optional label and a list of items. collapsible: the label is a details
 * summary, the group starts open unless `open: false`.
 * Item: { label, href, icon, current, meta, items (sub-items), open, menu: { id, items } }.
 */
export function group({ label = null, items = [], collapsible = false, open = true, id = null }) {
  const list = navList(items);
  if (collapsible && label) {
    return el('div', { class: 'scr-nav-group', 'data-collapsible': true }, el('details', { open },
      el('summary', { class: 'scr-nav__summary' }, el('span', { class: 'scr-nav__label' }, text(label)), chevron()),
      list,
    ));
  }
  const labelId = label && id ? `${id}-label` : null;
  return el('div', { class: 'scr-nav-group', role: label && labelId ? 'group' : null, 'aria-labelledby': labelId },
    label ? el('p', { class: 'scr-nav-group__label', id: labelId }, text(label)) : null,
    list,
  );
}

export function navList(items, { sub = false } = {}) {
  return el('ul', { class: sub ? 'scr-nav scr-nav--sub' : 'scr-nav' }, items.map((item) => el('li', { class: 'scr-nav__item' }, navItem(item))));
}

function navItem({ label, href = '#', icon = null, current = false, meta = null, items = null, open = false, menu = null, avatar = null }) {
  const lead = [icon ? ds.icon({ name: icon, size: 'small' }) : null, avatar];
  if (items?.length) {
    return el('details', { open: open || items.some((i) => i.current) },
      el('summary', { class: 'scr-nav__summary' }, lead, el('span', { class: 'scr-nav__label' }, text(label)), chevron()),
      navList(items, { sub: true }),
    );
  }
  const linkHtml = el('a', { class: 'scr-nav__link', href, 'aria-current': current ? 'page' : null }, lead, el('span', { class: 'scr-nav__label' }, text(label)), meta != null ? el('span', { class: 'scr-nav__meta' }, text(meta)) : null);
  if (!menu) return linkHtml;
  return el('div', { class: 'scr-nav__row' }, linkHtml, ds.dropdown({ label: 'More', emphasis: 'ghost', size: 'xsmall', id: menu.id, items: menu.items }));
}

const chevron = () => el('span', { class: 'scr-nav__chevron' }, ds.icon({ name: 'chevron_right', size: 'small' }));

/**
 * An identity row: a mark (an icon tile or an avatar), a title and a subtitle, and a menu.
 * The menu is the design system's Dropdown, beside the row (GAPS.trigger).
 */
export function identity({ icon = null, avatar = null, title, subtitle = null, menu = null }) {
  return el('div', { class: 'scr-identity' },
    icon ? el('span', { class: 'scr-tile-mark' }, ds.icon({ name: icon, size: 'small' })) : null,
    avatar ? ds.avatar({ size: 'small', shape: 'square', decorative: true, ...avatar }) : null,
    el('span', { class: 'scr-identity__text' }, el('span', { class: 'scr-identity__title' }, text(title)), subtitle ? el('span', { class: 'scr-identity__subtitle' }, text(subtitle)) : null),
    menu ? ds.dropdown({ emphasis: 'ghost', size: 'xsmall', ...menu }) : null,
  );
}

/** The user row of a sidebar footer and its account menu (the original's items and icons). */
export function user({ id, name = 'shadcn', email = 'm@example.com' }) {
  return identity({
    avatar: { name },
    title: name,
    subtitle: email,
    menu: {
      id,
      label: 'Account',
      items: [
        { label: 'Upgrade to Pro', icon: 'auto_awesome' },
        { part: 'separator' },
        { label: 'Account', icon: 'verified' },
        { label: 'Billing', icon: 'credit_card' },
        { label: 'Notifications', icon: 'notifications' },
        { part: 'separator' },
        { label: 'Log out', icon: 'logout' },
      ],
    },
  });
}

/** The team switcher of a sidebar header. */
export function teams({ id, teams: list = TEAMS }) {
  const [current] = list;
  return identity({
    icon: current.icon,
    title: current.name,
    subtitle: current.plan,
    menu: {
      id,
      label: 'Teams',
      items: [...list.map((t, i) => ({ label: `${t.name} (⌘${i + 1})`, icon: t.icon })), { part: 'separator' }, { label: 'Add team', icon: 'add' }],
    },
  });
}
export const TEAMS = [
  { name: 'Acme Inc', plan: 'Enterprise', icon: 'view_agenda' },
  { name: 'Acme Corp.', plan: 'Startup', icon: 'graphic_eq' },
  { name: 'Evil Corp.', plan: 'Free', icon: 'keyboard_command_key' },
];

/** The version switcher of a documentation sidebar. */
export function versions({ id, versions: list = ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'], current = list[0] }) {
  return identity({
    icon: 'view_agenda',
    title: 'Documentation',
    subtitle: `v${current}`,
    menu: { id, label: 'Version', items: list.map((v) => ({ label: `v${v}`, icon: v === current ? 'check' : null })) },
  });
}

/** The search form of a sidebar header: the design system's Search field. */
export function search({ id, placeholder = 'Search the docs...' }) {
  return el('form', { role: 'search', action: '#' }, ds.searchField({ label: 'Search', placeholder, size: 'small', id, name: 'q' }));
}

/** The header of the main column: a breadcrumb, or a title, and optional actions at the end. */
export function header({ breadcrumb = null, title = null, end = null, sticky = false }) {
  return el('header', { class: 'scr-header', 'data-sticky': sticky },
    breadcrumb ? ds.breadcrumb({ size: 'small', items: breadcrumb }) : null,
    title ? el('h1', { class: 'scr-title', 'data-size': 'small' }, text(title)) : null,
    end ? el('div', { class: 'scr-header__end' }, end) : null,
  );
}

/** The breadcrumb most shells show. */
export const BREADCRUMB = [{ label: 'Build Your Application', href: '#' }, { label: 'Data Fetching' }];

/** Placeholder content of the original shells: three tiles and a large panel, or a list of rows. */
export function placeholder({ rows = 0, heading = 'Data Fetching' } = {}) {
  const tiles = rows
    ? Array.from({ length: rows }, () => el('div', { class: 'scr-tile', 'data-size': 'row' }))
    : [el('div', { class: 'scr-tiles' }, el('div', { class: 'scr-tile' }), el('div', { class: 'scr-tile' }), el('div', { class: 'scr-tile' })), el('div', { class: 'scr-tile', 'data-size': 'large' })];
  // The original's tiles are empty; a visually hidden heading names the content region.
  return el('main', { class: 'scr-content' }, el('h1', { class: 'scr-sr' }, text(heading)), el('div', { class: 'scr-stack', 'aria-hidden': 'true' }, tiles));
}

export { join };
