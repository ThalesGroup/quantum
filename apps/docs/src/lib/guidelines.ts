// Platform sections of a component's guidelines. A `### <Platform name>` sub-heading scopes the
// paragraphs under it to that platform (specs/platforms.json); everything else applies everywhere.
// A platform page shows the shared guidance and its own sections only.
import { platforms } from './platforms';

interface Chunk {
  level: number;
  text: string;
  html: string;
}

const HEADING = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g;
const textOf = (html: string) => html.replace(/<[^>]+>/g, '').trim();

/** The rendered HTML cut at every heading: the text before the first one, then one chunk per heading. */
function chunks(html: string): Chunk[] {
  const out: Chunk[] = [];
  let last = 0;
  let open: Chunk = { level: 0, text: '', html: '' };
  for (const m of html.matchAll(HEADING)) {
    open.html = html.slice(last, m.index);
    out.push(open);
    open = { level: Number(m[1]), text: textOf(m[2]), html: '' };
    last = m.index!;
  }
  open.html = html.slice(last);
  out.push(open);
  return out;
}

/** Platform id of a `###` heading naming a platform, or null. */
function platformOf(chunk: Chunk): string | null {
  if (chunk.level !== 3) return null;
  return platforms().find((p) => p.name === chunk.text)?.id ?? null;
}

/** The guidelines without the sections of the other platforms. */
export function guidelinesFor(html: string, platform: string): string {
  let skipping = false;
  let out = '';
  for (const c of chunks(html)) {
    if (skipping && c.level && c.level <= 3) skipping = false;
    const scope = platformOf(c);
    if (scope && scope !== platform) {
      skipping = true;
      continue;
    }
    if (!skipping) out += c.html;
  }
  return out;
}

/** Number of sections scoped to each platform, by platform id. */
export function platformSections(html: string): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(platforms().map((p) => [p.id, 0]));
  for (const c of chunks(html)) {
    const scope = platformOf(c);
    if (scope) counts[scope]++;
  }
  return counts;
}
