/**
 * Contract generation logic for tracking transformations
 * Enables bidirectional sync between source tokens and Figma format
 */

import type { TransformedToken } from "style-dictionary/types"
import type { Contract, ContractEntry, Transformation } from "./types"
import { TYPE_REMAPPING, PATH_TRANSFORMATIONS, DESIGN_TOOL_EXCLUSIONS } from "./constants"
import fs from "fs/promises"
import path from "path"

/**
 * Convert path segment to PascalCase (humanCase equivalent)
 */
function humanCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Generate contract metadata for a token transformation
 */
export function generateContractEntry(token: TransformedToken, figmaPath: string[]): ContractEntry {
  const transformations: Transformation[] = []
  const metadata: ContractEntry["metadata"] = {}

  // Track path transformations
  const originalPath = [...token.path]
  const humanCasePath = token.path.map(humanCase)

  // Check for semantic removal
  if (originalPath.includes("semantic") && !humanCasePath.includes("semantic")) {
    transformations.push({
      type: "path:remove-semantic",
      removed: "semantic"
    })
  }

  // Check for default removal
  if (originalPath.includes("default") && !humanCasePath.includes("default")) {
    transformations.push({
      type: "path:remove-default",
      removed: "default"
    })
  }

  // Track humanCase transformation (if path changed)
  const pathChanged = originalPath.some((seg, i) => humanCase(seg) !== seg)
  if (pathChanged) {
    transformations.push({
      type: "path:humancase"
    })
  }

  // Track path segment transformations (Min/Max/Static)
  for (const [from, to] of Object.entries(PATH_TRANSFORMATIONS)) {
    const index = humanCasePath.indexOf(from)
    if (index !== -1) {
      if (to === null) {
        transformations.push({
          type: "path:remove-static",
          removed: from
        })
      } else {
        transformations.push({
          type: "path:rename",
          from,
          to
        })
      }
    }
  }

  // Track type remapping
  for (const [pathKey, mapping] of Object.entries(TYPE_REMAPPING)) {
    if (token.path.includes(pathKey)) {
      transformations.push({
        type: "type:remap",
        from: pathKey,
        to: mapping.$type
      })

      // Track lineheight percentage conversion
      if (pathKey === "lineheight" && typeof token.$value === "number") {
        transformations.push({
          type: "value:lineheight-percent",
          resolvedValue: `${parseFloat((token.$value * 100).toFixed(2))}%`
        })
      }
    }
  }

  // Track reference resolution
  if (token.original?.$value && typeof token.original.$value === "string" && token.original.$value.startsWith("{")) {
    transformations.push({
      type: "value:resolve-reference",
      originalReference: token.original.$value,
      resolvedValue: token.$value
    })
  }

  // Track color hex conversion (if original was sRGB object)
  if (token.$type === "color" && typeof token.$value === "string" && token.$value.startsWith("#")) {
    if (token.original?.$value && typeof token.original.$value === "object") {
      transformations.push({
        type: "value:color-hex",
        resolvedValue: token.$value
      })
    }
  }

  // Preserve metadata
  if (token.original?.$description) {
    metadata.$description = token.original.$description
  }

  if (token.original?.$fluid) {
    metadata.$fluid = token.original.$fluid
    transformations.push({
      type: "value:fluid"
    })
  }

  return {
    sourcePath: token.path.join("."),
    sourceFile: token.filePath || "tokens/tokens.json",
    transformations,
    ...(Object.keys(metadata).length > 0 && { metadata })
  }
}

/**
 * Generate full contract from transformed tokens
 */
export async function generateContract(
  tokens: TransformedToken[],
  theme: string,
  basePxFontSize: number
): Promise<Contract> {
  const contract: Contract = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    basePxFontSize,
    theme,
    transforms: {}
  }

  tokens.forEach((token: any) => {
    // Extract path from key (e.g., "{base.color.blue.100}" -> ["base", "color", "blue", "100"])
    let path: string[]

    if (token.path && Array.isArray(token.path)) {
      path = token.path
    } else if (token.key && typeof token.key === "string") {
      // Remove curly braces and split by dot
      path = token.key.replace(/[{}]/g, "").split(".")
    } else {
      return // Skip tokens without path or key
    }

    // Create a proper TransformedToken structure
    const transformedToken: TransformedToken = {
      ...token,
      path,
      original: token
    }

    const humanCasePath = transformedToken.path.map(humanCase)

    // Skip excluded tokens
    if (DESIGN_TOOL_EXCLUSIONS.some((exclusion) => humanCasePath.includes(exclusion))) {
      return
    }

    // Apply path transformations to get Figma path
    const figmaPath = [...humanCasePath]
    for (const [from, to] of Object.entries(PATH_TRANSFORMATIONS)) {
      const index = figmaPath.indexOf(from)
      if (index !== -1) {
        if (to === null) {
          figmaPath.splice(index, 1)
        } else {
          figmaPath[index] = to
        }
      }
    }

    const figmaPathStr = figmaPath.join(".")
    const entry = generateContractEntry(transformedToken, figmaPath)

    if (entry) {
      contract.transforms[figmaPathStr] = entry
    }
  })

  return contract
}

/**
 * Save contract to file
 */
export async function saveContract(contract: Contract, outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(contract, null, 2), "utf-8")
}

/**
 * Load contract from file
 */
export async function loadContract(contractPath: string): Promise<Contract> {
  const content = await fs.readFile(contractPath, "utf-8")
  return JSON.parse(content)
}
