# Specs interoperability

Export to and import from Nathan Curtis' Specs format. Part of the agent guide: start from the root `AGENTS.md`.

## Specs interoperability

Nathan Curtis' [Specs](https://www.specsplugin.com/schema/) format (npm
`@directededges/specs-schema`, CC BY 4.0) describes components extracted from Figma. This
repository's spec stays the **source of truth**; Specs is an export target and an import source.
`scripts/lib/specs-bridge.mjs` holds every mapping decision in tables at the top of the file.

- **Export** writes a valid Specs Component plus a `.quantum.json` sidecar with what Specs has no
  slot for: accessibility, content, implementations, changelog, part metadata and tokens
  without a Specs style (focus outline, transition). Our property metadata and each token's
  exact path travel inside Specs `$extensions` under the `io.quantum` key.
- **States** become a Specs prop named `state` (interaction and system states); a state set
  through a boolean property stays that boolean and appears in `invalidPropCombinations`.
  `state` is therefore a reserved property id.
- **Import** with the sidecar restores the spec and tokens exactly. Without it (a
  Figma-generated file) it infers anatomy, properties, states and token paths, and leaves
  prose empty.
- **Upgrading Specs**: the schema version is pinned exactly in `package.json`. To move, read
  the new ADRs in the [Specs ADR index](https://github.com/DirectedEdges/specs/blob/main/adr/INDEX.md),
  bump the version, run `pnpm specs:check`, then adjust the tables in `specs-bridge.mjs` and
  the tests in `scripts/test/specs-bridge.test.mjs` until it passes.
- A `specs:check` error on a valid spec is a bridge limitation, not a spec error: fix the
  mapping, never the spec.
- Foundations (`packages/components/specs/foundations/`) are not exported: Specs describes components. Their
  tokens travel with every component that aliases them.
