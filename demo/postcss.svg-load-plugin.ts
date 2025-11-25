import fs from "fs/promises"
import path from "path"
import { Result, Root } from "postcss"

interface Options {
  baseDir?: string
}

interface CssVariablesMap {
  [key: string]: string
}

const svgCache: CssVariablesMap = {}

export default function postcssSvgLoadPlugin(options: Options = {}) {
  return {
    postcssPlugin: "postcss-svg-load",
    async Once(root: Root, { result }: { result: Result }) {
      const cssFilePath = result.opts.from
      const baseDir = options.baseDir ?? (cssFilePath ? path.dirname(cssFilePath) : process.cwd())
      const cssVariables: CssVariablesMap = {}

      root.walkRules((rule) => {
        if (rule.selector === ":root" || rule.selector.startsWith(":root,")) {
          rule.walkDecls((decl) => {
            if (decl.prop.startsWith("--")) {
              cssVariables[decl.prop] = decl.value.trim()
            }
          })
        }
      })

      const svgLoadRegex = /svg-load\(\s*["']([^"']+)["'](?:\s*,\s*["']([^"']*)["'])?\s*\)/g
      const processingPromises: Promise<void>[] = []

      root.walkDecls((decl) => {
        let match: RegExpExecArray | null
        const matches: RegExpExecArray[] = []

        while ((match = svgLoadRegex.exec(decl.value)) !== null) {
          matches.push(match)
        }

        for (const match of matches) {
          const [fullMatch, svgRelativePath, colorParam] = match

          let color: string | null = null

          if (colorParam !== undefined && colorParam !== "") {
            const varMatch = colorParam.match(/^var\((--[^)]+)\)$/)
            if (varMatch) {
              const varName = varMatch[1]
              if (cssVariables[varName]) {
                color = cssVariables[varName]
              } else {
                result.warn(`CSS variable ${varName} not found`, { node: decl })
                continue
              }
            } else {
              color = colorParam
            }
          }

          const svgAbsolutePath = path.resolve(baseDir, svgRelativePath)
          const cacheKey = `${svgAbsolutePath}::${color ?? ""}`

          const promise = (async () => {
            if (svgCache[cacheKey]) {
              decl.value = decl.value.replace(fullMatch, svgCache[cacheKey])
              return
            }

            try {
              let svgContent = await fs.readFile(svgAbsolutePath, "utf8")

              if (color !== null) {
                // Replace or add fill attribute only if color is set
                if (/<svg[^>]*fill="[^"]*"[^>]*>/.test(svgContent)) {
                  svgContent = svgContent.replace(/(<svg[^>]*?)fill="[^"]*"([^>]*>)/, `$1fill="${color}"$2`)
                } else {
                  svgContent = svgContent.replace(/(<svg[^>]*)>/, `$1 fill="${color}">`)
                }
              }

              const encodedSvg = encodeURIComponent(svgContent).replace(/'/g, "%27").replace(/"/g, "%22")

              const dataUrl = `url("data:image/svg+xml,${encodedSvg}")`

              svgCache[cacheKey] = dataUrl

              decl.value = decl.value.replace(fullMatch, dataUrl)
            } catch {
              result.warn(`SVG file not found: ${svgAbsolutePath}`, { node: decl })
            }
          })()

          processingPromises.push(promise)
        }
      })

      await Promise.all(processingPromises)
    }
  }
}

postcssSvgLoadPlugin.postcss = true
