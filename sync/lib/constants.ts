/**
 * Constants for bidirectional transformation
 * Copied from config/constants.ts for module resolution
 */

export const PATH_TRANSFORMATIONS = Object.freeze({
  Min: "Mobile",
  Max: "Desktop",
  Static: null
} as const)

export const TYPE_REMAPPING = Object.freeze({
  letterspacing: { $type: "letterSpacing" },
  borderwidth: { $type: "borderWidth" },
  fontfamily: { $type: "fontFamilies" },
  fontweight: { $type: "fontWeights" },
  fontsize: { $type: "fontSizes" },
  lineheight: { $type: "lineHeights" },
  borderradius: { $type: "borderRadius" },
  space: { $type: "spacing" }
} as const)

export const DESIGN_TOOL_EXCLUSIONS = Object.freeze([
  "Layout",
  "Breakpoint",
  "Contentwrapper",
  "Safezone",
  "Focusring",
  "Fluid",
  "Val"
] as const)
