import fs from "fs/promises"
import postcss from "postcss"
import path from "path"

const cssFile = path.resolve("node_modules/@openkfw/design-tokens/output/css/kfw-design-tokens.light.css")

const outputFile = "./src/vendor/gen-custom-media.css"

async function buildCustomMediaCSS() {
  try {
    const cssContent = await fs.readFile(cssFile, "utf8")
    const versionMatch = cssContent.match(/KfW Design Tokens v([\d.]+)/)
    const version = versionMatch ? versionMatch[1] : "unknown"
    const result = await postcss().process(cssContent, { from: undefined })
    const root = result.root
    let customMediaCSS =
      `/* Custom Media Queries generated from KfW Design Tokens v${version} */\n\n` +
      "/* See: https://www.w3.org/TR/mediaqueries-5/#at-ruledef-custom-media */\n\n"

    root.walkDecls((decl) => {
      const match = decl.prop.match(/^--kfw-breakpoint-(.+)$/)
      if (match) {
        const name = match[1]
        const value = decl.value.trim()
        customMediaCSS += `@custom-media --kfw-breakpoint-${name} (min-width: ${value});\n`
        customMediaCSS += `@custom-media --kfw-breakpoint-${name}-max (max-width: ${value});\n`
      }
    })

    // --- Datei schreiben ---
    await fs.writeFile(outputFile, customMediaCSS)
    console.log(`✅ Custom media file generated with version v${version}`)
  } catch (err) {
    console.error("❌ Error while building custom media CSS:", err)
    throw new Error(err)
  }
}

buildCustomMediaCSS()
