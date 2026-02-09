#!/usr/bin/env tsx
/**
 * Diff CLI - Compare two Figma token snapshots
 * Usage: npm run sync:diff <snapshot1.json> <snapshot2.json>
 */

import fs from "fs/promises"
import deepDiff from "deep-diff"
import type { FigmaTokens } from "../lib/types"

interface DiffOptions {
  snapshot1: string
  snapshot2: string
}

function parseArgs(): DiffOptions {
  const args = process.argv.slice(2)

  if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npm run sync:diff <snapshot1.json> <snapshot2.json>

Arguments:
  <snapshot1.json>    Path to first snapshot (baseline)
  <snapshot2.json>    Path to second snapshot (comparison)

Examples:
  npm run sync:diff old-figma.json new-figma.json
  npm run sync:diff output/figma/kfw-design-tokens.light.json figma-export.json
    `)
    process.exit(0)
  }

  return {
    snapshot1: args[0],
    snapshot2: args[1]
  }
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  return JSON.stringify(value)
}

async function main() {
  const options = parseArgs()

  console.log("🔍 Comparing snapshots...\n")
  console.log(`📂 Baseline: ${options.snapshot1}`)
  console.log(`📂 Comparison: ${options.snapshot2}`)

  try {
    // Load snapshots
    const [snapshot1Content, snapshot2Content] = await Promise.all([
      fs.readFile(options.snapshot1, "utf-8"),
      fs.readFile(options.snapshot2, "utf-8")
    ])

    const snapshot1: FigmaTokens = JSON.parse(snapshot1Content)
    const snapshot2: FigmaTokens = JSON.parse(snapshot2Content)

    // Compare
    const differences = deepDiff(snapshot1, snapshot2)

    if (!differences || differences.length === 0) {
      console.log("\n✅ No differences found. Snapshots are identical.")
      process.exit(0)
    }

    // Categorize differences
    const added: string[] = []
    const modified: Array<{ path: string; before: string; after: string }> = []
    const deleted: string[] = []

    for (const difference of differences) {
      const path = difference.path?.join(".") || "unknown"

      // Skip metadata changes
      if (path.includes("$metadata")) continue

      switch (difference.kind) {
        case "N": // New
          added.push(path)
          break

        case "D": // Deleted
          deleted.push(path)
          break

        case "E": // Edited
          modified.push({
            path,
            before: formatValue(difference.lhs),
            after: formatValue(difference.rhs)
          })
          break
      }
    }

    console.log("\n📊 Summary:")
    console.log(`  Added: ${added.length}`)
    console.log(`  Modified: ${modified.length}`)
    console.log(`  Deleted: ${deleted.length}`)
    console.log(`  Total changes: ${added.length + modified.length + deleted.length}`)

    if (added.length > 0) {
      console.log("\n➕ Added tokens:")
      added.slice(0, 20).forEach(path => console.log(`  + ${path}`))
      if (added.length > 20) {
        console.log(`  ... and ${added.length - 20} more`)
      }
    }

    if (modified.length > 0) {
      console.log("\n✏️  Modified tokens:")
      modified.slice(0, 20).forEach(({ path, before, after }) => {
        console.log(`  ~ ${path}`)
        console.log(`    - ${before}`)
        console.log(`    + ${after}`)
      })
      if (modified.length > 20) {
        console.log(`  ... and ${modified.length - 20} more`)
      }
    }

    if (deleted.length > 0) {
      console.log("\n➖ Deleted tokens:")
      deleted.slice(0, 20).forEach(path => console.log(`  - ${path}`))
      if (deleted.length > 20) {
        console.log(`  ... and ${deleted.length - 20} more`)
      }
    }

    console.log("\n✅ Diff complete!")

  } catch (error) {
    console.error("❌ Diff failed:", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
