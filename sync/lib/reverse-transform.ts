/**
 * Reverse transformation engine
 * Converts Figma format back to W3C DTCG source tokens
 */

import type { Contract, ContractEntry, FigmaTokens, W3CTokens, W3CToken, FigmaToken } from "./types"
import { TYPE_REMAPPING, PATH_TRANSFORMATIONS } from "./constants"

/**
 * Reverse humanCase transformation (PascalCase → kebab-case)
 */
function reverseHumanCase(segment: string): string {
  // Convert PascalCase to kebab-case
  return segment
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
}

/**
 * Reverse path transformations using contract metadata
 */
function reversePathTransformations(figmaPath: string[], contract: ContractEntry): string[] {
  let sourcePath = figmaPath.map(reverseHumanCase)

  // Apply transformations in reverse order
  const reversedTransforms = [...contract.transformations].reverse()

  for (const transform of reversedTransforms) {
    switch (transform.type) {
      case "path:remove-semantic":
        // Add "semantic" back
        if (!sourcePath.includes("semantic")) {
          sourcePath = ["semantic", ...sourcePath]
        }
        break

      case "path:remove-default":
        // Add "default" back if specified
        if (transform.removed === "default") {
          sourcePath.push("default")
        }
        break

      case "path:rename":
        // Reverse Min→Mobile, Max→Desktop
        if (transform.from && transform.to) {
          const index = sourcePath.indexOf(transform.to.toLowerCase())
          if (index !== -1) {
            sourcePath[index] = transform.from.toLowerCase()
          }
        }
        break

      case "path:remove-static":
        // Cannot reliably restore - flag for manual review
        console.warn(`Cannot restore removed 'static' segment for path: ${figmaPath.join(".")}`)
        break
    }
  }

  return sourcePath
}

/**
 * Reverse type remapping
 */
function reverseTypeRemap(figmaType: string): string {
  for (const [pathKey, mapping] of Object.entries(TYPE_REMAPPING)) {
    if (mapping.$type === figmaType) {
      return pathKey
    }
  }
  return figmaType
}

/**
 * Reverse value transformations
 */
function reverseValueTransformations(
  figmaValue: unknown,
  figmaType: string,
  contract: ContractEntry
): unknown {
  let value = figmaValue

  for (const transform of contract.transformations) {
    switch (transform.type) {
      case "value:resolve-reference":
        // Try to restore reference
        if (transform.originalReference && transform.resolvedValue === value) {
          return transform.originalReference
        }
        break

      case "value:lineheight-percent":
        // Convert percentage back to decimal
        if (typeof value === "string" && value.endsWith("%")) {
          const numValue = parseFloat(value)
          return numValue / 100
        }
        break

      case "value:color-hex":
        // Hex colors stay as-is (cannot reconstruct sRGB object without additional data)
        break

      case "value:fluid":
        // Fluid values would require parsing CSS calc() - preserve as-is for now
        break
    }
  }

  return value
}

/**
 * Convert single Figma token to W3C token
 */
function convertFigmaTokenToW3C(figmaToken: FigmaToken, contract: ContractEntry): W3CToken {
  const w3cToken: W3CToken = {
    $value: reverseValueTransformations(figmaToken.$value, figmaToken.$type, contract),
    $type: reverseTypeRemap(figmaToken.$type)
  }

  // Restore metadata
  if (contract.metadata?.$description) {
    w3cToken.$description = contract.metadata.$description
  }

  if (contract.metadata?.$fluid) {
    w3cToken.$fluid = contract.metadata.$fluid
  }

  return w3cToken
}

/**
 * Recursively traverse Figma tokens and convert to W3C format
 */
function traverseAndConvert(
  figmaTokens: FigmaTokens,
  contract: Contract,
  currentPath: string[] = []
): W3CTokens {
  const output: W3CTokens = {}

  for (const [key, value] of Object.entries(figmaTokens)) {
    if (key === "$metadata") continue // Skip metadata

    const newPath = [...currentPath, key]

    if (typeof value === "object" && value !== null && "$value" in value) {
      // Leaf token
      const figmaPathStr = newPath.join(".")
      const contractEntry = contract.transforms[figmaPathStr]

      if (!contractEntry) {
        // No contract entry - token was added in Figma
        console.warn(`No contract entry for new token: ${figmaPathStr}`)
        output[key] = value as FigmaToken
        continue
      }

      // Reverse transformations
      const sourcePath = reversePathTransformations(newPath, contractEntry)
      const w3cToken = convertFigmaTokenToW3C(value as FigmaToken, contractEntry)

      // Rebuild nested structure
      let target = output
      for (let i = 0; i < sourcePath.length - 1; i++) {
        const segment = sourcePath[i]
        if (!target[segment]) {
          target[segment] = {}
        }
        target = target[segment] as W3CTokens
      }

      target[sourcePath[sourcePath.length - 1]] = w3cToken
    } else if (typeof value === "object" && value !== null) {
      // Group - recurse
      output[key] = traverseAndConvert(value as FigmaTokens, contract, newPath)
    }
  }

  return output
}

/**
 * Main entry point: convert Figma tokens back to W3C DTCG format
 */
export function reverseFigmaTokens(figmaTokens: FigmaTokens, contract: Contract): W3CTokens {
  return traverseAndConvert(figmaTokens, contract)
}

/**
 * Detect reference based on resolved value lookup
 */
export function detectReference(resolvedValue: unknown, contract: Contract): string | null {
  for (const entry of Object.values(contract.transforms)) {
    const refTransform = entry.transformations.find(
      (t) => t.type === "value:resolve-reference" && t.resolvedValue === resolvedValue
    )
    if (refTransform?.originalReference) {
      return refTransform.originalReference
    }
  }
  return null
}
