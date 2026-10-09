# Changelog

All notable changes to this project will be documented in this file.

> [!WARNING]
> `@quantum-ds/tokens` is not yet published on npm. Until it is, you can build the tokens from this repository with `pnpm build` and use the generated `dist/` directory.

> [!NOTE]
> 1.10.0 is the first open source version of `@quantum-ds/tokens`. Previous versions were only released internally at Thales and are not publicly available.

## 1.10.0

### Added

- Added Dataviz tokens to the DTCG source:
  - `color.extended.tokens.json`, including Dataviz raw colors.
  - Dataviz semantic tokens for light and dark themes:
    - `dtcg/component/dataviz.tokens.json`
    - `dtcg/component/dataviz-dark.tokens.json`
  - Registered Dataviz tokens in the build configuration and Quantum resolver.

### Fixes

- Fixed token JSON generation for nested paths with repeated segment names.
