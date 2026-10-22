// Screens (apps/docs/screens): real-world pages rebuilt with the design system. The modules come through
// import.meta.glob (Vite tracks them), the registries through fs (memoized, reloaded by
// integrations/repo-sources.mjs). The site renders them; it never decides what they contain.
import { getCollection } from 'astro:content';
import { memo, readRepoFile, repoPath } from './repo';
import fs from 'node:fs';
import { screenComponents } from '../../../../scripts/lib/screens.mjs';
import { PATHS, FILES } from '../../../../scripts/lib/paths.mjs';

/** What the design system lacks to render the original; `issues` may list the issues tracking it. */
export interface Gap { text: string; issues?: number[] }
export interface ScreenMeta { block: string; name: string; section: string; description: string; changes: string[]; gaps: Gap[] }
export interface Source {
  id: string; name: string; description: string; url: string; repository: string; commit: string; retrieved?: string;
  license: { id: string; name: string; url: string; copyright: string; file: string };
  screenUrl?: string; codeUrl?: string; changes: string[];
}
export interface Section { id: string; name: string; description: string }
export interface Screen { id: string; source: string; block: string; meta: ScreenMeta; render: () => string }

const modules = import.meta.glob<{ meta: ScreenMeta; render: () => string }>('../../screens/*/*.screen.mjs', { eager: true });

export const getSections = memo((): Section[] => JSON.parse(readRepoFile(FILES.screensSections)).sections);

export const getSources = memo((): Source[] =>
  fs.readdirSync(repoPath(PATHS.screens), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(repoPath(PATHS.screens, e.name, 'source.json')))
    .map((e) => JSON.parse(readRepoFile(`${PATHS.screens}/${e.name}/source.json`))),
);

/** Every screen, in section order, then by block. */
export function getScreens(): Screen[] {
  const order = new Map(getSections().map((s, i) => [s.id, i]));
  return Object.entries(modules)
    .map(([file, mod]) => {
      const [, source, block] = file.match(/screens\/([^/]+)\/([^/]+)\.screen\.mjs$/)!;
      return { id: `${source}/${block}`, source, block, meta: mod.meta, render: mod.render };
    })
    .sort((a, b) => (order.get(a.meta.section) ?? Infinity) - (order.get(b.meta.section) ?? Infinity) || a.block.localeCompare(b.block, 'en', { numeric: true }));
}

export const getSource = (id: string) => getSources().find((s) => s.id === id)!;

/** The licence text of a source, verbatim. */
export const licenseText = (source: Source) => readRepoFile(`${PATHS.screens}/${source.id}/${source.license.file}`);

/** Links of a screen to its original: the live page and the code at the recorded commit. */
export function originLinks(screen: Screen) {
  const source = getSource(screen.source);
  const fill = (t?: string) => (t ? t.replaceAll('{block}', screen.block) : null);
  return { source, view: fill(source.screenUrl), code: fill(source.codeUrl) };
}

/** The components a screen renders, with their names, in name order. */
export async function componentsOf(html: string) {
  const specs = (await getCollection('specs')).map((s) => s.data);
  const used = new Set(screenComponents(html, specs.map((s: any) => s.id)));
  return specs.filter((s: any) => used.has(s.id)).sort((a: any, b: any) => a.name.localeCompare(b.name)).map((s: any) => ({ id: s.id, name: s.name }));
}

