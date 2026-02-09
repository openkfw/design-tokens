/**
 * Shared TypeScript types for bidirectional Figma sync
 */

export type TransformationType =
  | "path:remove-semantic"
  | "path:remove-default"
  | "path:rename"
  | "path:humancase"
  | "path:remove-static"
  | "type:remap"
  | "value:resolve-reference"
  | "value:lineheight-percent"
  | "value:color-hex"
  | "value:fluid"

export interface Transformation {
  type: TransformationType
  removed?: string
  from?: string
  to?: string
  originalReference?: string
  resolvedValue?: unknown
}

export interface ContractEntry {
  sourcePath: string
  sourceFile: string
  transformations: Transformation[]
  metadata?: {
    $description?: string
    $fluid?: {
      min?: string | number
      max?: string | number
    }
    [key: string]: unknown
  }
}

export interface Contract {
  version: string
  generated: string
  basePxFontSize?: number
  theme?: string
  transforms: Record<string, ContractEntry>
}

export interface FigmaToken {
  $value: unknown
  $type: string
  $description?: string
  [key: string]: unknown
}

export interface FigmaTokens {
  [key: string]: FigmaToken | FigmaTokens
}

export interface W3CToken {
  $value: unknown
  $type: string
  $description?: string
  $fluid?: {
    min?: string | number
    max?: string | number
  }
  [key: string]: unknown
}

export interface W3CTokens {
  [key: string]: W3CToken | W3CTokens
}

export interface VariableDiff {
  type: "added" | "modified" | "deleted"
  path: string
  before?: unknown
  after?: unknown
  contractPath?: string
}
