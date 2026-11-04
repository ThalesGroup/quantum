// What the design system covers for one component on each platform, derived from the spec, the
// guidelines, the token overlays and the framework themes. The site counts; it never decides.
import { platforms, onPlatform, stateOn } from './platforms';
import { hasOverlay } from './tokens';
import { platformSections } from './guidelines';
import { themes } from './themes';

export interface PlatformCoverage {
  platform: string;
  name: string;
  /** Guideline sections of its own (`### <Platform>`); null when the component has no guidelines. */
  sections: number | null;
  examples: number;
  states: number;
  /** Accessibility statements and keyboard entries scoped to this platform (on top of the shared ones). */
  accessibility: number;
  /** Where its token values come from: the web CSS, the platform's overlay, or the base values. */
  tokens: 'css' | 'overlay' | 'base';
  /** How the docs draw it: the web reference rendering, or the wireframe. */
  rendering: 'reference' | 'wireframe';
  /** Native control recorded in the spec (`implementations.<platform>.control`); the element on the web. */
  implementation: string | null;
}

export interface Coverage {
  platforms: PlatformCoverage[];
  /** Every framework theme, with the framework component it maps this component to (null: not mapped). */
  themes: { id: string; framework: string; package: string; maps: string | null }[];
}

const own = (x: { platforms?: string[] }, p: string) => Array.isArray(x.platforms) && x.platforms.includes(p);

export function coverageOf(spec: any, guidelinesHtml: string | null): Coverage {
  const sections = guidelinesHtml ? platformSections(guidelinesHtml) : null;
  const a11y = spec.accessibility ?? {};
  return {
    platforms: platforms().map((p) => ({
      platform: p.id,
      name: p.name,
      sections: sections ? sections[p.id] ?? 0 : null,
      examples: (spec.examples ?? []).filter((x: any) => onPlatform(x, p.id)).length,
      states: spec.states.filter((s: any) => stateOn(s, p.id)).length,
      accessibility: [...(a11y.guidelines ?? []), ...(a11y.keyboard ?? [])].filter((x: any) => own(x, p.id)).length,
      tokens: p.id === 'web' ? 'css' : hasOverlay(p.id) ? 'overlay' : 'base',
      rendering: p.id === 'web' ? 'reference' : 'wireframe',
      implementation: p.id === 'web' ? `<${spec.implementations.web.element}>` : spec.implementations[p.id]?.control ?? null,
    })),
    themes: themes().map((t) => ({ id: t.id, framework: t.framework, package: t.package, maps: t.components.get(spec.id) ?? null })),
  };
}
