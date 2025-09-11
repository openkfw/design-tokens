# KfW Design Tokens

![KfW Design Tokens](/kfw-design-tokens.png)

KfW Design Tokens is the source of truth for designing KfW-branded digital products. By default, it's built to align with our corporate brand and design but allows for customization to fit your particular product.
The tokens follow a template that complies with the <a href="https://tr.designtokens.org/">W3C DTCG format</a>.

**Note: The Design Tokens are still in the pilot phase.** This means that they are currently being tested and evaluated for functionality and usability. Feedback from users during this phase is crucial for making improvements and ensuring that the tokens meet the needs of all stakeholders before a full stable release.

The documentation on how to use design tokens is available [internally](https://brand-guide.kfw.de/document/85/de#/user-interface/user-interface) only.
If you have any questions or need assistance, please reach out to our "Design System & Tokens Community" in the internal Webex channel.

![Design Tokens badge](https://img.shields.io/badge/openkfw-design--tokens-005a8c) [![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen)](./LICENSE) ![GitHub repo size](https://img.shields.io/github/repo-size/openkfw/design-tokens.svg?style=flat-square) ![GitHub package.json version ](https://img.shields.io/github/package-json/v/openkfw/design-tokens) [![NPM package](https://img.shields.io/npm/v/@openkfw/design-tokens.svg)](https://www.npmjs.com/package/@openkfw/design-tokens)

## Customizing KfW Design Tokens for open source

Although the source code for KfW Design Tokens is free and available under the MPL 2.0 License, KfW fully reserves all rights to the KfW brand. To prevent users from getting confused about the source of a digital product or experience, there are strict restrictions on using the KfW brand and design, even when built into code that we provide. For any customization other than explicitly for the KfW, you must replace the KfW theme. To use KfW Design Tokens as open source software and customize it, please follow the instructions.

## 🚀 Installation with NPM

Run the following command to install the Design Tokens:

```bash
npm install @openkfw/design-tokens
```

Import or use files inside the `output` folder, e.g.:

```css
@import url("@openkfw/design-tokens/output/web_stable_10px/css/kfw-design-tokens.light.css");
```

## ❤️ Contributing

Our commitment to open source means that we are enabling - even encouraging - all interested parties to contribute.

## 📒 Licensing

Copyright (c) 2025 KfW

Licensed under the **Mozilla Public License 2.0 (MPL-2.0)** (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License by reviewing the file [LICENSE](./LICENSE) in the repository. Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for the specific language governing permissions and limitations under the License.

## 💁 FAQ

### How can I use breakpoint design tokens in Tailwind CSS?

In Tailwind CSS v3, you can easily add breakpoints by defining them in your tailwind.config.js file using JavaScript. In Tailwind CSS v4, if you want to use CSS variables with breakpoints, you may need to utilize a preprocessor like <a href="https://v3.tailwindcss.com/docs/using-with-preprocessors#using-sass-less-or-stylus">Sass</a>, as CSS variables and breakpoints do not work seamlessly together in that version.
