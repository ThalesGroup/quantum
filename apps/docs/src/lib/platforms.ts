// Build-time access to the platform registry (specs/platforms.json): names and descriptions
// for the scopes that specs, docs and tokens carry. The site never decides what applies where.
import { memo, repoPath } from './repo';
import { FILES } from '../../../../scripts/lib/paths.mjs';
import { readFileSync } from 'node:fs';

export interface Platform {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  technologies: string[];
  sources: string[];
}

const get = memo((): any => JSON.parse(readFileSync(repoPath(FILES.platformsRegistry), 'utf8')));

export const platforms = (): Platform[] => Object.entries(get().platforms).map(([id, p]: [string, any]) => ({ id, ...p }));
export const platformName = (id: string): string => get().platforms[id]?.name ?? id;
export const inputs = (): Record<string, string> => get().inputs;

/** Items without `platforms` apply everywhere; the web is what the reference implementation can render. */
export const onWeb = (x: { platforms?: string[] }) => !x.platforms || x.platforms.includes('web');
export const scoped = (x: { platforms?: string[] }) => Array.isArray(x.platforms) && x.platforms.length > 0;

/** "iOS, Android" for a scoped item, "" for a universal one. */
export const scopeLabel = (x: { platforms?: string[] }) => (scoped(x) ? x.platforms!.map(platformName).join(', ') : '');
