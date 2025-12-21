import CssFilterConverter from "css-filter-converter"

const ROOT_SELECTOR = ":root:not([data-theme=dark])"

export default function postcssColorToFilterPlugin() {
  return {
    postcssPlugin: "postcss-color-to-filter",
    async Once(root, { result }) {
      const cssVariables = {}

      // CSS-Variablen aus :root sammeln
      root.walkRules((rule) => {
        if (rule.selector.includes(ROOT_SELECTOR)) {
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
            const result = await CssFilterConverter.hexToFilter(param)
            const filterString = result.color || param
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
