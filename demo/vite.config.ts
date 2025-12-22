import { defineConfig } from "vite"
import postcssCustomMedia from "postcss-custom-media"
import stylelint from "vite-plugin-stylelint"
import { resolve } from "path"
import fs from "fs"
import path from "path"
import type { OutputAsset } from "rollup"
import postcssSvgo from "postcss-svgo"
import autoprefixer from "autoprefixer"

// @ts-expect-error: TypeScript cannot infer the type from this JS module
import postcssSvgLoadPlugin from "./scripts/postcss.svg-load-plugin.js"

// @ts-expect-error: TypeScript cannot infer the type from this JS module
import postcssColorToFilterPlugin from "./scripts/postcss.color-to-filter.js"

export default defineConfig({
  base: "https://openkfw.github.io/design-tokens/demo/dist/",
  plugins: [
    stylelint(),
    {
      name: "copy-css-without-hash",
      generateBundle(options, bundle) {
        const cssDir = path.join(options.dir || "dist", "css")
        fs.mkdirSync(cssDir, { recursive: true })

        for (const asset of Object.values(bundle)) {
          if ((asset as OutputAsset).type === "asset" && (asset as OutputAsset).fileName?.endsWith(".css")) {
            const outputAsset = asset as OutputAsset
            const cleanName = outputAsset.fileName.includes("style") ? "style.min.css" : null

            if (cleanName && typeof outputAsset.source === "string") {
              let content = outputAsset.source as string
              content = content.replace(/\/\*\$vite\$:[0-9]+\*\//g, "")
              fs.writeFileSync(path.join(cssDir, cleanName), content)
            }
          }
        }
      }
    }
  ],
  css: {
    postcss: {
      plugins: [postcssCustomMedia(), autoprefixer(), postcssSvgo(), postcssSvgLoadPlugin(), postcssColorToFilterPlugin()]
    }
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        style: resolve(__dirname, "src/style.css"),
        fonts: resolve(__dirname, "src/fonts/font-face.css")
      },
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0]

          // CSS-spezifische Anpassungen
          if (name.endsWith(".css")) {
            console.log(name)
            if (name.includes("fonts")) return "css/fonts-[hash].min[extname]"
            if (name.includes("style")) return "css/style-[hash].min[extname]"
          } // @todo add version without hash for npm package usage

          if (/\.(woff2?|ttf|eot|otf)$/.test(name)) {
            return "fonts/[name].[extname]"
          }

          return "[name]-[hash].[extname]"
        }
      }
    }
  }
})
