#!/usr/bin/env tsx
/**
 * Import CLI - Convert Figma JSON back to source tokens
 * Usage: npm run sync:import <figma-json-path> [--dry-run] [--output <path>]
 */

import fs from "fs/promises"
import path from "path"
import { reverseFigmaTokens } from "../lib/reverse-transform"
import { loadContract } from "../lib/contract"
import type { FigmaTokens } from "../lib/types"

interface ImportOptions {
  figmaPath: string
  dryRun: boolean
  outputPath: string | null
}

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npm run sync:import <figma-json-path> [options]

Arguments:
  <figma-json-path>    Path to Figma-exported JSON file

Options:
  --dry-run           Preview changes without writing files
  --output <path>     Custom output path (default: tokens/tokens.imported.json)
  --help, -h          Show this help message

Examples:
  npm run sync:import output/figma/kfw-design-tokens.light.json
  npm run sync:import figma-export.json --dry-run
  npm run sync:import figma-export.json --output tokens/tokens.new.json
    `)
    process.exit(0)
  }

  const figmaPath = args[0]
  const dryRun = args.includes("--dry-run")

  let outputPath: string | null = null
  const outputIndex = args.indexOf("--output")
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputPath = args[outputIndex + 1]
  }

  return { figmaPath, dryRun, outputPath }
}

async function main() {
  const options = parseArgs()

  console.log("🔄 Starting Figma import...\n")
  console.log(`📂 Input: ${options.figmaPath}`)
  console.log(`🔍 Mode: ${options.dryRun ? "DRY RUN" : "WRITE"}`)

  try {
    // Load Figma tokens
    const figmaContent = await fs.readFile(options.figmaPath, "utf-8")
    const figmaTokens: FigmaTokens = JSON.parse(figmaContent)

    // Load contract
    const contractPath = path.resolve(process.cwd(), "contract.json")
    const contract = await loadContract(contractPath)

    console.log(`\n📋 Contract loaded:`)
    console.log(`  - Version: ${contract.version}`)
    console.log(`  - Theme: ${contract.theme}`)
    console.log(`  - Tracked tokens: ${Object.keys(contract.transforms).length}`)

    // Reverse transform
    console.log("\n🔄 Reversing transformations...")
    const w3cTokens = reverseFigmaTokens(figmaTokens, contract)

    // Determine output path
    const outputPath = options.outputPath || path.resolve(process.cwd(), "../tokens/tokens.imported.json")

    if (options.dryRun) {
      console.log("\n✅ Dry run complete! Preview of output:\n")
      console.log(JSON.stringify(w3cTokens, null, 2).slice(0, 1000) + "\n... (truncated)")
      console.log(`\n📝 Would write to: ${outputPath}`)
      console.log("\n💡 Remove --dry-run to write file")
    } else {
      await fs.writeFile(outputPath, JSON.stringify(w3cTokens, null, 2), "utf-8")
      console.log(`\n✅ Import complete!`)
      console.log(`📝 Written to: ${outputPath}`)
      console.log(`\n⚠️  Next steps:`)
      console.log(`  1. Review the imported file for accuracy`)
      console.log(`  2. Compare with tokens/tokens.json`)
      console.log(`  3. Merge changes manually or replace the file`)
    }

  } catch (error) {
    console.error("❌ Import failed:", error instanceof Error ? error.message : error)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
