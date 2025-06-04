/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StyleDictionary from "style-dictionary"
import { TransformedToken, TransformedTokens } from "style-dictionary/types"
import { humanCase } from "./shared"
import deep from "deep-get-set-ts"

const extractTokenValue = ({ $value, $type, path }: TransformedToken) => {
  const attributes = {
    $value,
    $type
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

const convertTokensToJson = (tokens: TransformedToken[]) => {
  const output: TransformedTokens & { $metadata?: Record<string, string[]> } = {}

  deep.p = true
  tokens.map((token) => {
    const path = token.path.map(humanCase)
    if (path.includes("Fluid")) return
    deep(output, path, extractTokenValue(token))
  })

  output.$metadata = {
    "tokenSetOrder": ["Base", "Semantic"]
  }

  return output
}

const registerFormat = (name: string) => {
  StyleDictionary.registerFormat({
    name: `json/${name}`,
    format: ({ dictionary }) => {
      const transformedTokens = convertTokensToJson(dictionary.allTokens)
      return JSON.stringify(transformedTokens, null, 2)
    }
  })
}

export function RegisterFormats() {
  registerFormat("figma")
  registerFormat("penpot")
}
