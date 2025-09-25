// vite.config.js
import { defineConfig } from "vite"
import postcssCustomMedia from "postcss-custom-media"

export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssCustomMedia()]
    }
  }
})
