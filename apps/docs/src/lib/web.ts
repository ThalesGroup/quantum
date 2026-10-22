// Web implementation templates: one ESM module per component, discovered from ../web/components.
export interface Template {
  meta?: { id: string; selector: string; icons?: string[] };
  render: (props: Record<string, unknown>) => string;
}

const modules = import.meta.glob<Template>('../../../../packages/components/src/components/*/*.template.mjs', { eager: true });

export function getTemplate(id: string): Template | null {
  const key = Object.keys(modules).find((k) => k.endsWith(`/${id}/${id}.template.mjs`));
  return key ? modules[key] : null;
}

/** Default props for a spec: property defaults, plus the first example's values for required/unbound props. */
export function defaultProps(spec: any): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const p of spec.properties) if (p.default !== undefined) props[p.id] = p.default;
  const first = spec.examples?.[0]?.props ?? {};
  for (const p of spec.properties) if (props[p.id] === undefined && first[p.id] !== undefined) props[p.id] = first[p.id];
  return props;
}
