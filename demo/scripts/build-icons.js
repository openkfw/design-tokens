import fs from "fs/promises"
import path from "path"

const iconsFolder = "./src/icons"
const outputFile = "./src/vendor/gen-icons.css"

const SVG_EXTENSION = ".svg"

async function buildIconsCSS() {
  try {
    const files = await fs.readdir(iconsFolder)
    const svgFiles = files.filter((file) => path.extname(file) === SVG_EXTENSION)

    const rootVariables = await Promise.all(
      svgFiles.map(async (file) => {
        const iconName = path.basename(file, SVG_EXTENSION)
        const svgPath = path.join(iconsFolder, file)
        let svgContent = await fs.readFile(svgPath, "utf8")
        const encodedSvg = encodeURIComponent(svgContent).replace(/'/g, "%27").replace(/"/g, "%22")
        const dataUrl = `url("data:image/svg+xml,${encodedSvg}")`
        return `  --kfw-icon-${iconName}: ${dataUrl};`
      })
    )

    const iconClasses = svgFiles
      .map((file) => {
        const iconName = path.basename(file, SVG_EXTENSION)
        return `.icon--${iconName} {\n  --icon: var(--kfw-icon-${iconName});\n}`
      })
      .join("\n\n")

    const cssContent = `/* Auto-generated icon classes */\n\n:root,\n:host {\n${rootVariables.join("\n")}\n}\n\n${iconClasses}\n`

    await fs.writeFile(outputFile, cssContent)
    console.log(`✅ Icons CSS file generated at ${outputFile}`)
  } catch (err) {
    console.error("❌ Error while building icons CSS:", err.message)
  }
}

buildIconsCSS()
