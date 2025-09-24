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
import { transforms, transformTypes } from "style-dictionary/enums"
import { resolveReferences, usesReferences } from "style-dictionary/utils"
import JSON5 from "json5"
import { fs } from "style-dictionary/fs"

import { formatUnitValue, getBasePxFontSize, isPascalCase, kebabToPascalCase } from "./shared"

const { nameKebab, sizePxToRem } = transforms

export function RegisterTransforms(PREFIX: string) {
  /**
   * Convert (pixel > 1 && pixel > -1) values to rem, not just dimensions and font sizes, uses `platform.options.basePxFontSize`
   * as the base font, or `16` if not provided
   * Scales non-zero numbers to rem, and adds ‘rem’ to the end.
   */
  StyleDictionary.registerTransform({
    ...StyleDictionary.hooks.transforms[sizePxToRem],
    name: sizePxToRem,
    type: transformTypes.value,
    transitive: true,
    filter: (token) => {
      const { $value } = token
      const numericValue = parseFloat($value)
      return typeof $value === "string" && $value.endsWith("px") && (numericValue < -1 || numericValue > 1 || numericValue === 0)
    }
  })

  StyleDictionary.registerTransform({
    name: "size/fluid",
    type: transformTypes.value,
    transitive: false,
    filter: (token) => token.$type === "dimension" && typeof token.$fluid === "object",
    transform: (token) => {
      const {
        name,
        $value,
        $fluid: { value, unit }
      } = token

      const validUnits = new Set(["px", "rem", "em", "vw", "vi", "vh", "vmin", "vmax", "pt", "dp", "%", "cm", "mm", "in", "pc"])

      if (validUnits.has(unit)) {
        const numericValue = parseFloat($value)
        const valueUnit = $value.replace(numericValue, "").trim()
        const sign = numericValue > 0 ? "+" : "-"

        return `${value}${unit} ${sign} ${Math.abs(numericValue)}${valueUnit}`
      }

      console.error(
        `Invalid Number Unit: '${name}: ${value}${unit} + ${$value}' has an invalid unit. Please use one of the following: ${Array.from(validUnits).join(", ")}.`
      )
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

  StyleDictionary.registerTransform({
    name: "web/flatten-properties-color",
    transitive: false,
    type: transformTypes.value,
    filter: (token) => token.$type === "color" && typeof token.$value === "object",
    transform: (token) => {
      const { $value, $type } = token
      if (!$value || $type !== "color") return undefined

      const { colorSpace, hex, components, alpha } = $value

      if (hex) {
        if (alpha) {
          const a = Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")
          return hex + a
        }
        return hex
      }

      if (colorSpace === "srgb" && components?.length === 3) {
        const [red, green, blue] = components
        if (red !== undefined && green !== undefined && blue !== undefined) {
          const sRGBtoRGB = (num: number) => {
            const result = Math.round(num * 255)
            return result % 1 === 0 ? result : result.toFixed(4)
          }
          const color = `rgb(${sRGBtoRGB(red)}, ${sRGBtoRGB(green)}, ${sRGBtoRGB(blue)})`
          return alpha ? `rgba(${color.slice(4, -1)}, ${alpha})` : color
        }
      }
      return $value
    }
  })

  StyleDictionary.registerTransform({
    name: "web/flatten-properties-dimension",
    transitive: false,
    type: transformTypes.value,
    filter: (token) => token.$type === "dimension" && typeof token.$value === "object",
    transform: (token, platform) => {
      const { $value, $type } = token
      if (!$value || $type !== "dimension") return undefined
      return formatUnitValue($value, platform)
    }
  })

  StyleDictionary.registerTransform({
    name: "web/flatten-properties-typography",
    transitive: true, // typography properties can be references
    type: transformTypes.value,
    filter: (token) => token.$type === "typography",
    transform: async (token, platform) => {
      const { $value, $type, original, name } = token
      if (!$value || $type !== "typography") return undefined

      const dictionary = JSON5.parse(fs.readFileSync(token.filePath, "utf8").toString())

      const { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, fontStyle, fontVariant, textTransform, textDecoration } = original.$value
      if (!fontFamily || !fontSize || !fontWeight || !letterSpacing || !lineHeight) return undefined

      const resolveIfReference = (value: string) => (usesReferences(value) ? resolveReferences(value, dictionary, { usesDtcg: true }) : value)

      const flattenFontSize = formatUnitValue(resolveIfReference(fontSize), platform)
      const flattenLetterSpacing = formatUnitValue(resolveIfReference(letterSpacing), platform)

      const lineHeightResolved = resolveIfReference(lineHeight)
      const flattenLineHeight =
        typeof lineHeightResolved === "object" && lineHeightResolved !== null && "$value" in lineHeightResolved
          ? lineHeightResolved.$value
          : lineHeightResolved

      const value = {
        fontFamily: resolveIfReference(fontFamily),
        fontSize: flattenFontSize,
        fontWeight: resolveIfReference(fontWeight),
        letterSpacing: flattenLetterSpacing,
        lineHeight: flattenLineHeight,
        ...(fontStyle ? { fontStyle: resolveIfReference(fontStyle) } : {}),
        ...(fontVariant ? { fontStyle: resolveIfReference(fontVariant) } : {}),
        ...(textTransform ? { fontStyle: resolveIfReference(textTransform) } : {}),
        ...(textDecoration ? { fontStyle: resolveIfReference(textDecoration) } : {})
      }

      const typographyCssShorthand = `${fontStyle ? `${fontStyle} ` : ""}${fontVariant ? `${fontVariant} ` : ""}${
        fontWeight ? `${fontWeight} ` : ""
      }${flattenFontSize ? `${flattenFontSize}` : `${getBasePxFontSize(platform)}px`}${lineHeight ? `/${lineHeight} ` : " "}${fontFamily};`

      const entries = Object.entries(value)

      const seperator = "\n  "

      return entries.reduce((acc, [key, v], index) => {
        const kebabName = StyleDictionary.hooks.transforms[nameKebab].transform(
          {
            filePath: "",
            isSource: false,
            name: "",
            original: {},
            path: [key]
          },
          {},
          {}
        )
        return `${acc ? `${acc}${seperator}` : ""}--${name}-${kebabName}: ${v}${index + 1 === entries.length ? "" : ";"}`
      }, typographyCssShorthand)
    }
  })

  StyleDictionary.registerTransform({
    name: "web/flatten-properties-border",
    transitive: true,
    type: transformTypes.value,
    filter: (token) => token.$type === "border",
    transform: (token, platform) => {
      const { $value, $type, original } = token
      if (!$value || $type !== "border") return undefined

      const dictionary = JSON5.parse(fs.readFileSync(token.filePath, "utf8").toString())
      const { width } = original.$value
      if (!width) return undefined

      const resolveIfReference = (value: string) => (usesReferences(value) ? resolveReferences(value, dictionary, { usesDtcg: true }) : value)
      const flattenWidth = formatUnitValue(resolveIfReference(width), platform)

      if ($value.includes("[object Object]")) {
        const op = $value.split("[object Object] ")
        return `${flattenWidth}${op.join(" ")}`
      }

      return $value
    }
  })

  StyleDictionary.registerTransformGroup({
    name: "custom/flatten-dtcg-props",
    transforms: [
      "web/flatten-properties-color",
      "web/flatten-properties-dimension",
      "web/flatten-properties-border",
      "web/flatten-properties-typography"
    ]
  })

  StyleDictionary.registerTransformGroup({
    name: "custom/css-extended",
    transforms: [
      ...StyleDictionary.hooks.transformGroups.css,
      ...StyleDictionary.hooks.transformGroups["custom/flatten-dtcg-props"],
      "name/exclude-semantic-and-modify-this",
      sizePxToRem,
      "size/fluid"
    ]
  })

  StyleDictionary.registerTransformGroup({
    name: "custom/scss-extended",
    transforms: [
      ...StyleDictionary.hooks.transformGroups.scss,
      ...StyleDictionary.hooks.transformGroups["custom/flatten-dtcg-props"],
      "name/exclude-semantic-and-modify-this",
      sizePxToRem,
      "size/fluid"
    ]
  })

  StyleDictionary.registerTransformGroup({
    name: "custom/js-extended",
    transforms: [
      ...StyleDictionary.hooks.transformGroups.js,
      "name/exclude-semantic-and-modify-this",
      "web/flatten-properties-dimension",
      sizePxToRem
    ]
  })

  StyleDictionary.registerTransformGroup({
    name: "custom/web-extended",
    transforms: [
      ...StyleDictionary.hooks.transformGroups.web,
      "name/exclude-semantic-and-modify-this",
      "web/flatten-properties-dimension",
      sizePxToRem
    ]
  })

  StyleDictionary.registerTransformGroup({
    name: "custom/figma-penpot",
    transforms: [...StyleDictionary.hooks.transformGroups["custom/flatten-dtcg-props"]]
  })
}
