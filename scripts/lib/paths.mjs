/**
 * The layout of the monorepo: where every artifact lives, relative to the repository root.
 * Every script, every test and the docs site take their paths from here, so moving a directory
 * is one edit. Keep it in sync with the repository map of agents/model.md.
 */
export const PATHS = {
  /** The @quantum-ds/tokens package: tokens.config.json, the DTCG sources and the generated outputs. */
  tokens: 'packages/tokens',
  tokensSrc: 'packages/tokens/src',
  tokensDist: 'packages/tokens/dist',
  tokensCss: 'packages/tokens/dist/css',
  platforms: 'packages/tokens/dist/platforms',
  shikiTheme: 'packages/tokens/dist/shiki-theme.json',
  /** The local export of the private Figma library: git ignores it, so it may be absent. */
  rawContent: 'raw_content',
  /** The @quantum-ds/components package: the specifications (published) and the web reference implementation (repository only). */
  components: 'packages/components',
  specs: 'packages/components/specs',
  /** What @quantum-ds/components publishes: the specs, built by scripts/build-components.mjs (not committed). */
  componentsDist: 'packages/components/dist',
  web: 'packages/components/src',
  /** The @quantum-ds/figma package: the Figma plugin drawing the components, its blueprints, and the plugin it builds (dist/, not committed). */
  figma: 'packages/figma',
  figmaDist: 'packages/figma/dist',
  /** The @quantum-ds/penpot package: the Penpot plugin drawing the components from the Figma blueprints, and the plugin it builds (dist/, not committed). */
  penpot: 'packages/penpot',
  penpotDist: 'packages/penpot/dist',
  /** The docs app (apps/docs): the Astro site, the Markdown guidelines and the screens. */
  docs: 'apps/docs',
  docsSrc: 'apps/docs/src',
  content: 'apps/docs/content',
  screens: 'apps/docs/screens',
  /** The agent guides rendered on the site's "How it works" page. */
  agents: 'agents',
};

/** The four artifacts of a component, plus the generated token CSS, as repository-relative paths. */
export const artifacts = (id) => ({
  spec: `${PATHS.specs}/components/${id}.spec.json`,
  tokens: `${PATHS.tokensSrc}/components/${id}.tokens.json`,
  generated: `${PATHS.tokensCss}/components/${id}.css`,
  css: `${PATHS.web}/components/${id}/${id}.css`,
  template: `${PATHS.web}/components/${id}/${id}.template.mjs`,
  docs: `${PATHS.content}/components/${id}.md`,
  /** The Figma layer tree of the component (@quantum-ds/figma), read from its CSS and template. */
  figma: `${PATHS.figma}/src/blueprints/${id}.mjs`,
});

/** The artifacts of a foundation. */
export const foundationArtifacts = (id) => ({
  spec: `${PATHS.specs}/foundations/${id}.spec.json`,
  samples: `${PATHS.specs}/foundations/${id}`,
  docs: `${PATHS.content}/foundations/${id}.md`,
});

/** The files every script reads by name. */
export const FILES = {
  tokensConfig: `${PATHS.tokens}/tokens.config.json`,
  styleDictionaryConfig: `${PATHS.tokens}/style-dictionary.config.mjs`,
  /** The Penpot token file (sets and themes) the token build publishes; the Penpot plugin writes its tokens from it. */
  penpotTokens: `${PATHS.tokensDist}/penpot/tokens.json`,
  componentSchema: `${PATHS.specs}/schema/component.schema.json`,
  foundationSchema: `${PATHS.specs}/schema/foundation.schema.json`,
  platformsRegistry: `${PATHS.specs}/platforms.json`,
  /** The design tools the exports target and how far their releases have been reviewed (agents/design-tools.md). */
  designTools: `${PATHS.agents}/design-tools.json`,
  a11y: `${PATHS.specs}/a11y`,
  tokensIndexCss: `${PATHS.tokensCss}/index.css`,
  webIndexCss: `${PATHS.web}/index.css`,
  webFontsCss: `${PATHS.web}/fonts.css`,
  templateUtils: `${PATHS.web}/lib/template-utils.mjs`,
  siteCss: `${PATHS.docsSrc}/styles/site.css`,
  screensCss: `${PATHS.screens}/screens.css`,
  screensSections: `${PATHS.screens}/sections.json`,
  screensDs: `${PATHS.screens}/lib/ds.mjs`,
};
