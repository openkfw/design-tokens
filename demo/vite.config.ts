// vite.config.js
import { defineConfig } from "vite"
import postcssCustomMedia from "postcss-custom-media"

export default defineConfig({
  base: "https://openkfw.github.io/design-tokens/demo/dist/",
  css: {
    postcss: {
      plugins: [postcssCustomMedia()]
    }
  }
})
