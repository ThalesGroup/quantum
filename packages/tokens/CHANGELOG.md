# Changelog

All notable changes to this project will be documented in this file.

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

### Deprecated

The following legacy outputs, deprecated since 1.8.0, are still available for backward compatibility and will be removed in a future major version:

- `dist/json/`, the original JSON tokens exported from Figma, previously used as the source of truth.
- `dist/tokens.js`, the JavaScript module still generated from `dist/json/`.

For new integrations, use the DTCG tokens in `dist/dtcg/` or the formats generated from them.
