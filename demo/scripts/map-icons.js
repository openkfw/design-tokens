import fs from "fs/promises"
import path from "path"
import { execSync } from "child_process"

const iconsDelivered = "./Icons 2026-02-17 15_33_25.zip"
const tempExtractLocation = "." // Icons are extracted to current directory
const iconsFolder = "./src/icons"

// Comprehensive German to English icon name mapping
const iconNameMap = {
  // Special cases with prefixes
  meine_antraege: "my-applications",

  // German terms
  abmelden: "logout",
  agb: "terms-and-conditions",
  anmelden: "login",
  arbeitshilfe_praesentation: "work-aid-presentation",
  ausrufezeichen: "exclamation-mark",
  bearbeiten: "edit",
  benachrichtigung_einstellungen: "notification-settings",
  bild: "image",
  budget: "budget",
  caculator: "calculator", // Fix typo in original
  chatbot: "chatbot",
  chatbot_new: "chatbot-new",
  "checkbox-haken": "checkbox-checked",
  "checkbox-leer": "checkbox-empty",
  dialog: "dialog",
  dokument: "document",
  "dokument-pdf": "document-pdf",
  "doppelpfeil-links": "double-arrow-left",
  "doppelpfeil-rechts": "double-arrow-right",
  download: "download",
  drucker: "printer",
  einstellungen: "settings",
  expandieren: "expand",
  expertenwissen: "expert-knowledge",
  export: "export",
  "externer-link": "external-link",
  fax: "fax",
  foerderprodukt: "funding-product",
  gebaerdensprache: "sign-language",
  globus: "globe",
  haken: "checkmark",
  "haken-gefuellt-check": "checkmark-filled",
  hilfe_info_cookie: "help-info-cookie",
  hilfe_info_cookie_kreis_gefuellt: "help-info-cookie-circle-filled",
  hinweisbox_2: "notice-box",
  hinzufuegen: "add",
  history: "history",
  history_gefullt_kreis: "history-filled-circle",
  home: "home",
  id: "id",
  id_gefuellt_kreis: "id-filled-circle",
  in_arbeit: "in-progress",
  inaktiv: "inactive",
  kalender: "calendar",
  kopieren: "copy",
  "kreis-gefuellt-info": "circle-filled-info",
  "kreis-gefuellt-play": "circle-filled-play",
  "kreis-gefuellt-ausrufezeichen": "circle-filled-exclamation",
  "kreis-gefuellt": "circle-filled",
  "kreis-outline": "circle-outline",
  "kreis-outline-bp": "circle-outline-bulletpoint",
  "kreis-outline-info": "circle-outline-info",
  leichtesprache: "plain-language",
  "link-kopieren": "link-copy",
  lupe: "magnifier",
  "lupe-zoom-in": "magnifier-zoom-in",
  "lupe-zoom-out": "magnifier-zoom-out",
  mail: "mail",
  "menu-punkte": "menu-dots",
  "menu-texthinweis-de": "menu-text-hint-de",
  "menu-texthinweis-en": "menu-text-hint-en",
  menue: "menu",
  menue_texthinweis: "menu-text-hint",
  merklisten: "watchlist",
  minus: "minus",
  muelleimer: "trash",
  "neu-laden": "reload",
  news: "news",
  ordner: "folder",
  passwort_ausblenden: "password-hide",
  passwort_einblenden: "password-show",
  pause: "pause",
  persoenliche_einstellungen: "personal-settings",
  "pfeil-anfang": "arrow-start",
  "pfeil-ende": "arrow-end",
  "pfeil-hoch": "arrow-up",
  "pfeil-links": "arrow-left",
  "pfeil-rechts": "arrow-right",
  "pfeil-runter": "arrow-down",
  play: "play",
  plus: "plus",
  rss: "rss",
  schliessen: "close",
  "schloss-geschlossen": "lock-closed",
  "schloss-offen": "lock-open",
  smiley_gluecklich: "smiley-happy",
  smiley_neutral: "smiley-neutral",
  smileys_sehr_gluecklich: "smiley-very-happy",
  smileys_traurig: "smiley-sad",
  smartphone: "smartphone",
  "social-media-icon-x": "social-media-x",
  "social-media-facebook": "social-media-facebook",
  "social-media-instagram": "social-media-instagram",
  "social-media-linkedin": "social-media-linkedin",
  "social-media-threads": "social-media-threads",
  "social-media-twitter": "social-media-twitter",
  "social-media-xing": "social-media-xing",
  "social-media-youtube": "social-media-youtube",
  "sortierung-hoch": "sort-ascending",
  "sortierung-runter": "sort-descending",
  spaeter_festlegen: "set-later",
  standort: "location",
  "stern-gefuellt": "star-filled",
  "stern-outline": "star-outline",
  stop: "stop",
  teilen: "share",
  telefon: "phone",
  "thumbs-down": "thumbs-down",
  "thumbs-up": "thumbs-up",
  "time-out": "time-out",
  ton: "volume",
  "ton-leiser": "volume-down",
  "ton-mute": "volume-mute",
  upload: "upload",
  verschieben: "move",
  warnung: "warning",
  "wischen-hand": "swipe-hand",
  "wischen-pfeile": "swipe-arrows",
  zurueck_zum_cockpit: "back-to-cockpit",
  zuruecksetzen: "reset"
}

/**
 * Normalize icon filename for lookup:
 * - Remove date/version prefixes
 * - Remove KfW branding
 * - Replace special chars with underscores/hyphens
 * - Handle umlauts
 */
function normalizeForLookup(filename) {
  return filename
    .toLowerCase()
    .replace(/^\d{6}_/, "") // Remove date prefix like 240219_
    .replace(/kfw_?/gi, "") // Remove KfW
    .replace(/funktionsicon[_-]?/gi, "") // Remove funktionsicon
    .replace(/\s*\(\d+\)\s*/, "") // Remove (1), (2), etc.
    .replace(/\s+/g, "_") // Spaces to underscores
    .replace(/ü/g, "ue")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/_+/g, "_") // Multiple underscores to single
    .replace(/^_|_$/g, "") // Trim underscores
}

/**
 * Translate German icon name to English
 */
function translateIconName(germanName) {
  const normalized = normalizeForLookup(germanName)

  // Direct mapping
  if (iconNameMap[normalized]) {
    return iconNameMap[normalized]
  }

  // Check without hyphens (convert to underscores)
  const withUnderscores = normalized.replace(/-/g, "_")
  if (iconNameMap[withUnderscores]) {
    return iconNameMap[withUnderscores]
  }

  // Check without underscores (convert to hyphens)
  const withHyphens = normalized.replace(/_/g, "-")
  if (iconNameMap[withHyphens]) {
    return iconNameMap[withHyphens]
  }

  // No mapping found - warn and use normalized
  console.warn(`⚠️  No translation for: "${germanName}" -> normalized to: "${normalized}"`)
  return normalized
}

/**
 * Main function to unzip, translate, and copy icons
 */
async function mapIcons() {
  try {
    console.log("📦 Starting icon mapping process...\n")

    // Step 1: Unzip if needed
    const zipExists = await fs
      .access(iconsDelivered)
      .then(() => true)
      .catch(() => false)

    if (zipExists) {
      console.log(`1️⃣  Unzipping ${iconsDelivered}...`)
      try {
        execSync(`unzip -o "${iconsDelivered}"`, {
          cwd: tempExtractLocation,
          stdio: "pipe"
        })
        console.log("✅ Icons extracted successfully\n")
      } catch {
        console.log("ℹ️  Icons already extracted or extraction failed, continuing...\n")
      }
    }

    // Step 2: Find all SVG files in current directory
    const allFiles = await fs.readdir(tempExtractLocation)
    const svgFiles = allFiles.filter((file) => file.toLowerCase().endsWith(".svg"))
    console.log(`2️⃣  Found ${svgFiles.length} SVG files\n`)

    if (svgFiles.length === 0) {
      console.error("❌ No SVG files found!")
      process.exit(1)
    }

    // Step 3: Clean existing icons folder
    await fs.mkdir(iconsFolder, { recursive: true })
    const existingIcons = await fs.readdir(iconsFolder)
    const existingSvgs = existingIcons.filter((file) => file.toLowerCase().endsWith(".svg"))

    if (existingSvgs.length > 0) {
      console.log(`3️⃣  Cleaning ${existingSvgs.length} existing icons...`)
      for (const file of existingSvgs) {
        await fs.unlink(path.join(iconsFolder, file))
      }
      console.log("✅ Cleanup complete\n")
    } else {
      console.log(`3️⃣  Target folder ready: ${iconsFolder}\n`)
    }

    // Step 4: Process each icon
    console.log("4️⃣  Processing icons...\n")
    const mappingReport = []
    const processedIcons = new Map() // Stores translatedName -> { content, originalFiles[], hasVariants }
    const skippedIdentical = []
    const createdVariants = []

    for (const file of svgFiles) {
      const originalName = path.basename(file, ".svg")
      const translatedName = translateIconName(originalName)
      const sourcePath = path.join(tempExtractLocation, file)

      // Read content to check for duplicates
      const content = await fs.readFile(sourcePath, "utf-8")

      if (processedIcons.has(translatedName)) {
        const existing = processedIcons.get(translatedName)

        // Check if content is identical
        if (existing.content === content) {
          // Same name, same content -> skip, don't create duplicate
          console.log(`   ℹ️  Skipping identical: ${file} (same as ${existing.originalFiles[0]})`)
          existing.originalFiles.push(file)
          skippedIdentical.push({ name: translatedName, file, sameAs: existing.originalFiles[0] })
          continue
        } else {
          // Same name, different content -> add numeric suffix
          const suffix = existing.originalFiles.length + 1
          const finalName = `${translatedName}-${suffix}`
          const finalFilename = `${finalName}.svg`
          const targetPath = path.join(iconsFolder, finalFilename)

          console.warn(`   ⚠️  Different content: ${file} -> ${finalFilename}`)

          await fs.copyFile(sourcePath, targetPath)

          mappingReport.push({
            original: file,
            normalized: normalizeForLookup(originalName),
            translated: finalFilename
          })

          console.log(`   ✓ ${file.padEnd(50)} → ${finalFilename}`)

          existing.originalFiles.push(file)
          existing.hasVariants = true
          createdVariants.push({ name: translatedName, file, finalFilename })
        }
      } else {
        // First occurrence of this translated name
        const finalFilename = `${translatedName}.svg`
        const targetPath = path.join(iconsFolder, finalFilename)

        await fs.copyFile(sourcePath, targetPath)

        mappingReport.push({
          original: file,
          normalized: normalizeForLookup(originalName),
          translated: finalFilename
        })

        console.log(`   ✓ ${file.padEnd(50)} → ${finalFilename}`)

        processedIcons.set(translatedName, {
          content,
          originalFiles: [file],
          hasVariants: false
        })
      }
    }

    // Step 5: Clean up extracted SVGs from demo root
    console.log(`\n5️⃣  Cleaning up extracted files...`)
    for (const file of svgFiles) {
      await fs.unlink(path.join(tempExtractLocation, file))
    }
    console.log("✅ Cleanup complete\n")

    // Step 6: Save mapping report
    const reportPath = "./scripts/icon-mapping-report.json"
    await fs.writeFile(reportPath, JSON.stringify(mappingReport, null, 2))
    console.log(`6️⃣  Mapping report saved: ${reportPath}\n`)

    console.log(`✅ Successfully mapped ${mappingReport.length} icons!`)
    console.log(`📁 Icons available in: ${iconsFolder}`)

    // Show detailed summary
    if (skippedIdentical.length > 0) {
      console.log(`\nℹ️  ${skippedIdentical.length} identical icon(s) were skipped (not duplicated):`)
      for (const item of skippedIdentical) {
        console.log(`   • ${item.file} → ${item.name}.svg (identical to ${item.sameAs})`)
      }
    }

    if (createdVariants.length > 0) {
      console.warn(`\n⚠️  ${createdVariants.length} icon(s) had different content and were suffixed:`)
      for (const item of createdVariants) {
        console.log(`   • ${item.file} → ${item.finalFilename}`)
      }
    }
  } catch (err) {
    console.error("❌ Error during icon mapping:", err.message)
    process.exit(1)
  }
}

mapIcons().catch((err) => {
  console.error("❌ Fatal error:", err)
  process.exit(1)
})
