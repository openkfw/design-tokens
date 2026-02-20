# KfW Design Tokens

> ⚠️ **Important Usage Notice**  
> KfW Design Tokens, along with all related documentation, components, support, and assets (e.g., fonts, icons, images), are intended for **internal use only**.
> Although the source code for KfW Design Tokens is available under the MPL 2.0 License, this open-source release is provided solely as a **showcase**.
> KfW fully reserves all rights to the KfW brand. The use of the KfW brand and design is subject to strict restrictions, even when built into code that we provide.
> If you have any questions or need assistance, please reach out to our "Design System & Tokens Community" in the internal Webex channel or use the official [KfW Brand-Guide](https://brand-guide.kfw.de/document/85/de#/user-interface/user-interface).
> The use of the protected trademark "KfW" is generally not permitted. If logo usage is necessary, the logo must be requested and approved in advance by KfW via [logo@kfw.de](mailto:logo@kfw.de).

![KfW Design Tokens](/kfw-design-tokens.png)

KfW Design Tokens is the source of truth for designing KfW-branded digital products. By default, it's built to align with our corporate brand and design but allows for customization to fit your particular product.
The tokens follow a template that complies with the <a href="https://www.designtokens.org/tr/2025.10/">W3C DTCG format</a>.

![Design Tokens badge](https://img.shields.io/badge/openkfw-design--tokens-005a8c)
[![License: MPL-2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen)](./LICENSE)
[![NPM package](https://img.shields.io/npm/v/@openkfw/design-tokens.svg)](https://www.npmjs.com/package/@openkfw/design-tokens)
![GitHub repo size](https://img.shields.io/github/repo-size/openkfw/design-tokens)

## 🚀 Installation

Install via npm:

```bash
npm install -D @openkfw/design-tokens
```

Import tokens from the output directory, for example:

```css
@import url("@openkfw/design-tokens/output/css/kfw-design-tokens.light.css");
```

Or use the prebuilt `demo` (CSS boilerplate) stylesheet:

```css
/* Make sure to import fonts.css yourself before */
@import url("@openkfw/design-tokens/demo/dist/css/style.min.css");
```

## ❤️ Contributing

Considering supporting with your contribution? Whether you like to contribute new patterns, fix a bug, spotted a typo or have ideas for improvement - we'd love to hear from you. Our commitment to open source encourages contributions from everyone.

## 📒 License

Copyright (c) 2025 KfW Bankengruppe

The source code in this repository is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**.
All KfW brand assets, including logos, icons, images, fonts, and design documentation, are **excluded** and remain the property of KfW Bankengruppe.
These materials may not be used, copied, or redistributed without prior written permission.

Excluded brand-related materials include:

- trademarks, wordmarks, logos
- icons, images, fonts, and other design assets
- brand and design documentation
- all files under `/demo` directory

See the full MPL-2.0 license in [LICENSE](./LICENSE).

## 💁 FAQ

### How to use fluid typography with design tokens?

Fluid typography allows font sizes to scale dynamically based on the viewport size, creating a responsive and adaptable user experience.

KfW Design Tokens include predefined fluid typography settings that you can directly use in your projects.

For example, you can apply the following CSS variables with clamp:

```css
h1 {
  font-size: clamp(var(--kfw-fontsize-heading-1-min), var(--kfw-fontsize-heading-1-val), var(--kfw-fontsize-heading-1-max));
}
```

This ensures that the `h1` font size adjusts fluidly between the minimum and maximum values defined in the design tokens, depending on the viewport width — the minimum value on mobile, scaling up to the maximum value on desktop.

In certain situations, min and max values are not sufficient—for example, if you need fixed font sizes for mobile, tablet, and desktop (i.e., more than two breakpoints), or when using relative properties like word-spacing, letter-spacing or line-height that do not work well with clamp. In these cases, use traditional media queries:

```css
h1 {
  font-size: var(--kfw-base-fontsize-sm);
  line-height: var(--kfw-lineheight);
}

@media (--kfw-breakpoint-tablet) {
  h1 {
    font-size: var(--kfw-base-fontsize-md);
  }
}

@media (--kfw-breakpoint-desktop) {
  h1 {
    font-size: var(--kfw-base-fontsize-lg);
  }
}
```

The fluid values are calculated using the [Fluid Type Scale Calculator](https://www.fluid-type-scale.com/calculate?minFontSize=20&minWidth=600&minRatio=0.999999&maxFontSize=22&maxWidth=1280&maxRatio=1&steps=base&baseStep=base&prefix=fs&useContainerWidth=false&includeFallbacks=true&useRems=false&remValue=16&decimals=3&previewFont=Inter&previewText=Almost+before+we+knew+it%2C+we+had+left+the+ground&previewWidth=1280) based on the KfW breakpoints.

### How to use breakpoint design tokens with @media and CSS?

Currently, CSS variables cannot be used directly in media query declarations. However, the W3C is working on the [Custom Media Specification](https://www.w3.org/TR/mediaqueries-5/#at-ruledef-custom-media).
As a workaround, you can extract your variables into @custom-media rules and generate your CSS using the PostCSS plugin `postcss-custom-media`. A sample integration can be found in the `/demo` directory.
Otherwise you can use the static `px` values provided in the design tokens.

### How to use breakpoint design tokens with @media in Tailwind CSS?

In Tailwind CSS v3, define breakpoints in your `tailwind.config.js` using JavaScript.  
In Tailwind CSS v4, you can either:

- Use the [SCSS preprocessor](https://v3.tailwindcss.com/docs/using-with-preprocessors#using-sass-less-or-stylus) and reference breakpoint variables, or
- Use the CSS version with the `postcss-custom-media` workaround described above.

### How to use design tokens in Figma?

Currently, Figma does not natively support importing W3C design tokens.
Therefore, we export our design tokens into a Figma-compatible format, inspired by the approach used in the "Token Studio" plugin.

Although the Token Studio plugin offers various features, it is not required and some of its functionality comes with a cost.
As an alternative, you can use the free plugin [Token Forge](https://www.figma.com/files/team/917113827271362612/resources/community/plugin/1566133735926608173/token-forge-variables-tokens-builder?fuid=917113818148995313), which allows you to easily import our design tokens in the Figma-compatible format and use them as Figma variables.
