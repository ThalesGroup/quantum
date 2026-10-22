// Tabs of a component page. Each tab is its own static page, so switching tabs loads its own
// content instead of scrolling a long page. `slug` undefined is /components/<id> itself.
export const COMPONENT_TABS = [
  { slug: undefined, label: 'Examples' },
  { slug: 'states', label: 'States matrix' },
  { slug: 'playground', label: 'Playground' },
  { slug: 'guidelines', label: 'Guidelines' },
  { slug: 'spec', label: 'Specification' },
  { slug: 'decisions', label: 'Decisions' },
  { slug: 'tokens', label: 'Tokens' },
  { slug: 'implementation', label: 'Web implementation' },
] as const;

// Tabs of a foundation page: the component tabs that apply to a foundation (no states matrix,
// playground or implementation), same slugs and labels, except the first: an overview drawing the
// foundation's specimens, then the components following it.
export const FOUNDATION_TABS = [
  { slug: undefined, label: 'Overview' },
  { slug: 'guidelines', label: 'Guidelines' },
  { slug: 'spec', label: 'Specification' },
  { slug: 'decisions', label: 'Decisions' },
  { slug: 'tokens', label: 'Tokens' },
] as const;
