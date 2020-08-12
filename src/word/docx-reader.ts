import { isT, isNotT, defineIsT } from 'safe-type-predicate'
import { parse } from '../xml/xml-parser'
import { Node, Element, isText, isElement } from '../xml/node'

// document.xml

/*

    1. Parse document.xml
    2. get body
    3. convert body to slate objects

*/

/*



*/

export function nodeToText(node: Node): string {
  if (isText(node)) {
    return node.text
  }

  return node.children.map(nodeToText).join('')
}

function firstChildByName(node: Node, name: string): Node {
  if (isText(node)) {
    return
  }
  return node.children.find((n) => n.name === name)
}

// function mapPPropsToAttrs(props: Node[]) {
//   return props.reduce((attrs, prop) => {
//     if (!prop.name) {
//       return attrs
//     }

//     switch (prop.name) {
//       default:
//         return attrs
//       case 'w:pStyle':
//         return { ...attrs, style: prop.attributes['w:val'] }
//     }
//   }, {})
// }

// const TAG_ELEMENTS = {
//   'w:p': (node: Element) => {
//     const props: Node = node.children.find((n) => n.name && n.name === 'w:pPr')

//     const children = props ? node.children.slice(1) : node.children

//     return {
//       type: 'paragraph',
//       attributes: mapPPropsToAttrs(props.children),
//       children: children
//     }
//   }
// }

// const mapNodes = (mappings: {}) =>
//   function _map(node: Node) {
//     if (isText(node)) {
//       return node.text
//     }

//     if (node.name && typeof node.name === 'string' && mappings[node.name]) {
//       return mappings[node.name](node)
//     }

//     return nodeToText(node)
//   }

export function xmlToDocument(doc: Node): Node {
  const body = firstChildByName(doc, 'w:body')

  if (!isElement(body)) {
    return null
  }

  // return { children: body.children.map(mapNodes(TAG_ELEMENTS)) }

  const children: Node[] = []
  let section: Node = { children: [] }

  for (const n in body.children) {
    section.children.push(body.children[n])
  }

  return { children: [section] }
}
