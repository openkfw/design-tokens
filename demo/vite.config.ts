import { defineConfig } from "vite"
import postcssCustomMedia from "postcss-custom-media"
import stylelint from "vite-plugin-stylelint"
import { resolve } from "path"

export default defineConfig({
  base: "https://openkfw.github.io/design-tokens/demo/dist/",
  plugins: [stylelint()],
  css: {
    postcss: {
      plugins: [postcssCustomMedia()]
    }
  },
  build: {
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
            if (name.includes("fonts")) return "css/fonts.min[extname]"
            if (name.includes("style")) return "css/style.min[extname]"
          }

          if (/\.(woff2?|ttf|eot|otf)$/.test(name)) {
            return "fonts/[name]-[hash].[extname]"
          }

          return "[name]-[hash].[extname]"
        }
      }
    }
  }
})
