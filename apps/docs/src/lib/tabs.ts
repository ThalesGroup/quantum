// Pages of a component. The component is agnostic first: its specification and its decision log
// are shared by every platform, and each platform (specs/platforms.json) has its own pages with
// only its own content, the web first (/components/<id>), the others under /components/<id>/<platform>.
// Each page is its own static route, so switching loads its own content instead of scrolling a
// long page. A platform's first tab is its first page (no slug): Examples on the web, Guidelines
// elsewhere.
export const SHARED_TABS = [
  { slug: 'spec', label: 'Specification' },
  { slug: 'decisions', label: 'Decisions' },
] as const;

// `web: true`: a tab of the web only, what the reference rendering draws (the only rendering these
// docs have: no native one is drawn or approximated); `web: false`: a tab of the other platforms only.
export const PLATFORM_TABS = [
  { id: 'examples', label: 'Examples', web: true },
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'states', label: 'States matrix', web: true },
  { id: 'playground', label: 'Playground', web: true },
  { id: 'tokens', label: 'Tokens' },
  { id: 'code', label: 'Code', web: true },
  { id: 'develop', label: 'Develop', web: false },
] as const;

export type PlatformTab = (typeof PLATFORM_TABS)[number] & { slug: string | undefined };

/** The tabs of a platform, its first page first (slug undefined); Guidelines only when the component has guidelines. */
export const platformTabs = (platform: string, guidelines: boolean): PlatformTab[] =>
  PLATFORM_TABS.filter((t) => (!('web' in t) || t.web === (platform === 'web')) && (t.id !== 'guidelines' || guidelines)).map((t, i) => ({ ...t, slug: i ? t.id : undefined }));

/** URL of a component page: a shared tab (platform null, the tab's slug) or a tab of a platform (the tab's id). */
export const componentHref = (base: string, id: string, platform: string | null, tab?: string) => {
  const slug = platform && tab ? platformTabs(platform, true).find((t) => t.id === tab)?.slug : tab;
  return `${base}/components/${id}${platform && platform !== 'web' ? `/${platform}` : ''}${slug ? `/${slug}` : ''}`;
};

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
