import { isT, isNotT, defineIsT } from 'safe-type-predicate'
import { parse, Node, Element, isText } from '../xml/xml-parser'

// document.xml

/*

    1. Parse document.xml
    2. get body
    3. convert body to slate objects

*/

function firstChildByName(node: Node, name: string) {
  if (isText(node)) {
    return
  }
  return node.children.find((n) => n.name === name)
}

export function document(doc: Node): Node {
  return {
    children: []
  }
}
