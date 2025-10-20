# KfW Design Tokens

![KfW Design Tokens](/kfw-design-tokens.png)

KfW Design Tokens is the source of truth for designing KfW-branded digital products. By default, it's built to align with our corporate brand and design but allows for customization to fit your particular product.
The tokens follow a template that complies with the <a href="https://tr.designtokens.org/">W3C DTCG format</a>.

**Note: The Design Tokens are still in the pilot phase.** This means that they are currently being tested and evaluated for functionality and usability. Feedback from users during this phase is crucial for making improvements and ensuring that the tokens meet the needs of all stakeholders before a full stable release.

![Design Tokens badge](https://img.shields.io/badge/openkfw-design--tokens-005a8c)
![Status: Pilot](https://img.shields.io/badge/status-pilot-yellow)
[![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen)](./LICENSE)
[![NPM package](https://img.shields.io/npm/v/@openkfw/design-tokens.svg)](https://www.npmjs.com/package/@openkfw/design-tokens)
![GitHub repo size](https://img.shields.io/github/repo-size/openkfw/design-tokens)

## 🎨 Customizing KfW Design Tokens for Open Source

KfW Design Tokens, along with all related documentation, components, support, and assets such as fonts, icons, and images, are intended for **internal use** only.
Although the source code for KfW Design Tokens is available under the MPL 2.0 License, this open-source release is provided solely as a **showcase**.
KfW fully reserves all rights to the KfW brand. The use of the KfW brand and design is subject to strict restrictions, even when built into code that we provide.
If you have any questions or need assistance, please reach out to our "Design System & Tokens Community" in the internal Webex channel or use the official [KfW Brand-Guide](https://brand-guide.kfw.de/document/85/de#/user-interface/user-interface).

## 🚀 Installation

Install via npm:

```bash
npm install -D @openkfw/design-tokens
```

Import tokens from the output directory, for example:

```css
@import url("@openkfw/design-tokens/output/css/kfw-design-tokens.light.css");
```

Or use the prebuilt `demo` (css-boilerplate) stylesheet:

```css
@import url("@openkfw/design-tokens/demo/dist/css/style.min.css");
```

## ❤️ Contributing

Considering supporting with your contribution? Whether you like to contribute new patterns, fix a bug, spotted a typo or have ideas for improvement - we'd love to hear from you. Our commitment to open source encourages contributions from everyone.

## 📒 License

Copyright (c) 2025 KfW Bankengruppe

Licensed under the **Mozilla Public License 2.0 (MPL-2.0)** (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License by reviewing the file [LICENSE](./LICENSE) in the repository. Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for
the specific language governing permissions and limitations under the License. KfW may update this licensing agreement at any time. This notice and permission must be
included in all copies or substantial portions of the Software.

Last updated: Nov 17, 2025

## 💁 FAQ

### How to use fluid typography with design tokens?

Fluid typography allows font sizes to scale dynamically based on the viewport size, creating a responsive and adaptable user experience. KfW Design Tokens include predefined fluid typography settings that you can directly use in your projects.

For example, you can apply the following CSS variables with clamp:

```css
h1 {
  font-size: clamp(var(--kfw-fontsize-heading-1-min), var(--kfw-fontsize-heading-1-val), var(--kfw-fontsize-heading-1-max));
}
```

This ensures that the `h1` font size adjusts fluidly between the minimum and maximum values defined in the design tokens, depending on the viewport width — the minimum value on mobile, scaling up to the maximum value on desktop.

### How to use breakpoint design tokens with @media and CSS?

Currently, CSS variables cannot be used directly in media query declarations. However, the W3C is working on the [Custom Media Specification](https://www.w3.org/TR/mediaqueries-5/#at-ruledef-custom-media).
As a workaround, you can extract your variables into @custom-media rules and generate your CSS using the PostCSS plugin `postcss-custom-media`. A sample integration can be found in the `/demo` directory.
Otherwise you can use the static `px` values provided in the design tokens.

### How to use breakpoint design tokens with @media in Tailwind CSS?

In Tailwind CSS v3, define breakpoints in your `tailwind.config.js` using JavaScript.  
In Tailwind CSS v4, you can either:

- Use the [SCSS preprocessor](https://v3.tailwindcss.com/docs/using-with-preprocessors#using-sass-less-or-stylus) and reference breakpoint variables, or
- Use the CSS version with the `postcss-custom-media` workaround described above.
