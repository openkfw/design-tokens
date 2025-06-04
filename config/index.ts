/**
 * KfW Design Tokens https://github.com/openkfw/design-tokens
 *
 * Copyright (c) 2025 Artur Sopelnik and contributors, KfW
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RegisterTransforms } from "./transform"
import { RegisterFormats } from "./format"
import StyleDictionary from "style-dictionary"
import { FileHeader } from "style-dictionary/types"
import { version } from "../package.json"

export const RegisterCustom = (PREFIX: string) => {
  RegisterTransforms(PREFIX)
  RegisterFormats()

  const customFileHeader: {
    name: string
    fileHeader: FileHeader
  } = {
    name: "kfw-file-header",
    fileHeader: async () => {
      return [
        `KfW Design Tokens v${version}`,
        "Copyright 2025",
        "Licensed under MPL-2.0 (https://github.com/openkfw/design-tokens/blob/main/LICENSE)"
      ]
    }
  }
  StyleDictionary.registerFileHeader(customFileHeader)
}
