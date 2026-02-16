/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-plugin-logical-css/configs/recommended"],
  plugins: ["stylelint-media-use-custom-media", "stylelint-plugin-logical-css"],
  rules: {
    "declaration-property-value-no-unknown": [
      true,
      {
        "ignoreProperties": {
          "background-image": ["/^svg-load/"]
        }
      }
    ],
    "csstools/media-use-custom-media": "always",
    "selector-class-pattern": [
      "^[a-z]([-]?[a-z0-9]+)*(__[a-z0-9]([-]?[a-z0-9]+)*)?(--[a-z0-9]([-]?[a-z0-9]+)*)?$",
      {
        resolveNestedSelectors: true,
        message: function expected(selectorValue) {
          return `Expected class selector "${selectorValue}" to match BEM CSS pattern https://en.bem.info/methodology/css. Selector validation tool: https://regexr.com/3apms`
        }
      }
    ]
  }
}
