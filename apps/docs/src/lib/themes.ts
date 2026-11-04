// Framework themes (packages/<framework>-theme): the Quantum components each one maps to a
// component of its framework, read from the theme's own mapping. The site links themes, it never
// draws them: a theme's rendering is its demo page.
const mappings = import.meta.glob<any>('../../../../packages/*-theme/src/mapping.mjs', { eager: true });
const manifests = import.meta.glob<any>('../../../../packages/*-theme/package.json', { eager: true, import: 'default' });

export interface Theme {
  /** Directory of the package, e.g. "bootstrap-theme". */
  id: string;
  /** npm package name. */
  package: string;
  /** Framework the theme brings Quantum to, from the package description ("Quantum for <framework>: …"). */
  framework: string;
  /** Quantum component id -> the framework component it maps to. */
  components: Map<string, string>;
}

const dirOf = (key: string) => key.split('/packages/')[1].split('/')[0];

// Each mapping lists its components in its own shape: `equivalences[]` ({ component, bootstrap })
// or `COMPONENTS[]` ({ quantum, shadcn }): the Quantum id, then the framework's component, null
// when the framework has none (the entry says why).
const componentsOf = (mod: any): [string, string][] => {
  const list: any[] = mod.default?.equivalences ?? mod.COMPONENTS ?? [];
  return list.flatMap((e) => {
    const target = e[Object.keys(e).find((k) => !['component', 'quantum'].includes(k))!];
    return typeof target === 'string' ? [[e.component ?? e.quantum, target]] : [];
  });
};

export const themes = (): Theme[] =>
  Object.entries(mappings)
    .map(([key, mod]) => {
      const id = dirOf(key);
      const manifest = Object.entries(manifests).find(([k]) => dirOf(k) === id)?.[1] ?? {};
      const framework = /^Quantum for ([^:]+):/.exec(manifest.description ?? '')?.[1] ?? id;
      return { id, package: manifest.name ?? id, framework, components: new Map(componentsOf(mod)) };
    })
    .sort((a, b) => a.framework.localeCompare(b.framework));
