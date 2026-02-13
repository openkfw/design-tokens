/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TransformedToken, TransformedTokens } from "style-dictionary/types"
import { humanCase } from "./shared"
import deep from "deep-get-set-ts"
import { formatsFigmaPenpot } from "../sd.config"
import { StyleDictionary } from "style-dictionary-utils"
import { TYPE_REMAPPING, DESIGN_TOOL_EXCLUSIONS, PATH_TRANSFORMATIONS, PERCENTAGE_MULTIPLIER, PERCENTAGE_DECIMAL_PLACES } from "./constants"

const extractTokenValue = ({ $value, $type, path }: TransformedToken) => {
  const attributes: { $value: unknown; $type: string } = {
    $value,
    $type: $type ?? "unknown"
  }

  for (const [pathKey, mapping] of Object.entries(TYPE_REMAPPING)) {
    if (path.includes(pathKey)) {
      Object.assign(attributes, mapping)

      if (pathKey === "lineheight" && typeof $value === "number") {
        attributes.$value = `${parseFloat(($value * PERCENTAGE_MULTIPLIER).toFixed(PERCENTAGE_DECIMAL_PLACES))}%`
      }

      if (pathKey === "fontweight" && typeof $value === "number") {
        attributes.$value = String($value)
      }
    }
  }

  return attributes
}

interface DeepWithP {
  p?: boolean
}

/**
 * Check if token path should be excluded from design tool export
 */
const shouldExcludeToken = (path: string[]): boolean => {
  return DESIGN_TOOL_EXCLUSIONS.some((exclusion) => path.includes(exclusion))
}

/**
 * Transform path segments for design tool compatibility
 */
const transformPathSegments = (path: string[]): string[] => {
  const newPath = [...path]

  for (const [from, to] of Object.entries(PATH_TRANSFORMATIONS)) {
    const index = newPath.indexOf(from)
    if (index !== -1) {
      if (to === null) {
        newPath.splice(index, 1)
      } else {
        newPath[index] = to
      }
    }
  }

  return newPath
}

const convertTokensToJson = (tokens: TransformedToken[]) => {
  const output: TransformedTokens & { $metadata?: Record<string, string[]> } = {}

  ;(deep as DeepWithP).p = true

  tokens.forEach((token) => {
    const humanCasePath = token.path.map(humanCase)

    if (shouldExcludeToken(humanCasePath)) {
      return
    }

    const transformedPath = transformPathSegments(humanCasePath)
    deep(output, transformedPath, extractTokenValue(token))
  })

  output.$metadata = {
    tokenSetOrder: ["Base", "Semantic"]
  }

  return output
}

export function RegisterFormats() {
  const convertTokensToDesign = (allTokens: TransformedToken[]): string => {
    const transformedTokens = convertTokensToJson(allTokens)
    return JSON.stringify(transformedTokens, null, 2)
  }

  StyleDictionary.registerFormat({
    name: formatsFigmaPenpot,
    format: ({ dictionary }) => convertTokensToDesign(dictionary.allTokens)
  })
}
