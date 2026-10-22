// Build-time access to the accessibility registry (specs/a11y/) through the same library the
// validator uses, so the site shows exactly the sources `pnpm check` accepted.
// @ts-ignore - plain ESM without types
import { loadA11y, resolveRef, citedCriteria } from '../../../../scripts/lib/a11y.mjs';
import { memo, repoRoot } from './repo';

export interface Citation {
  ref: string;
  title: string;
  url: string;
  publisher: string | null;
  kind: string | null;
}

export interface Criterion {
  sc: string;
  title: string;
  level: string | null;
  url: string;
  inTarget: boolean;
}

const getRegistry = memo((): any => loadA11y(repoRoot));

export function conformanceTarget(): { standard: string; version: string; level: string } {
  return getRegistry().sources.conformanceTarget;
}

export function cite(refs: string[] | undefined, spec: any): Citation[] {
  return (refs ?? []).map((r) => resolveRef(r, spec, getRegistry())).filter(Boolean);
}

export function criteriaOf(spec: any): Criterion[] {
  return citedCriteria(spec, getRegistry());
}

export function publisherName(id: string | null): string {
  return id ? getRegistry().sources.publishers[id]?.name ?? id : 'untrusted';
}
