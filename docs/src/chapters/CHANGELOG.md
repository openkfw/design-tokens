# Changelog

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
