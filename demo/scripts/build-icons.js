import fs from "fs/promises"
import path from "path"

const iconsFolder = "./src/icons"
const outputFile = "./src/vendor/gen-icons.css"

const SVG_EXTENSION = ".svg"

async function buildIconsCSS() {
  try {
    const files = await fs.readdir(iconsFolder)
    const svgFiles = files.filter((file) => path.extname(file) === ".svg")

    const rootVariables = svgFiles
      .map((file) => {
        const iconName = path.basename(file, SVG_EXTENSION)
        return `  --kfw-icon-${iconName}: url("../icons/${file}");`
      })
      .join("\n")

    const iconClasses = svgFiles
      .map((file) => {
        const iconName = path.basename(file, SVG_EXTENSION)
        return `.icon--${iconName} {\n  --icon: var(--kfw-icon-${iconName});\n}`
      })
      .join("\n\n")

    const cssContent = `/* Auto-generated icon classes */\n\n:root,\n:host {\n${rootVariables}\n}\n\n${iconClasses}\n`

    await fs.writeFile(outputFile, cssContent)
    console.log(`✅ Icons CSS file generated at ${outputFile}`)
  } catch (err) {
    console.error("❌ Error while building icons CSS:", err.message)
  }
}

buildIconsCSS()
