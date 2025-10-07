import fs from "fs/promises"
import postcss from "postcss"
import path from "path"

const cssFile = path.resolve("node_modules/@openkfw/design-tokens/output/web_stable_10px/css/kfw-design-tokens.light.css")

const outputFile = "./src/partials/gen-custom-media.css"

async function buildCustomMediaCSS() {
  try {
    const cssContent = await fs.readFile(cssFile, "utf8")
    const result = await postcss().process(cssContent, { from: undefined })
    const root = result.root
    let customMediaCSS =
      "/* Custom Media Queries generated from KfW Design Tokens */\n\n/* See: https://www.w3.org/TR/mediaqueries-5/#at-ruledef-custom-media */\n\n"

    root.walkDecls((decl) => {
      const match = decl.prop.match(/^--kfw-breakpoint-(.+)$/)
      if (match) {
        const name = match[1]
        const value = decl.value.trim()
        customMediaCSS += `@custom-media --kfw-breakpoint-${name} (min-width: ${value});\n`
      }
    })

    await fs.writeFile(outputFile, customMediaCSS)
  } catch (err) {
    throw new Error(err)
  }
}

buildCustomMediaCSS()
