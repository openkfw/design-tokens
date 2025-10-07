// vite.config.js
import { defineConfig } from "vite"
import postcssCustomMedia from "postcss-custom-media"
import stylelint from "vite-plugin-stylelint"

export default defineConfig({
  base: "https://openkfw.github.io/design-tokens/demo/dist/",
  plugins: [stylelint()],
  css: {
    postcss: {
      plugins: [postcssCustomMedia()]
    }
  }
})
