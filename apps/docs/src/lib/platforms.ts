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

/** Items without `platforms` apply everywhere; otherwise only on the platforms listed. */
export const onPlatform = (x: { platforms?: string[] }, platform: string) => !x.platforms || x.platforms.includes(platform);

/** A state applies on a platform when it is not scoped away from it and, when it names inputs, the platform has one of them. */
export const stateOn = (s: { platforms?: string[]; inputs?: string[] }, platform: string) =>
  onPlatform(s, platform) && (!s.inputs?.length || s.inputs.some((i) => get().platforms[platform]?.inputs.includes(i)));

/** "iOS, Android" for a scoped item, "" for a universal one. */
export const scopeLabel = (x: { platforms?: string[] }) => (scoped(x) ? x.platforms!.map(platformName).join(', ') : '');
