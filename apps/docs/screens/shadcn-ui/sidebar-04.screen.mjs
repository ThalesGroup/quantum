import { screen } from '../lib/ds.mjs';
import { shell, sidebar, header, placeholder, BREADCRUMB, GAPS } from '../lib/shell.mjs';
import { DOCS_NAV } from './data/docs-nav.mjs';
import { home, sections } from './data/home-nav.mjs';

/** shadcn/ui block sidebar-04: A floating sidebar with submenus. */
export const meta = {
  block: 'sidebar-04',
  name: 'Floating sidebar with submenus',
  section: 'application-shell',
  description: 'A floating sidebar with submenus.',
  changes: [
    'The sidebar does not collapse (that needs script, and so does the trigger button): it is always shown on wide screens and stacks above the content on narrow ones. The sidebar trigger and its separator are dropped.',
    'The header of the main column keeps the bottom rule every shell header has (the original has none).',
  ],
  gaps: [GAPS.collapse, GAPS.navigation],
};

export function render() {
  // The original widens the sidebar to 19rem.
  return screen({ style: '--scr-sidebar: 19rem' },
    shell({
      variant: 'floating',
      sidebar: sidebar({
        label: 'Documentation',
        header: home(),
        content: sections(DOCS_NAV, { flat: true }),
      }),
      main: [header({ breadcrumb: BREADCRUMB }), placeholder()],
    }),
  );
}
