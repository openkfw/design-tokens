# Changelog

_[0.4.2] - 2025-10-06_

- Skip pxToRem conversion for breakpoint values and any sizes below 2px.

_[0.4.1] - 2025-10-02_

- Renamed directory `output/web_next_16px` to `output/web_thirdparty_16px` for better clarity.
- Updated semantic tokens for font spacing:
  * **Note:** `fontspace.large` has changed from 15px to 30px. This is because the default spacing is 20px, and `fontspace.large` should sit above that.
  * Introduced new tokens: `fontspace.2xsmall`, `fontspace.xsmall`, `fontspace.small`, and `fontspace.large`.
- Fixed a bug with fluid font sizes at the mobile breakpoint.
- Added a semantic breakpoint token for larger desktops (<1280px): `breakpoint.desktop-large`
- Added semantic borderWidth tokens: `borderWidth` (1px), `borderWidth.large` (2px).
- Added support for AI tools such as Google Stitch:
  * Included a section on how to use AI with KfW Design Tokens.
- Added a demo integration for a sample website (work in progress)

_[0.3.0] - 2025-09-24_

- Rename semantic token `fontweight.heading` to `fontweight.bold` for more flexible usage (Headlines, Product numbers, Bold in WYSIWYG-Editors)
- Use `px` values instead of `rem` for letterspacing

_[0.2.1] - 2025-09-22_

- Adjust peerDependencies in package.json to ensure compatibility with Node 24

_[0.2.0] - 2025-09-12_

- Adjustments for Penpot 2.9 Typography, upgrade focusring handling, update docs 📑

Old way:
`border: var(--kfw-focusring-outline);`

New way:

```
border-width: var(--kfw-focusring-outline-width);
border-style: var(--kfw-focusring-outline-style);
border-color: var(--kfw-color-fn-active);
```

_[0.1.3] - 2025-08-22_

- Remove `kfw-color-accent`, use `kfw-color-line-11` for header/footer instead or `kfw-base-color-green-300`.

_[0.1.2] - 2025-08-22_

- Headline 6 spacing reduced from 20 to 10px.

_[0.1.1] - 2025-08-20_

- Initial release
