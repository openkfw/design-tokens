/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Config } from "style-dictionary/types"
import { formats, logBrokenReferenceLevels, logVerbosityLevels } from "style-dictionary/enums"
import { RegisterCustom } from "./config"
import { StyleDictionary } from "style-dictionary-utils"

const THEMES = ["light"] as const
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

  const src = isDefaultTheme ? DEFAULT_SELECTOR : `*.${theme}`

  function seletorRoot() {
    const SELECTOR = isDefaultTheme ? `:root, :host` : `[data-theme=${theme}], :host(:not([data-theme=light]))`
    return `${SELECTOR} { color-scheme: ${theme}; }\n\n${SELECTOR}`
  }

  return {
    ...CONFIG_BASE,
    source: [`tokens/${src}.{json,json5}`],
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
            format: formats.cssVariables,
            options: {
              selector: seletorRoot(),
              outputReferences: false
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
              selector: seletorRoot(),
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
  console.log("\n==============================================")
  console.log("\nBuild completed!")
})()
