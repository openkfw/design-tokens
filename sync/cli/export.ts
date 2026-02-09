#!/usr/bin/env tsx
/**
 * Export CLI - Regenerate Figma output and contract
 * Usage: npm run sync:export
 */

import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execAsync = promisify(exec)

async function main() {
  console.log("🔄 Starting Figma export generation...\n")

  try {
    // Run full build (includes contract generation)
    console.log("📦 Building tokens with Style Dictionary...")
    const { stdout, stderr } = await execAsync("npm run build", {
      cwd: path.resolve(process.cwd(), "..")
    })

    if (stderr && !stderr.includes("deprecated")) {
      console.error("Build warnings:", stderr)
    }

    console.log(stdout)

    // Verify outputs
    const figmaOutput = path.resolve(process.cwd(), "../output/figma/kfw-design-tokens.light.json")
    const contractOutput = path.resolve(process.cwd(), "contract.json")

    const [figmaExists, contractExists] = await Promise.all([
      fs.access(figmaOutput).then(() => true).catch(() => false),
      fs.access(contractOutput).then(() => true).catch(() => false)
    ])

    console.log("\n✅ Export complete!\n")
    console.log("Generated files:")
    console.log(`  ${figmaExists ? "✅" : "❌"} ${figmaOutput}`)
    console.log(`  ${contractExists ? "✅" : "❌"} ${contractOutput}`)

    if (!figmaExists || !contractExists) {
      console.error("\n⚠️  Some files were not generated. Check build output for errors.")
      process.exit(1)
    }

    // Show contract stats
    const contract = JSON.parse(await fs.readFile(contractOutput, "utf-8"))
    const transformCount = Object.keys(contract.transforms).length

    console.log(`\n📊 Contract metadata:`)
    console.log(`  - Theme: ${contract.theme}`)
    console.log(`  - Base font size: ${contract.basePxFontSize}px`)
    console.log(`  - Tracked tokens: ${transformCount}`)
    console.log(`  - Generated: ${new Date(contract.generated).toLocaleString()}`)

  } catch (error) {
    console.error("❌ Export failed:", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
