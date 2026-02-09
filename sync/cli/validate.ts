#!/usr/bin/env tsx
/**
 * Validate CLI - Round-trip validation testing
 * Usage: npm run sync:validate
 */

import fs from "fs/promises"
import path from "path"
import { reverseFigmaTokens } from "../lib/reverse-transform"
import { loadContract } from "../lib/contract"
import type { FigmaTokens, W3CTokens } from "../lib/types"
import diff from "deep-diff"

interface ValidationResult {
  perfect: boolean
  acceptable: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalTokens: number
    perfectMatches: number
    acceptableDifferences: number
    significantLosses: number
  }
}

function countTokens(obj: Record<string, unknown>): number {
  let count = 0
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null) {
      if ("$value" in value) {
        count++
      } else {
        count += countTokens(value as Record<string, unknown>)
      }
    }
  }
  return count
}

async function validateRoundTrip(): Promise<ValidationResult> {
  const result: ValidationResult = {
    perfect: true,
    acceptable: true,
    errors: [],
    warnings: [],
    stats: {
      totalTokens: 0,
      perfectMatches: 0,
      acceptableDifferences: 0,
      significantLosses: 0
    }
  }

  try {
    // Load source tokens
    const sourceTokensPath = path.resolve(process.cwd(), "../tokens/tokens.json")
    const sourceContent = await fs.readFile(sourceTokensPath, "utf-8")
    const sourceTokens: W3CTokens = JSON.parse(sourceContent)

    result.stats.totalTokens = countTokens(sourceTokens)

    // Load Figma output
    const figmaPath = path.resolve(process.cwd(), "../output/figma/kfw-design-tokens.light.json")
    const figmaContent = await fs.readFile(figmaPath, "utf-8")
    const figmaTokens: FigmaTokens = JSON.parse(figmaContent)

    // Load contract
    const contractPath = path.resolve(process.cwd(), "contract.json")
    const contract = await loadContract(contractPath)

    // Reverse transform
    const reversedTokens = reverseFigmaTokens(figmaTokens, contract)

    // Compare
    const differences = diff(sourceTokens, reversedTokens)

    if (!differences || differences.length === 0) {
      result.stats.perfectMatches = result.stats.totalTokens
      return result
    }

    // Analyze differences
    for (const difference of differences) {
      const path = difference.path?.join(".") || "unknown"

      switch (difference.kind) {
        case "N": // New in reversed
          result.warnings.push(`Added token in reversed: ${path}`)
          result.stats.acceptableDifferences++
          result.perfect = false
          break

        case "D": // Deleted from reversed
          // Check if it's an excluded token type
          if (path.includes("Layout") || path.includes("Breakpoint") || path.includes("Fluid")) {
            result.warnings.push(`Expected exclusion: ${path}`)
            result.stats.acceptableDifferences++
          } else {
            result.errors.push(`Missing token: ${path}`)
            result.stats.significantLosses++
            result.acceptable = false
          }
          result.perfect = false
          break

        case "E": // Edited value
          result.warnings.push(`Value mismatch at ${path}: ${JSON.stringify(difference.lhs)} → ${JSON.stringify(difference.rhs)}`)
          result.stats.acceptableDifferences++
          result.perfect = false
          break

        case "A": // Array change
          result.warnings.push(`Array change at ${path}`)
          result.stats.acceptableDifferences++
          result.perfect = false
          break
      }
    }

  } catch (error) {
    result.errors.push(`Validation failed: ${error instanceof Error ? error.message : error}`)
    result.acceptable = false
    result.perfect = false
  }

  return result
}

async function main() {
  console.log("🔍 Running round-trip validation...\n")

  const result = await validateRoundTrip()

  console.log("📊 Validation Results:")
  console.log(`  Total tokens: ${result.stats.totalTokens}`)
  console.log(`  Perfect matches: ${result.stats.perfectMatches}`)
  console.log(`  Acceptable differences: ${result.stats.acceptableDifferences}`)
  console.log(`  Significant losses: ${result.stats.significantLosses}`)

  const accuracy = ((result.stats.perfectMatches + result.stats.acceptableDifferences) / result.stats.totalTokens) * 100
  console.log(`\n🎯 Accuracy: ${accuracy.toFixed(2)}%`)

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`)
    result.warnings.slice(0, 10).forEach(w => console.log(`  - ${w}`))
    if (result.warnings.length > 10) {
      console.log(`  ... and ${result.warnings.length - 10} more`)
    }
  }

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`)
    result.errors.slice(0, 10).forEach(e => console.log(`  - ${e}`))
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more`)
    }
  }

  if (result.perfect) {
    console.log("\n✅ Perfect round-trip! No data loss detected.")
    process.exit(0)
  } else if (result.acceptable) {
    console.log("\n✅ Acceptable round-trip. Differences are within expected range.")
    process.exit(1)
  } else {
    console.log("\n❌ Significant data loss detected. Review errors above.")
    process.exit(2)
  }
}

main()
