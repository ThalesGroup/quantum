import { ds, el, slot, screen } from '../lib/ds.mjs';
import { shell, sidebar, header, placeholder, BREADCRUMB, GAPS, CHANGES } from '../lib/shell.mjs';
import { DOCS_NAV } from './data/docs-nav.mjs';
import { home } from './data/home-nav.mjs';

/** shadcn/ui block sidebar-06: A sidebar with submenus as dropdowns. */
export const meta = {
  block: 'sidebar-06',
  name: 'Sidebar with submenus as dropdowns',
  section: 'application-shell',
  description: 'A sidebar with submenus as dropdowns.',
  changes: [
    CHANGES.collapse,
    CHANGES.rail,
    'The email field of the opt-in form shows its "Email" label (the original only has a placeholder), and the browser requires a value before subscribing.',
  ],
  gaps: [
    GAPS.collapse,
    GAPS.navigation,
    { text: 'Each submenu is a Dropdown whose trigger is a Button sized to its label, ending with the Dropdown\'s expand icon: it cannot span the sidebar row or show the "More" icon at its end.' },
    { text: 'The Dropdown menu always opens below its trigger: it has no placement option to open to the right of the sidebar as the original does.' },
    { text: 'The Card has no content part: the opt-in form is placed inside the Card root after its title and description.' },
  ],
};

export function render() {
  const optIn = slot(
    ds.card({ title: 'Subscribe to our newsletter', description: 'Opt-in to receive updates and news about the sidebar.', headingLevel: 2 }),
    el('form', { class: 'scr-form', action: '#', method: 'post' }, el('div', { class: 'scr-stack' },
      ds.textField({ label: 'Email', placeholder: 'Email', size: 'small', required: true, id: 'sidebar-06-email', name: 'email', attrs: { autocomplete: 'email', inputmode: 'email' } }),
      ds.button({ label: 'Subscribe', size: 'small', type: 'submit' }),
    )),
  );
  return screen({},
    shell({
      sidebar: sidebar({
        label: 'Documentation',
        header: home(),
        content: el('div', { class: 'scr-nav-group' }, el('ul', { class: 'scr-nav' }, DOCS_NAV.slice(0, 4).map((g, i) => el('li', { class: 'scr-nav__item' },
          ds.dropdown({ label: g.label, emphasis: 'ghost', size: 'small', id: `sidebar-06-menu-${i}`, items: g.items.map(({ label, href }) => ({ label, href })) }),
        )))),
        footer: optIn,
      }),
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
    }),
  );
}
