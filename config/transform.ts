/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { transforms, transformTypes } from "style-dictionary/enums"
import { isPascalCase, kebabToPascalCase } from "./shared"
import { StyleDictionary } from "style-dictionary-utils"

import { PX_TO_REM_THRESHOLD, PX_TO_REM_EXCLUSIONS, VALID_UNITS_SET, VALID_CSS_UNITS } from "./constants"

export function RegisterTransforms(PREFIX: string) {
  /**
   * Convert (pixel > 2 && pixel > -2) values to rem, not just dimensions and font sizes, uses `platform.options.basePxFontSize`
   * as the base font, or `16` if not provided
   * Scales non-zero numbers to rem, and adds ‘rem’ to the end.
   */
  StyleDictionary.registerTransform({
    ...StyleDictionary.hooks.transforms[transforms.sizePxToRem],
    name: "size/pxToRem/extended",
    type: transformTypes.value,
    transitive: true,
    filter: (token) => {
      const { $value, path } = token
      if (!Array.isArray(path)) return false

      /* 💡 Reason: Media queries use the browser's default root font size (not our custom setting, like 1rem = 10px) and borderradius should be always px */
      if (PX_TO_REM_EXCLUSIONS.some((exclusion) => path.includes(exclusion))) {
        return false
      }

      if (typeof $value !== "string" || !$value.endsWith("px")) {
        return false
      }

      const numericValue = parseFloat($value)
      if (isNaN(numericValue)) {
        console.warn(`Failed to parse numeric value: ${$value} at ${token.name}`)
        return false
      }

      return numericValue < -PX_TO_REM_THRESHOLD || numericValue > PX_TO_REM_THRESHOLD || numericValue === 0
    }
  })

  StyleDictionary.registerTransform({
    name: "size/fluid",
    type: transformTypes.value,
    transitive: false,
    filter: (token) => typeof token.$fluid === "object" && (token.$type === "dimension" || token.$type === "number"),
    transform: (token) => {
      const { $type, $value, $fluid, name } = token

      if (!VALID_UNITS_SET.has($fluid.unit)) {
        throw new Error(
          `Invalid fluid unit "${$fluid.unit}" at "${name}". Valid units: ${Array.from(VALID_CSS_UNITS).join(", ")}`
        )
      }

      if ($type === "dimension") {
        const numericValue = parseFloat($value)
        if (isNaN(numericValue)) {
          throw new Error(`Invalid dimension value "${$value}" at "${name}"`)
        }
        const valueUnit = $value.replace(numericValue.toString(), "").trim()
        const sign = numericValue > 0 ? "+" : "-"
        return `${$fluid.value}${$fluid.unit} ${sign} ${Math.abs(numericValue)}${valueUnit}`
      }

      if ($type === "number") {
        return `${$value}${$fluid.unit}`
      }

      return $value
    }
  })

  StyleDictionary.registerTransform({
    name: "name/exclude-semantic-and-modify-this",
    type: transformTypes.name,
    transform: function (token) {
      const { name } = token
      const kebabCaseSeperator = "-"
      const path = token.path.filter((p) => p !== "semantic")
      const isPascal = isPascalCase(name)

      if (token.name.endsWith("default") || token.name.endsWith("Default")) {
        const pathWithoutThis = path.filter((part) => part !== "default")
        const kebabName = [PREFIX, ...pathWithoutThis].join(kebabCaseSeperator)
        return isPascal ? kebabToPascalCase(kebabName) : kebabName
      }

      if (isPascal) {
        const kebabName = [PREFIX, ...path].join(kebabCaseSeperator)
        return kebabToPascalCase(kebabName)
      }

      return [PREFIX, ...path].join(kebabCaseSeperator)
    }
  })

  StyleDictionary.registerTransformGroup({
    name: "final/output",
    transforms: ["name/exclude-semantic-and-modify-this", "size/pxToRem/extended", "size/fluid"]
  })

  StyleDictionary.registerTransformGroup({
    name: "css-scss/extended",
    transforms: [...StyleDictionary.hooks.transformGroups["css/extended"], ...StyleDictionary.hooks.transformGroups["final/output"]]
  })

  // For JS output, we want to convert dimensions and typography to CSS values, srgb colors should be stay as is
  StyleDictionary.registerTransformGroup({
    name: "js/extended",
    transforms: [
      ...StyleDictionary.hooks.transformGroups.js,
      "dimension/css",
      "typography/css",
      ...StyleDictionary.hooks.transformGroups["final/output"]
    ]
  })

  StyleDictionary.registerTransformGroup({
    name: "web/extended",
    transforms: [...StyleDictionary.hooks.transformGroups.web, ...StyleDictionary.hooks.transformGroups["final/output"]]
  })

  StyleDictionary.registerTransformGroup({
    name: "figma-penpot",
    transforms: [...StyleDictionary.hooks.transformGroups["css/extended"], "name/exclude-semantic-and-modify-this"]
  })
}
