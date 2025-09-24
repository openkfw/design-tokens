/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { upperFirst } from "lodash"
import type { PlatformConfig } from "style-dictionary/types"

export function humanCase(str: string): string {
  return str.toLowerCase().split(/\s/).map(upperFirst).join(" ")
}

export const getBasePxFontSize = (config: PlatformConfig) => config?.basePxFontSize || 16

export const formatUnitValue = (obj: unknown, platform: PlatformConfig): string | undefined => {
  if (typeof obj === "object" && obj !== null) {
    const { unit, value } = obj as { unit?: string; value?: number }
    if (typeof unit === "string" && typeof value === "number") {
      return unit === "rem" ? `${value * getBasePxFontSize(platform)}${unit}` : `${value}${unit}`
    }
  }
  return undefined
}

export const isPascalCase = (str: string) => {
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/
  return pascalCaseRegex.test(str)
}

export const kebabToPascalCase = (str: string) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Wandle jedes Wort um
    .join("")
}
