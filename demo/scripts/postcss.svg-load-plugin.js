import fs from "fs/promises"
import path from "path"

const svgCache = {}

const ROOT_SELECTOR = ":root:not([data-theme=dark])"

export default function postcssSvgLoadPlugin(options = {}) {
  return {
    postcssPlugin: "postcss-svg-load",
    async Once(root, { result }) {
      const cssFilePath = result.opts.from
      const baseDir = options.baseDir ?? (cssFilePath ? path.dirname(cssFilePath) : process.cwd())
      const cssVariables = {}

      root.walkRules((rule) => {
        if (rule.selector.includes(ROOT_SELECTOR)) {
          rule.walkDecls((decl) => {
            if (decl.prop.startsWith("--")) {
              cssVariables[decl.prop] = decl.value.trim()
            }
          })
        }
      })

      const svgLoadRegex = /svg-load\(\s*["']([^"']+)["'](?:\s*,\s*["']([^"']*)["'])?\s*\)/g
      const processingPromises = []

      root.walkDecls((decl) => {
        let match
        const matches = []

        while ((match = svgLoadRegex.exec(decl.value)) !== null) {
          matches.push(match)
        }

        for (const match of matches) {
          const [fullMatch, svgRelativePath, colorParam] = match

          let color = null

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
