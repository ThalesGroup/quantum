# Accessibility

Trusted sources, citations, role profiles and what `pnpm check` enforces. Part of the agent guide: start from the root `AGENTS.md`.

## Accessibility

Accessibility statements (behaviour, rendering, keyboard, naming, usage rules) come **only from
trusted sources**, and every statement **cites** them. The target is **WCAG 2.2 level AA**;
AAA criteria may be cited as extra quality but are not mandatory.

- **Trusted sources** are listed with their URL prefixes in `packages/components/specs/a11y/sources.json`: W3C
  (WCAG 2.2 and its Understanding/Techniques, WAI-ARIA, APG, AccName, HTML-AAM, Core-AAM,
  ARIA in HTML, WAI tutorials), WHATWG HTML, MDN, RGAA, EN 301 549, Apple and Android/Material
  platform guidelines, and the Orange accessibility guidelines. A URL outside these prefixes
  fails `pnpm check`.
- **Platform statements** cite the platform's own trusted source: Apple HIG for iOS (and
  macOS), Android developers and Material for Android. A guideline with `platforms` is checked
  like any other; the site groups guidelines by platform.
- **Verify before citing.** Open the page, confirm it says what you claim and that the anchor
  exists. If no trusted source supports a claim, reword it to what the sources say or drop it.
  Never cite from memory.
- **Spec contract.** `accessibility` holds `ariaRole`, `name`, `keyboard[]` and `guidelines[]`;
  each carries `refs`: `wcag:<sc>` (resolved against `packages/components/specs/a11y/wcag.json`, generated from the
  W3C's own data) or the id of an entry in `accessibility.references[]`. Parts that are pure
  decoration are `decorative: true`.
- **Role profiles.** `packages/components/specs/a11y/roles.json` states what a component role obliges: ARIA role,
  accessible name, keys, focusability, the WCAG criteria that must be cited, and the native web
  elements that carry the role. Each profile cites its sources. A role without a profile
  cannot be specified; write the profile first from the APG pattern and WAI-ARIA.
- **Docs.** The Accessibility section explains *why*, and links the trusted sources behind each
  explanation. Every WCAG criterion it links must be cited in the spec.
- **Foundations.** A foundation's `accessibility.guidelines[]` and `contrast[]` follow the same
  citation rules (no role profile: a foundation is not a component). Its contrast pairs are
  computed from the resolved tokens in every platform × mode and fail under their minimum.
- **What `pnpm check` enforces:** uncited statements, untrusted URLs, unknown or removed WCAG
  criteria; the role profile (ARIA role, name, keys, `focus-visible` state, required criteria);
  the rendered HTML (native element with the role, native boolean attributes, `aria-hidden` on
  decorative parts, a non-empty accessible name); the CSS (`:focus-visible` for focusable roles,
  native pseudo-class next to every forced state, `prefers-reduced-motion` when anything
  animates); the docs (sourced Accessibility section consistent with the spec). Checks cannot
  prove everything (contrast of real token pairs, screen reader output): review those on the
  site and cite the criterion.
