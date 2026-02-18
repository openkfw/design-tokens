/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Config, TransformedToken } from "style-dictionary/types"
import { formats, logBrokenReferenceLevels, logVerbosityLevels } from "style-dictionary/enums"
import { RegisterCustom } from "./config"
import { StyleDictionary } from "style-dictionary-utils"

const THEMES = ["light", "dark"] as const
export type Theme = (typeof THEMES)[number]

export const formatsFigmaPenpot = "json/figma-penpot"

const PREFIX = "kfw"
const BASE_PX = { default: 10, thirdparty: 16 } as const

const CONFIG_BASE: Config = {
  usesDtcg: true,
  expand: false,
  log: {
    warnings: "disabled",
    verbosity: logVerbosityLevels.verbose,
    errors: {
      brokenReferences: logBrokenReferenceLevels.throw
    }
  }
}

RegisterCustom(PREFIX)

const DEFAULT_SELECTOR = `!(*.${THEMES.join("|*.")})`

const BUILD_PATH_PREFIX = "output"

const createStyleDictionaryConfig = (theme: Theme, basePxFontSize: number): Config => {
  const isDefaultTheme = theme === "light"
  const isDefaultSize = basePxFontSize === 10
  const variant = isDefaultSize ? "" : "/web_thirdparty_16px"

  function selectorRoot() {
    const SELECTOR = isDefaultTheme ? `:root, :host` : `[data-theme=${theme}], :host(:not([data-theme=light]))`
    return `${SELECTOR} { color-scheme: ${theme}; }\n\n${SELECTOR}`
  }

  return {
    ...CONFIG_BASE,
    source: isDefaultTheme ? [`tokens/${DEFAULT_SELECTOR}.{json,json5}`] : [`tokens/*.${theme}.{json,json5}`],
    platforms: {
      css: {
        basePxFontSize,
        buildPath: `${BUILD_PATH_PREFIX}${variant}/css`,
        options: { fileHeader: "kfw-file-header" },
        transformGroup: "css-scss/extended",
        prefix: PREFIX,
        files: [
          {
            destination: `kfw-design-tokens.${theme}.css`,
            format: theme === "dark" ? "css/advanced" : formats.cssVariables,
            options: {
              selector: selectorRoot(),
              outputReferences: false,
              ...(theme === "dark" && {
                rules: [
                  {
                    matcher: () => true,
                    selector: `[data-theme="dark"]`
                  },
                  {
                    matcher: () => true,
                    atRule: `\n@media (prefers-color-scheme: dark)`,
                    selector: `:root, :host`
                  }
                ]
              })
            }
          }
        ]
      },
      scss: {
        basePxFontSize,
        buildPath: `${BUILD_PATH_PREFIX}${variant}/scss`,
        options: { fileHeader: "kfw-file-header" },
        transformGroup: "css-scss/extended",
        prefix: PREFIX,
        files: [
          {
            destination: `kfw-design-tokens.${theme}.scss`,
            format: formats.scssVariables,
            options: {
              selector: selectorRoot(),
              outputReferences: false
            }
          }
        ]
      },
      js: {
        basePxFontSize,
        buildPath: `${BUILD_PATH_PREFIX}${variant}/js`,
        options: { fileHeader: "kfw-file-header" },
        transformGroup: "js/extended",
        prefix: PREFIX,
        files: [
          {
            destination: `kfw-design-tokens.${theme}.js`,
            format: formats.javascriptEs6
          }
        ]
      },
      ...(isDefaultTheme &&
        isDefaultSize && {
          json: {
            basePxFontSize,
            buildPath: `${BUILD_PATH_PREFIX}/json`,
            transformGroup: "web/extended",
            prefix: PREFIX,
            files: [{ destination: `kfw-design-tokens.json`, format: formats.json }]
          },
          jsTypes: {
            basePxFontSize,
            buildPath: `${BUILD_PATH_PREFIX}${variant}/js`,
            transformGroup: "js/extended",
            options: { fileHeader: "kfw-file-header" },
            prefix: PREFIX,
            files: [{ destination: `kfw-design-tokens.d.ts`, format: formats.typescriptEs6Declarations }]
          }
        }),
      ...(!isDefaultSize && {
        figma: {
          basePxFontSize,
          buildPath: `${BUILD_PATH_PREFIX}/figma`,
          transformGroup: "figma-penpot",
          files: [
            {
              destination: `kfw-design-tokens.${theme}.json`,
              format: formatsFigmaPenpot
            }
          ]
        },
        penpot: {
          basePxFontSize,
          buildPath: `${BUILD_PATH_PREFIX}/penpot`,
          transformGroup: "figma-penpot",
          files: [
            {
              destination: `kfw-design-tokens.${theme}.json`,
              format: formatsFigmaPenpot
            }
          ]
        }
      })
    }
  }
}

async function createAllCssFile(basePxFontSize: number) {
  const isDefaultSize = basePxFontSize === 10
  const variant = isDefaultSize ? "" : "/web_thirdparty_16px"
  const buildPath = `${BUILD_PATH_PREFIX}${variant}/css`

  const fs = await import("fs/promises")
  const path = await import("path")

  const lightCssPath = path.join(buildPath, "kfw-design-tokens.light.css")
  const darkCssPath = path.join(buildPath, "kfw-design-tokens.dark.css")
  const allCssPath = path.join(buildPath, "kfw-design-tokens.all.css")

  const lightCss = await fs.readFile(lightCssPath, "utf-8")
  const darkCss = await fs.readFile(darkCssPath, "utf-8")

  // Extract header from light.css
  const headerMatch = lightCss.match(/^\/\*\*[\s\S]*?\*\//)
  const header = headerMatch ? headerMatch[0] : ""

  // Extract variables from light.css (remove header and selector, keep content)
  const lightContent = lightCss
    .replace(/^\/\*\*[\s\S]*?\*\/\s*/, "") // Remove header
    .replace(/^:root,\s*:host\s*{\s*color-scheme:\s*light;\s*}\s*/, "") // Remove color-scheme declaration
    .replace(/^:root,\s*:host\s*{/, ":root,\n:host {\n  color-scheme: light dark;") // Update color-scheme

  // Combine
  const allCss = `${header}\n\n${lightContent}\n${darkCss}`

  await fs.writeFile(allCssPath, allCss, "utf-8")
}

export default (async function buildThemes() {
  console.log("Build started...")
  console.log("\n==============================================")

  for (const theme of THEMES) {
    for (const key in BASE_PX) {
      if (Object.prototype.hasOwnProperty.call(BASE_PX, key)) {
        const basePxFontSize = BASE_PX[key as keyof typeof BASE_PX]

        const myStyleDictionary = new StyleDictionary()
        const extendedSd = await myStyleDictionary.extend(createStyleDictionaryConfig(theme, basePxFontSize))
        await extendedSd.buildAllPlatforms()
      }
    }
  }

  // Build all.css by combining light.css and dark.css
  console.log("\nBuilding all.css...")
  await createAllCssFile(BASE_PX.default)

  console.log("\n==============================================")
  console.log("\nBuild completed!")
})()
