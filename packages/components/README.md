# @quantum-ds/components

[![npm version](https://img.shields.io/npm/v/@quantum-ds/components)](https://www.npmjs.com/package/@quantum-ds/components)

> [!WARNING]
> **Experimental: Quantum NextGen.** This package belongs to Quantum NextGen, the next major version of the Quantum Design System, developed on the [`nextgen`](https://github.com/ThalesGroup/quantum/tree/nextgen) branch. It is experimental: the specifications and their schema may change or break in any release, without notice. Do not use it in production.

The components of the [Quantum Design System](https://github.com/ThalesGroup/quantum) as technology-agnostic specifications, in JSON. The design decisions they rely on are the tokens of [`@quantum-ds/tokens`](../tokens).

Each component is described by a **specification** (`specs/components/<id>.spec.json`): what it is (its role), its anatomy (parts with roles), its properties and options, its states, its layout, its accessibility contract (every statement cited from a trusted source, WCAG 2.2 AA), its content rules, its examples, and the decision log that led there. **Foundations** (`specs/foundations/`) are the rules every component follows: color, typography, spacing, shape, effects, motion, iconography, the focus ring, code colors.

## Usage

```sh
pnpm add @quantum-ds/components@alpha
```

```js
import button from '@quantum-ds/components/components/button.spec.json' with { type: 'json' };
import schema from '@quantum-ds/components/schema/component.schema.json' with { type: 'json' };
```

The package ships the specifications only: `components/<id>.spec.json`, `foundations/<id>.spec.json` (with the code samples the Code foundation shows), the JSON Schemas they validate against (`schema/`), the accessibility registry (`a11y/`: trusted sources, WCAG 2.2 criteria, role profiles) and the platform vocabulary (`platforms.json`). They are the input of every implementation: a framework or a native platform implements what they say and consumes the tokens of its platform from `@quantum-ds/tokens`.

### Reference implementation

The repository also holds a web reference implementation of every component in `src/` (plain CSS reading only the component's tokens, and a pure HTML template per component). It is not published: it renders the components on the documentation site and serves as an example of an implementation of the specifications.

## Development

The sources are in `specs/`; `pnpm components:build` (run by `pnpm build` and before packing) copies them to `dist/`, which is what the package publishes. From the root of the monorepo, `pnpm check` validates every specification against its schema and against the tokens, the docs and the web implementation, and `pnpm new:component <id> --name "Name" --role <role>` scaffolds a new component. [AGENTS.md](AGENTS.md) holds the rules of the web implementation, [specs/AGENTS.md](specs/AGENTS.md) those of the specifications; the change workflow is in the root [AGENTS.md](../../AGENTS.md) and [`agents/`](../../agents/).

## License

[MIT](LICENSE).
