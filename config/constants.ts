/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Threshold for px to rem conversion.
 * Values between -PX_TO_REM_THRESHOLD and +PX_TO_REM_THRESHOLD remain as px.
 * Zero values are always converted.
 */
export const PX_TO_REM_THRESHOLD = 2

/**
 * Number of decimal places for percentage calculations
 */
export const PERCENTAGE_DECIMAL_PLACES = 2

/**
 * Multiplier to convert decimal values to percentages
 */
export const PERCENTAGE_MULTIPLIER = 100

/**
 * Valid CSS units for fluid token transformations
 */
export const VALID_CSS_UNITS = Object.freeze(["px", "rem", "em", "vw", "vi", "vh", "vmin", "vmax", "pt", "dp", "%", "cm", "mm", "in", "pc"] as const)

/**
 * Set of valid CSS units for fast lookup
 */
export const VALID_UNITS_SET = new Set(VALID_CSS_UNITS)

/**
 * Token paths that should be excluded from px-to-rem conversion
 * These tokens use browser default font size or should always remain in px
 */
export const PX_TO_REM_EXCLUSIONS = Object.freeze(["breakpoint", "borderradius", "outline-radius"] as const)

/**
 * Token paths that should be excluded from design tool export (Figma/Penpot)
 */
export const DESIGN_TOOL_EXCLUSIONS = Object.freeze(["Layout", "Breakpoint", "Contentwrapper", "Safezone", "Focusring", "Borderstyle", "Fluid", "Val"] as const)

/**
 * Path segment transformations for design tool export
 */
export const PATH_TRANSFORMATIONS = Object.freeze({
  Min: "Mobile",
  Max: "Desktop",
  Static: null // null means remove this segment
} as const)

/**
 * Token type remapping for design tool compatibility
 * Maps path keywords to their corresponding $type values
 */
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
