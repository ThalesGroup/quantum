# Changelog

All notable changes to this package will be documented in this file.

## 0.1.0-alpha.0 (unreleased)

First version of `@quantum-ds/bootstrap-theme`: the Quantum Design System for Bootstrap 6.0.0-alpha.1, generated from `@quantum-ds/tokens` 2 through Bootstrap's own theming API. `dist/quantum.css`, loaded after `bootstrap.css`, reassigns about 400 Bootstrap custom properties (theme colors, surfaces, text, borders, typography, radii, spacers, focus ring, shadow color and motion from Quantum semantic tokens; buttons, form controls, checkboxes, radios, switches, range, cards, badges, alerts, accordion, progress, spinner, pagination, breadcrumb, avatar, menu and divider from Quantum component tokens), as `light-dark()` pairs that follow Bootstrap's color modes, each with the token it comes from. `dist/quantum.scss` and `dist/scss/_quantum.scss` carry the same decisions as Bootstrap Sass maps. `dist/demo.html` shows every Bootstrap component with the theme, in light, dark or auto, and without it.
