// Pages of a component. The component is agnostic first: its specification and its decision log
// are shared by every platform, and each platform (specs/platforms.json) has its own pages with
// only its own content, the web first (/components/<id>), the others under /components/<id>/<platform>.
// Each page is its own static route, so switching loads its own content instead of scrolling a
// long page. `slug` undefined is the platform's first page.
export const SHARED_TABS = [
  { slug: 'spec', label: 'Specification' },
  { slug: 'decisions', label: 'Decisions' },
] as const;

// `web`: true for a tab of the web only, false for one of the other platforms only.
export const PLATFORM_TABS = [
  { slug: undefined, label: 'Examples' },
  { slug: 'guidelines', label: 'Guidelines' },
  { slug: 'states', label: 'States matrix' },
  { slug: 'playground', label: 'Playground' },
  { slug: 'tokens', label: 'Tokens' },
  { slug: 'code', label: 'Code', web: true },
  { slug: 'develop', label: 'Develop', web: false },
] as const;

export type PlatformTab = (typeof PLATFORM_TABS)[number];

/** The tabs of a platform; Guidelines only when the component has guidelines. */
export const platformTabs = (platform: string, guidelines: boolean) =>
  PLATFORM_TABS.filter((t) => (!('web' in t) || t.web === (platform === 'web')) && (t.slug !== 'guidelines' || guidelines));

/** URL of a component page: a shared tab (platform null) or a tab of a platform. */
export const componentHref = (base: string, id: string, platform: string | null, tab?: string) =>
  `${base}/components/${id}${platform && platform !== 'web' ? `/${platform}` : ''}${tab ? `/${tab}` : ''}`;

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
