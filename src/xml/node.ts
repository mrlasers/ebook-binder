import * as Sax from 'sax'

// node types based on SlateJS
export type Node = Text | Element

export interface Text {
  text: string
  [key: string]: unknown
}

export interface Element {
  children: Node[]
  [key: string]: unknown | string | Sax.QualifiedAttribute
}

export function isText(node: Node): node is Text {
  return (node as Text).text !== undefined
}

export function isElement(node: Node): node is Element {
  return (node as Element).children !== undefined
}
