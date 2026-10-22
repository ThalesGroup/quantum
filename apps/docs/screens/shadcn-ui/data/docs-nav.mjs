/** Sample navigation of the shadcn/ui documentation sidebars (sidebar-01 to sidebar-05), as in the original. */
const items = (...labels) => labels.map((label) => ({ label, href: '#', current: label === 'Data Fetching' }));

export const DOCS_NAV = [
  { label: 'Getting Started', items: items('Installation', 'Project Structure') },
  { label: 'Build Your Application', items: items('Routing', 'Data Fetching', 'Rendering', 'Caching', 'Styling', 'Optimizing', 'Configuring', 'Testing', 'Authentication', 'Deploying', 'Upgrading', 'Examples') },
  { label: 'API Reference', items: items('Components', 'File Conventions', 'Functions', 'next.config.js Options', 'CLI', 'Edge Runtime') },
  { label: 'Architecture', items: items('Accessibility', 'Fast Refresh', 'Next.js Compiler', 'Supported Browsers', 'Turbopack') },
  { label: 'Community', items: items('Contribution Guide') },
];
