# KfW Design Tokens - Figma Sync Tools

Bidirectional sync tooling for KfW Design Tokens and Figma Variables.

## Overview

This directory contains the **Contract System** and **CLI tools** that enable bidirectional synchronization between W3C DTCG token files and Figma Variables.

### Architecture

```
Code ←→ Contract ←→ Figma
```

- **Contract** (`contract.json`): Tracks transformations between W3C DTCG format and Figma format
- **CLI Tools**: Validate, test, and provide alternative workflows
- **Figma Plugin** (future): Primary UI for import/export

## Contract System

The contract tracks all transformations applied during the Style Dictionary build:

- Path transformations (semantic removal, humanCase, Min→Mobile, etc.)
- Type remapping (fontsize → fontSizes)
- Value transformations (references, percentages, colors)
- Preserved metadata ($description, $fluid)

### Contract Generation

The contract is automatically generated during the build:

```bash
npm run build
```

This creates `sync/contract.json` with metadata for all exported tokens.

## CLI Tools

### Export

Regenerate Figma output + contract:

```bash
npm run sync:export
```

Runs a full Style Dictionary build and generates the contract.

### Import

Convert Figma-exported JSON back to W3C DTCG format:

```bash
npm run sync:import <figma-json-path> [options]

Options:
  --dry-run           Preview changes without writing
  --output <path>     Custom output path (default: tokens/tokens.imported.json)

Examples:
  npm run sync:import output/figma/kfw-design-tokens.light.json --dry-run
  npm run sync:import figma-export.json --output tokens/tokens.new.json
```

### Validate

Round-trip validation (source → Figma → source):

```bash
npm run sync:validate
```

Tests transformation accuracy. Exit codes:
- `0`: Perfect round-trip (no data loss)
- `1`: Acceptable differences (expected losses like excluded tokens)
- `2`: Significant data loss (review errors)

### Diff

Compare two Figma token snapshots:

```bash
npm run sync:diff <snapshot1.json> <snapshot2.json>

Examples:
  npm run sync:diff old-tokens.json new-tokens.json
  npm run sync:diff output/figma/kfw-design-tokens.light.json exported.json
```

Shows added, modified, and deleted tokens.

## Workflows

### Workflow 1: Code → Figma (via Plugin)

1. Build tokens: `npm run build`
2. Open Figma Plugin
3. Upload `output/figma/kfw-design-tokens.light.json` + `sync/contract.json`
4. Plugin creates Figma Variables with contract metadata

### Workflow 2: Figma → Code (via Plugin)

1. Open Figma Plugin
2. Export Variables (plugin uses contract from pluginData)
3. Download `kfw-design-tokens.exported.json`
4. Review and merge into `tokens/tokens.json`

### Workflow 3: Validation (CLI)

1. Make changes to tokens
2. Build: `npm run build`
3. Validate: `npm run sync:validate`
4. Review accuracy metrics

### Workflow 4: Manual Import (CLI Alternative)

If you have Figma JSON without using the plugin:

```bash
npm run sync:import figma-export.json --dry-run
# Review output
npm run sync:import figma-export.json --output tokens/tokens.imported.json
# Merge manually
```

## Files

- `contract.json` - Generated contract (gitignored)
- `contract.schema.json` - JSON schema for contract validation
- `package.json` - Sync-specific dependencies
- `tsconfig.json` - TypeScript configuration
- `cli/` - CLI tool implementations
- `lib/` - Core libraries (contract generation, reverse transforms)
- `test/` - Test fixtures and unit tests

## Transformations

### Tracked Transformations

All transformations are reversible via contract:

| Type | Forward | Reverse |
|------|---------|---------|
| Path: Semantic | `semantic.color.blue` → `color.blue` | Add "semantic" |
| Path: Default | `color.blue.default` → `color.blue` | Restore "default" |
| Path: HumanCase | `fontsize` → `Fontsize` | PascalCase → kebab |
| Path: Rename | `min` → `Mobile`, `max` → `Desktop` | Reverse mapping |
| Type: Remap | `fontsize` → `fontSizes` | Reverse TYPE_REMAPPING |
| Value: Reference | `{base.color.blue}` → `#005a8c` | Re-link via contract |
| Value: Lineheight | `1.5` → `150%` | Parse percentage |

### Lossy Transformations

Some transformations cannot be perfectly reversed:
- Token exclusions (Layout, Breakpoint) - not exported
- Static segments - removed (flagged for review)
- JSON5 comments - not preserved

## Development

### Install Dependencies

```bash
cd sync
npm install
```

### Run Tests

```bash
npm test
```

### Type Check

```bash
npx tsc --noEmit
```

## Integration

The contract generation is integrated into the main build pipeline (`sd.config.ts`):

1. Style Dictionary processes tokens
2. For Figma/Penpot builds (16px base, light theme):
   - Generate contract from transformed tokens
   - Save to `sync/contract.json`
3. Contract tracks all transformations for bidirectional sync

## Known Limitations

- **Reference Resolution**: Resolved to values, must infer from contract
- **Multi-theme**: Currently only light theme supported
- **Excluded Tokens**: Layout/Breakpoint tokens not synced
- **Comments**: JSON5 comments are not preserved

## Future Enhancements

- Figma Plugin (primary UI)
- Multi-theme support
- Conflict resolution UI
- GitHub API integration (auto PR)
- Visual diff viewer

## License

Mozilla Public License 2.0 (MPL-2.0)
