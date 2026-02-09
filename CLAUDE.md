# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KfW Design Tokens — the source of truth for KfW-branded digital products. Tokens follow the W3C DTCG format and are compiled via [Style Dictionary](https://styledictionary.com/) (v5) into multiple output formats (CSS, SCSS, JS/TS, JSON, Figma/Penpot).

## Commands

```bash
nvm use                  # Switch to Node 24 (.nvmrc)
npm install              # Install dependencies

npm run build            # Full build: extended tokens first, then Style Dictionary
npm run start            # Dev mode with watch (runs both watchers concurrently)
npm run typecheck        # TypeScript type checking (tsc --noEmit)
npm run lint             # ESLint with --fix (ignores demo/)
npm run format           # Prettier on entire repo
npm run precommit        # Runs typecheck + format + lint sequentially
```

The demo app is a separate project in `demo/` with its own `package.json`:

```bash
cd demo && npm install   # Separate dependency install
cd demo && npm run dev   # Vite dev server
cd demo && npm run build # Vite production build
```

## Architecture

### Build Pipeline

1. **Extended tokens build** (`tokens/extended/build.ts`): Merges theme-specific token files (e.g., `tokens.dark.json`) with the base `tokens.json` using lodash `merge`, outputting generated JSON5 files prefixed with `gen-` (e.g., `gen-tokens.dark.json5`). These generated files are gitignored from prettier.

2. **Style Dictionary build** (`sd.config.ts`): The main config that processes tokens into platform outputs. It iterates over themes (`light` by default) and base pixel sizes (`10px` default, `16px` for third-party) to generate output variants.

### Key Directories

- `tokens/` — Source token definitions in JSON/JSON5 (W3C DTCG format with `$value`, `$type`)
- `tokens/extended/` — Theme overrides (dark mode etc.) that get merged with base tokens
- `config/` — Style Dictionary customizations (transforms, formats, shared utilities)
- `output/` — Generated build artifacts (CSS, SCSS, JS, JSON, Figma, Penpot). Not manually edited.
- `demo/` — Standalone Vite app showcasing the design tokens (separate npm project, KfW brand assets)

### Custom Style Dictionary Configuration (`config/`)

- **`config/index.ts`** — Entry point: registers transforms, formats, and a custom file header with the package version
- **`config/transform.ts`** — Custom transform groups:
  - `size/pxToRem/extended` — Converts px to rem but excludes breakpoints (which use browser default root font size) and border-radius (always px)
  - `size/fluid` — Handles `$fluid` token property for fluid/responsive values
  - `name/exclude-semantic-and-modify-this` — Strips "semantic" from paths, collapses "default" suffixes, preserves PascalCase for JS output
  - Transform groups: `css-scss/extended`, `js/extended`, `web/extended`, `figma-penpot`
- **`config/format.ts`** — Custom `json/figma-penpot` format that transforms tokens for design tool import (remaps type names, filters out layout tokens, renames fluid min/max to Mobile/Desktop)
- **`config/shared.ts`** — Utilities: `humanCase`, `getBasePxFontSize`, `formatUnitValue`, `isPascalCase`, `kebabToPascalCase`

### Output Variants

Tokens are built with two `basePxFontSize` values:

- **10px** (default) — `output/css/`, `output/scss/`, `output/js/`, `output/json/`
- **16px** (third-party) — `output/web_thirdparty_16px/` (CSS, SCSS, JS only) + `output/figma/` and `output/penpot/`

All CSS variables use the `kfw` prefix (e.g., `--kfw-color-primary`).

## Code Style

- TypeScript with strict ESLint (recommended + strict + stylistic configs)
- Prettier: no semicolons, double quotes, no trailing commas, 150 char print width
- Token prefix: `kfw`
