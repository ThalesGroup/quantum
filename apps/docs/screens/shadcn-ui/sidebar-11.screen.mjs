import { screen } from '../lib/ds.mjs';
import { shell, sidebar, group, header, placeholder, GAPS, CHANGES } from '../lib/shell.mjs';

/** shadcn/ui block sidebar-11: A sidebar with a collapsible file tree. */
export const meta = {
  block: 'sidebar-11',
  name: 'Sidebar with a file tree',
  section: 'application-shell',
  description: 'A sidebar with a collapsible file tree.',
  changes: [
    CHANGES.collapse,
    CHANGES.rail,
    'Files and changed files are links (the original has buttons with no action); the open file, button.tsx, is marked as the current page, as the breadcrumb says.',
    'The folder chevron follows the folder name, as in every other sidebar of the system (the original puts it first).',
  ],
  gaps: [
    GAPS.collapse,
    GAPS.navigation,
    { text: 'Folders of the file tree are native details elements on semantic tokens: there is no Disclosure or Tree view component yet.' },
  ],
};

const CHANGED = [
  { file: 'README.md', state: 'M' },
  { file: 'api/hello/route.ts', state: 'U' },
  { file: 'app/layout.tsx', state: 'M' },
];

/** The original's tree: a name, or [folder name, ...children]. */
const TREE = [
  ['app', ['api', ['hello', ['route.ts']], 'page.tsx', 'layout.tsx', ['blog', ['page.tsx']]]],
  ['components', ['ui', 'button.tsx', 'card.tsx'], 'header.tsx', 'footer.tsx'],
  ['lib', ['util.ts']],
  ['public', 'favicon.ico', 'vercel.svg'],
  '.eslintrc.json',
  '.gitignore',
  'next.config.js',
  'tailwind.config.js',
  'package.json',
  'README.md',
];

function node(item) {
  const [name, ...children] = Array.isArray(item) ? item : [item];
  if (!children.length) return { label: name, icon: 'description', href: '#', current: name === 'button.tsx' };
  return { label: name, icon: 'folder', open: name === 'components' || name === 'ui', items: children.map(node) };
}

export function render() {
  return screen({},
    shell({
      sidebar: sidebar({
        label: 'Files',
        content: [
          group({ label: 'Changes', id: 'sidebar-11-changes', items: CHANGED.map((c) => ({ label: c.file, icon: 'description', href: '#', meta: c.state })) }),
          group({ label: 'Files', id: 'sidebar-11-files', items: TREE.map(node) }),
        ],
      }),
      main: [
        header({ breadcrumb: [{ label: 'components', href: '#' }, { label: 'ui', href: '#' }, { label: 'button.tsx' }] }),
        placeholder({ heading: 'button.tsx' }),
      ],
    }),
  );
}
