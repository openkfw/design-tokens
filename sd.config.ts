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
import { Config } from "style-dictionary/types"
import { formats, logBrokenReferenceLevels, logVerbosityLevels } from "style-dictionary/enums"
import { RegisterCustom } from "./config"

const THEMES = ["light"]
const PREFIX = "kfw"
const BASE_PX = {
  next: 16,
  stable: 10
}
const CONFIG: Config = {
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
const DEFAULT_SELECTOR = `!(*.${THEMES.join("|*.")})`

RegisterCustom(PREFIX)

const BUILD_PATH_PREFIX = "output"

const createStyleDictionaryConfig = (theme: string, basePxFontSize: number): Config => {
  const isLight = theme === "light"
  const src = isLight ? DEFAULT_SELECTOR : `*.${theme}`
  const isStable = basePxFontSize === 10

  return {
    ...CONFIG,
    source: [`tokens/${src}.{json,json5}`],
    platforms: {
      css: {
        basePxFontSize,
        buildPath: `${BUILD_PATH_PREFIX}${isStable ? "/web_stable_10px" : "/web_next_16px"}/css`,
        options: { fileHeader: "kfw-file-header" },
        transformGroup: "custom/css-extended",
        prefix: PREFIX,
        files: [
          {
            destination: `kfw-design-tokens.${theme}.css`,
            format: formats.cssVariables,
            options: {
              selector: (() => {
                // For convenience, the light theme is scoped to :root and will be activated by default when imported.
                const SELECTOR = isLight ? `:root, :host, .${PREFIX}-theme--${theme}` : `:host, .${PREFIX}-theme--${theme}`
                return `${SELECTOR} { color-scheme: ${theme}; }\n\n${SELECTOR}`
              })(),
              outputReferences: false
            }
          }
        ]
      },
      scss: {
        basePxFontSize,
        buildPath: `${BUILD_PATH_PREFIX}${isStable ? "/web_stable_10px" : "/web_next_16px"}/scss`,
        options: { fileHeader: "kfw-file-header" },
        transformGroup: "custom/scss-extended",
        prefix: PREFIX,
        files: [
          {
            destination: `kfw-design-tokens.${theme}.scss`,
            format: formats.scssVariables,
            options: {
              selector: (() => {
                // For convenience, the light theme is scoped to :root and will be activated by default when imported.
                const SELECTOR = isLight ? `:root, :host, .${PREFIX}-theme--${theme}` : `:host, .${PREFIX}-theme--${theme}`
                return `${SELECTOR} { color-scheme: ${theme}; }\n\n${SELECTOR}`
              })(),
              outputReferences: false
            }
          }
        ]
      },
      js: {
        basePxFontSize,
        buildPath: `${BUILD_PATH_PREFIX}${isStable ? "/web_stable_10px" : "/web_next_16px"}/js`,
        options: { fileHeader: "kfw-file-header" },
        transformGroup: "custom/js-extended",
        prefix: PREFIX,
        files: [
          {
            destination: `kfw-design-tokens.${theme}.js`,
            format: formats.javascriptEs6
          },
          {
            destination: `kfw-design-tokens.${theme}.d.ts`,
            format: formats.typescriptEs6Declarations
          }
        ]
      },
      ...(!isStable && {
        json: {
          basePxFontSize,
          buildPath: `${BUILD_PATH_PREFIX}/json`,
          transformGroup: "custom/web-extended",
          prefix: PREFIX,
          files: [
            {
              destination: `kfw-design-tokens.${theme}.json`,
              format: formats.json
            }
          ]
        },
        figma: {
          basePxFontSize,
          buildPath: `${BUILD_PATH_PREFIX}/figma`,
          transformGroup: "custom/figma-penpot",
          files: [
            {
              destination: `kfw-design-tokens.${theme}.json`,
              format: "json/figma"
            }
          ]
        },
        penpot: {
          basePxFontSize,
          buildPath: `${BUILD_PATH_PREFIX}/penpot`,
          transformGroup: "custom/figma-penpot",
          files: [
            {
              destination: `kfw-design-tokens.${theme}.json`,
              format: "json/penpot"
            }
          ]
        }
      })
    }
  }
}

export default (async function buildThemes() {
  console.log("Build started...")
  console.log("\n==============================================")

  for (const theme of THEMES) {
    for (const key in BASE_PX) {
      if (Object.prototype.hasOwnProperty.call(BASE_PX, key)) {
        const basePxFontSize = BASE_PX[key as keyof typeof BASE_PX]
        const sd = new StyleDictionary(createStyleDictionaryConfig(theme, basePxFontSize))
        await sd.buildAllPlatforms()
      }
    }
  }
  console.log("\n==============================================")
  console.log("\nBuild completed!")
})()
