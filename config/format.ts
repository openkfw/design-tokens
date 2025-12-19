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

const extractTokenValue = ({ $value, $type, path }: TransformedToken) => {
  const attributes = {
    $value,
    $type
  }
  if (path.includes("letterspacing")) {
    attributes.$type = "letterSpacing"
  }
  if (path.includes("borderwidth")) {
    attributes.$type = "borderWidth"
  }
  if (path.includes("fontfamily")) {
    attributes.$type = "fontFamilies"
  }
  if (path.includes("fontweight")) {
    attributes.$type = "fontWeights"
  }
  if (path.includes("fontsize")) {
    attributes.$type = "fontSizes"
  }
  if (path.includes("lineheight")) {
    attributes.$type = "lineHeights"
    attributes.$value = `${parseFloat(($value * 100).toFixed(2))}%`
  }
  if (path.includes("borderradius")) {
    attributes.$type = "borderRadius"
  }
  if (path.includes("space")) {
    attributes.$type = "spacing"
  }

  return {
    ...attributes
  }
}

interface DeepWithP {
  p?: boolean
}

const convertTokensToJson = (tokens: TransformedToken[]) => {
  const output: TransformedTokens & { $metadata?: Record<string, string[]> } = {}

  ;(deep as DeepWithP).p = true

  tokens.map((token) => {
    const path = token.path.map(humanCase)

    /* Hide layout tokens */
    if (path.includes("Layout")) return
    if (path.includes("Breakpoint")) return
    if (path.includes("Contentwrapper")) return
    if (path.includes("Safezone")) return
    if (path.includes("Focusring")) return

    /* Hide fluid tokens for design, but show it in functional (mobile/desktop) */
    if (path.includes("Fluid")) return
    if (path.includes("Val")) return
    if (path.includes("Min")) {
      path[path.indexOf("Min")] = "Mobile"
    }
    if (path.includes("Max")) {
      path[path.indexOf("Max")] = "Desktop"
    }

    if (path.includes("Static")) {
      path.splice(path.indexOf("Static"), 1)
    }

    deep(output, path, extractTokenValue(token))
  })

  output.$metadata = {
    "tokenSetOrder": ["Base", "Semantic"]
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
