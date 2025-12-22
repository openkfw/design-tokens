import fs from "fs/promises"
import path from "path"

const iconsFolder = "./src/icons"
const outputFile = "./src/vendor/gen-icons.css"

async function buildIconsCSS() {
  try {
    const files = await fs.readdir(iconsFolder)
    const svgFiles = files.filter((file) => path.extname(file) === ".svg")

    let cssContent = "/* Auto-generated icon classes */\n\n"

    for (const file of svgFiles) {
      const iconName = path.basename(file, ".svg")
      cssContent += `.icon--${iconName} {\n`
      cssContent += `  --icon: url("../icons/${file}");\n`
      cssContent += `}\n\n`
    }

    await fs.writeFile(outputFile, cssContent)
    console.log(`✅ Icons CSS file generated at ${outputFile}`)
  } catch (err) {
    console.error("❌ Error while building icons CSS:", err)
    throw new Error(err)
  }
}

buildIconsCSS()
