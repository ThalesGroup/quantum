import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Markdown guidelines, one file per component, living outside the site in ../docs. */
const docs = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/components' }),
  schema: z.object({
    component: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    order: z.number().optional(),
  }),
});

/** Component specifications (schema enforced by scripts/validate.mjs, kept loose here). */
const specs = defineCollection({
  loader: glob({
    pattern: '*.spec.json',
    base: '../../packages/components/specs/components',
    generateId: ({ entry }) => entry.replace(/\.spec\.json$/, ''),
  }),
  schema: z
    .object({
      id: z.string(),
      name: z.string(),
      version: z.string(),
      status: z.enum(['draft', 'review', 'stable', 'deprecated']),
      role: z.string(),
      summary: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      anatomy: z.array(z.object({ id: z.string(), role: z.string(), required: z.boolean(), description: z.string().optional(), repeatable: z.boolean().optional(), decorative: z.boolean().optional(), parent: z.string().optional(), component: z.string().optional(), properties: z.array(z.record(z.any())).optional(), visibleIn: z.array(z.string()).optional() })),
      properties: z.array(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          type: z.string(),
          options: z.array(z.object({ value: z.string(), description: z.string().optional() })).optional(),
          default: z.any().optional(),
          required: z.boolean().optional(),
          description: z.string().optional(),
          bindsTo: z.string().optional(),
          affects: z.array(z.string()).optional(),
          of: z.array(z.string()).optional(),
        }),
      ),
      states: z.array(z.object({ id: z.string(), trigger: z.string(), description: z.string().optional(), property: z.string().optional(), platforms: z.array(z.string()).optional(), inputs: z.array(z.string()).optional(), parts: z.array(z.string()).optional() })),
      slots: z.array(z.any()).optional(),
      layout: z.record(z.any()).optional(),
      accessibility: z.record(z.any()).optional(),
      content: z.object({ guidelines: z.array(z.union([z.string(), z.object({ text: z.string(), platforms: z.array(z.string()) })])).optional() }).optional(),
      examples: z.array(z.object({ id: z.string(), name: z.string(), description: z.string().optional(), props: z.record(z.any()), platforms: z.array(z.string()).optional() })).optional(),
      tokens: z.object({ source: z.string(), prefix: z.string() }),
      implementations: z.object({
        web: z.object({
          css: z.string(),
          template: z.string(),
          selector: z.string(),
          element: z.string(),
          attributes: z.record(z.string()).optional(),
          stateAttribute: z.string().optional(),
          partSelectors: z.record(z.string()).optional(),
          rolePart: z.string().optional(),
        }),
      }).passthrough(),
      related: z.array(z.string()).optional(),
      decisions: z.array(z.object({ id: z.string(), date: z.string(), version: z.string(), area: z.string(), status: z.enum(['active', 'superseded']), text: z.string(), rationale: z.string().optional(), supersedes: z.array(z.string()).optional(), tokens: z.array(z.string()).optional(), platforms: z.array(z.string()).optional(), refs: z.array(z.string()).optional() })).optional(),
      changelog: z.array(z.object({ version: z.string(), date: z.string(), note: z.string() })).optional(),
    })
    .passthrough(),
});

/** Foundation guidelines, one file per foundation, in ../docs/foundations. */
const foundationDocs = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/foundations' }),
  schema: z.object({
    foundation: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    order: z.number().optional(),
  }),
});

const refs = z.array(z.string());
const platforms = z.array(z.string()).optional();

/** Foundation specifications: global specifications shared by every component (schema enforced by scripts/validate.mjs). */
const foundations = defineCollection({
  loader: glob({
    pattern: '*.spec.json',
    base: '../../packages/components/specs/foundations',
    generateId: ({ entry }) => entry.replace(/\.spec\.json$/, ''),
  }),
  schema: z
    .object({
      id: z.string(),
      name: z.string(),
      version: z.string(),
      status: z.enum(['draft', 'review', 'stable', 'deprecated']),
      summary: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      tokens: z.array(z.string()),
      appliesTo: z.enum(['every-component', 'focusable-components']).optional(),
      rules: z.array(z.object({ id: z.string(), name: z.string(), text: z.string(), tokens: z.array(z.string()).optional(), platforms })),
      specimens: z.array(z.object({ id: z.string(), name: z.string(), description: z.string().optional(), display: z.string(), tokens: z.array(z.string()), tier: z.enum(['raw', 'semantic']).optional() })).optional(),
      contrast: z.array(z.object({ id: z.string(), description: z.string().optional(), foreground: z.string(), backgrounds: z.array(z.string()), on: z.array(z.string()).optional(), minimum: z.number().optional(), knownIssue: z.string().optional(), refs })).optional(),
      accessibility: z.object({ guidelines: z.array(z.object({ text: z.string(), refs, platforms })), references: z.array(z.object({ id: z.string(), title: z.string(), url: z.string() })) }),
      // Component renderings or code samples (`source`, a file in specs/foundations/<id>/).
      examples: z.array(z.union([
        z.object({ id: z.string(), name: z.string(), description: z.string().optional(), component: z.string(), props: z.record(z.any()), platforms }),
        z.object({ id: z.string(), name: z.string(), description: z.string().optional(), source: z.string(), platforms }),
      ])).optional(),
      decisions: z.array(z.object({ id: z.string(), date: z.string(), version: z.string(), area: z.string(), status: z.enum(['active', 'superseded']), text: z.string(), rationale: z.string().optional(), supersedes: z.array(z.string()).optional(), tokens: z.array(z.string()).optional(), platforms, refs: refs.optional() })).optional(),
      changelog: z.array(z.object({ version: z.string(), date: z.string(), note: z.string() })),
    })
    .passthrough(),
});

export const collections = { docs, specs, foundations, foundationDocs };
