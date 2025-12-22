import { hexToCSSFilter } from "hex-to-css-filter"

const filterConfig = {
  acceptanceLossPercentage: 1,
  maxChecks: 10
}

export default function postcssColorToFilterPlugin() {
  return {
    postcssPlugin: "postcss-color-to-filter",
    async Once(root, { result }) {
      const cssVariables = {}

      root.walkRules((rule) => {
        if (rule.selector.startsWith(":root,")) {
          rule.walkDecls((decl) => {
            if (decl.prop.startsWith("--")) {
              cssVariables[decl.prop] = decl.value.trim()
            }
          })
        }
      })

      const colorToFilterRegex = /color-to-filter\(\s*(var\(\s*--[\w-]+\s*\))\s*\)/g

      root.walkDecls(async (decl) => {
        let match
        const matches = []

        while ((match = colorToFilterRegex.exec(decl.value)) !== null) {
          matches.push(match)
        }

        let newValue = decl.value
        let hasReplacements = false

        for (const match of matches) {
          const [fullMatch, paramRaw] = match
          let param = paramRaw.trim()
          const varMatch = param.match(/^var\((--[^)]+)\)$/)

          if (varMatch) {
            const varName = varMatch[1]
            if (cssVariables[varName]) {
              param = cssVariables[varName]
            } else {
              result.warn(`CSS variable ${varName} not found`, { node: decl })
              continue
            }
          }

          try {
            const result = hexToCSSFilter(param, filterConfig)
            const filterString = result.filter || param
            newValue = newValue.replace(fullMatch, filterString)
            hasReplacements = true
          } catch (e) {
            result.warn(`Error generating filter for color "${param}": ${e.message}`, { node: decl })
          }
        }

        if (hasReplacements) {
          decl.value = newValue
        }
      })
    }
  }
}

postcssColorToFilterPlugin.postcss = true
