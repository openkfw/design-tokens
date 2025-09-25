# KfW Design Tokens

![KfW Design Tokens](/kfw-design-tokens.png)

KfW Design Tokens is the source of truth for designing KfW-branded digital products. By default, it's built to align with our corporate brand and design but allows for customization to fit your particular product.
The tokens follow a template that complies with the <a href="https://tr.designtokens.org/">W3C DTCG format</a>.

**Note: The Design Tokens are still in the pilot phase.** This means that they are currently being tested and evaluated for functionality and usability. Feedback from users during this phase is crucial for making improvements and ensuring that the tokens meet the needs of all stakeholders before a full stable release.

The documentation on how to use design tokens is available [internally only](https://brand-guide.kfw.de/document/85/de#/user-interface/user-interface).
If you have any questions or need assistance, please reach out to our "Design System & Tokens Community" in the internal Webex channel.

![Design Tokens badge](https://img.shields.io/badge/openkfw-design--tokens-005a8c) [![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen)](./LICENSE) ![GitHub repo size](https://img.shields.io/github/repo-size/openkfw/design-tokens.svg?style=flat-square) ![GitHub package.json version ](https://img.shields.io/github/package-json/v/openkfw/design-tokens) [![NPM package](https://img.shields.io/npm/v/@openkfw/design-tokens.svg)](https://www.npmjs.com/package/@openkfw/design-tokens)

## Customizing KfW Design Tokens for open source

Although the source code for KfW Design Tokens is free and available under the MPL 2.0 License, KfW fully reserves all rights to the KfW brand. To prevent users from getting confused about the source of a digital product or experience, there are strict restrictions on using the KfW brand and design, even when built into code that we provide. For any customization other than explicitly for the KfW, you must replace the KfW theme. To use KfW Design Tokens as open source software and customize it, please follow the instructions.

## 🚀 Installation with NPM

Run the following command to install the Design Tokens:

```bash

npm i -D @openkfw/design-tokens
```

Import or use files inside the `output` folder, e.g.:

```css
@import url("@openkfw/design-tokens/output/web_stable_10px/css/kfw-design-tokens.light.css");
```

## ❤️ Contributing

Our commitment to open source encourages contributions from everyone.

## 📒 Licensing

Copyright (c) 2025 KfW

Licensed under the **Mozilla Public License 2.0 (MPL-2.0)** (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License by reviewing the file [LICENSE](./LICENSE) in the repository. Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for the specific language governing permissions and limitations under the License.

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

### How to use breakpoint design tokens width @media and Tailwind CSS?

In Tailwind CSS v3, you can define breakpoints directly in your `tailwind.config.js` using JavaScript.  
In Tailwind CSS v4, you can either use the <a href="https://v3.tailwindcss.com/docs/using-with-preprocessors#using-sass-less-or-stylus">SCSS preprocessor</a> with variables for breakpoints, or use the standard CSS version with the workaround described above.

### How to use KfW Design Tokens with AI?

You can integrate `KfW Design Tokens` with AI tools like [Google Stitch](https://stitch.withgoogle.com/)
by providing prompts that include specific token values. This helps generate designs aligned with KfW's branding, including colors, typography, and spacing.

Example prompt:

```
Create a modern website design that aligns with the KfW brand provided by KfW Design Tokens:

https://github.com/openkfw/design-tokens/blob/main/output/web_stable_10px/css/kfw-design-tokens.light.css
(Copy the CSS from the link above and paste it here)
```
