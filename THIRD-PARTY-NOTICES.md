# Third-party notices

The code in this repository is licensed under the [MIT License](LICENSE) and the documentation under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), with the exception of the material listed here, which comes from other projects and keeps the license of its origin. Each notice below is reproduced as its license requires; it travels with the files it covers, in the repository, in the documentation site built from it, and in any copy or fork of either.

## shadcn/ui blocks (screens)

The screens in [`apps/docs/screens/shadcn-ui/`](apps/docs/screens/shadcn-ui/) are adapted from the blocks of [shadcn/ui](https://ui.shadcn.com/blocks) ([repository](https://github.com/shadcn-ui/ui), commit `0132174664c07d41262fb51012d0cc782e458e6c`): their page structure, their text and their sample data (navigation trees, dashboard figures) are rebuilt with Quantum's own components and tokens. Their visual design, Tailwind classes, fonts, icons, images and logos are not reused.

shadcn/ui is licensed under the MIT License, Copyright (c) 2023 shadcn. The full license text is kept verbatim in [`apps/docs/screens/shadcn-ui/LICENSE.md`](apps/docs/screens/shadcn-ui/LICENSE.md), and [`source.json`](apps/docs/screens/shadcn-ui/source.json) next to it records the origin, the commit and the copyright notice. The documentation site shows this attribution on every screen and renders the license text on its "Sources and licences" page. The adapted screens remain under the MIT License (including as part of the documentation): the CC BY 4.0 license of the documentation does not apply to them.

## Chromium vision deficiency filters (docs site)

The vision simulation of the playground in [`apps/docs/src/components/Playground.astro`](apps/docs/src/components/Playground.astro) uses the SVG filter definitions of Chromium's "Emulate vision deficiencies" feature (`third_party/blink/renderer/core/css/vision_deficiency.cc`), whose color matrices come from Machado, Oliveira and Fernandes, "A Physiologically-based Model for Simulation of Color Vision Deficiency" (2009).

Chromium is licensed under the BSD 3-Clause License:

```
Copyright 2015 The Chromium Authors

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
   * Neither the name of Google LLC nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## W3C WCAG 2.2 data (accessibility registry)

[`packages/components/specs/a11y/wcag.json`](packages/components/specs/a11y/wcag.json) is generated from the W3C's machine-readable [WCAG 2.2](https://www.w3.org/WAI/WCAG22/wcag.json) (the number, title, level and Understanding slug of every success criterion). Web Content Accessibility Guidelines (WCAG) 2.2, W3C Recommendation, Copyright © World Wide Web Consortium, used under the [W3C Document License](https://www.w3.org/copyright/document-license/). The specifications and guidelines cite WCAG, WAI-ARIA, the ARIA Authoring Practices Guide and other W3C and WHATWG documents by URL; they do not reproduce them.

## Specs format (Specs bridge)

`pnpm specs:check` exports the component specifications to the Specs format by Nathan Curtis / Directed Edges ([schema](https://www.specsplugin.com/schema/), npm package `@directededges/specs-schema`, licensed under CC BY 4.0), used as a development dependency for validation only. Nothing from it is redistributed in the published packages.

## Fonts and icons

The webfonts the tokens name (Inter, Fragment Mono, Material Symbols Outlined) are loaded from Google Fonts by [`packages/components/src/fonts.css`](packages/components/src/fonts.css) and are not redistributed in this repository. Inter and Fragment Mono are available under the SIL Open Font License 1.1; Material Symbols under the Apache License 2.0.
