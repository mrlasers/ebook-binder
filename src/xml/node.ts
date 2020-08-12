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

export function getFirstChild(node: Node) {
  if (!isElement(node) || !node.children.length) {
    return null
  }

  return node.children[0]
}

export function getChildByProp(
  node: Node,
  prop: string,
  value: string | number
) {
  if (!isElement(node) || !node.children.length) {
    return null
  }

  for (const i in node.children) {
    if (node.children[i][prop] === value) {
      return node.children[i]
    }
  }

  return null
}
