/**
 * Generate contract metadata after Style Dictionary build
 * This script reads the Figma output and source tokens to generate the contract
 */

import { generateContract, saveContract } from "./sync/lib/contract"
import { StyleDictionary } from "style-dictionary-utils"
import { createStyleDictionaryConfig } from "./sd.config"
import path from "path"

async function main() {
  console.log("\n📋 Generating contract metadata for Figma sync...")

  try {
    // Create StyleDictionary instance with Figma configuration (16px base, light theme)
    const myStyleDictionary = new StyleDictionary()
    const extendedSd = await myStyleDictionary.extend(createStyleDictionaryConfig("light", 16))

    // Get all tokens
    const allTokens = extendedSd.allTokens

    if (!allTokens || allTokens.length === 0) {
      console.warn("⚠️  No tokens found in StyleDictionary")
      return
    }

    console.log(`   Found ${allTokens.length} tokens`)

    // Generate contract
    const contract = await generateContract(allTokens, "light", 16)
    const contractPath = path.resolve(process.cwd(), "sync/contract.json")
    await saveContract(contract, contractPath)

    console.log(`✅ Contract saved: ${contractPath}`)
    console.log(`   Tracked tokens: ${Object.keys(contract.transforms).length}`)

  } catch (error) {
    console.error("❌ Contract generation failed:", error instanceof Error ? error.message : error)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
