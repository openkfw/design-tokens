import StyleDictionary from "style-dictionary"
import { Config } from "style-dictionary/types"
import { formats, logBrokenReferenceLevels, logVerbosityLevels } from "style-dictionary/enums"
import { RegisterCustom } from "./config"

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
    errors: { brokenReferences: logBrokenReferenceLevels.throw }
  }
}

RegisterCustom(PREFIX)

const BUILD_PATH_PREFIX = "output"

function createPlatform(type: "css" | "scss" | "js", theme: Theme, variant: string, basePxFontSize: number) {
  const isDefaultTheme = theme === "light"
  const formatsMap = {
    css: formats.cssVariables,
    scss: formats.scssVariables,
    js: formats.javascriptEs6
  }

  return {
    basePxFontSize,
    transformGroup: `custom/${type}-extended`,
    prefix: PREFIX,
    options: { fileHeader: "kfw-file-header" },
    files: [
      {
        destination: `kfw-design-tokens.${theme}.${type}`,
        format:  isDefaultTheme ? formatsMap[type] : `${formatsMap[type]}.dark`,
        options: { outputReferences: false }
      }
    ],
    buildPath: `${BUILD_PATH_PREFIX}${variant}/${type}`
  }
}

function createAllPlatform(type: "css" | "scss" | "js", basePxFontSize: number) {
  const formatsMap = {
    css: `${formats.cssVariables}.all`,
    scss: formats.scssVariables,
    js: formats.javascriptEs6
  }

  return {
    basePxFontSize,
    transformGroup: `custom/${type}-extended`,
    prefix: PREFIX,
    options: { showFileHeader: false },
    files: [
      {
        destination: `kfw-design-tokens.${type}`,
        format: formatsMap[type],
        options: { outputReferences: false }
      }
    ],
    buildPath: `${BUILD_PATH_PREFIX}/${type}`
  }
}

const createStyleDictionaryConfig = (theme: Theme, basePxFontSize: number): Config => {
  const isDefaultTheme = theme === "light"
  const isDefaultSize = basePxFontSize === 10
  const variant = isDefaultSize ? "" : "/web_thirdparty_16px"

  const platforms: Config["platforms"] = {
    css: createPlatform("css", theme, variant, basePxFontSize),
    scss: createPlatform("scss", theme, variant, basePxFontSize),
    js: createPlatform("js", theme, variant, basePxFontSize)
  }

  // Figma & Penpot are theme and baseFontSize independent
  const figPenConfig = (destinationTheme: Theme) => ({
    files: [
      {
        destination: `kfw-design-tokens.${destinationTheme}.json`,
        format:  isDefaultTheme ? formatsFigmaPenpot : `${formatsFigmaPenpot}.dark`,
      }
    ],
    transformGroup: "custom/figma-penpot"
  })

  platforms.figma = {
    ...figPenConfig(theme),
    buildPath: `${BUILD_PATH_PREFIX}/figma`
  }

  platforms.penpot = {
    ...figPenConfig(theme),
    buildPath: `${BUILD_PATH_PREFIX}/penpot`
  }

  if (isDefaultTheme && isDefaultSize) {
    platforms.json = {
      transformGroup: "custom/web-extended",
      prefix: PREFIX,
      buildPath: `${BUILD_PATH_PREFIX}/json`,
      files: [{ destination: `kfw-design-tokens.json`, format: formats.json }]
    }

    platforms.jsTypes = {
      transformGroup: "custom/js-extended",
      prefix: PREFIX,
      buildPath: `${BUILD_PATH_PREFIX}${variant}/js`,
      options: { fileHeader: "kfw-file-header" },
      files: [{ destination: `kfw-design-tokens.d.ts`, format: formats.typescriptEs6Declarations }]
    }

    platforms.allCss = createAllPlatform("css", basePxFontSize)
  }

  return {
    ...CONFIG_BASE,
    source: ["tokens/**/*.json"],
    platforms
  }
}

export default (async function buildThemes() {
  console.log("Build started...")
  console.log("\n==============================================")

  for (const theme of THEMES) {
    for (const basePxFontSize of Object.values(BASE_PX)) {
      const sd = new StyleDictionary(createStyleDictionaryConfig(theme, basePxFontSize))
      await sd.buildAllPlatforms()
    }
  }

  console.log("\n==============================================")
  console.log("\nBuild completed!")
})()
