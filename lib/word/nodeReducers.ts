import { produce } from 'immer'
import { Children } from 'react'
import * as XML from '../xml'
import { isText } from '../xml'

export type WordNode = WordElement | WordText | WordError

export type WordError = {
  type: 'error'
  msg: string
}

export type WordText = {
  text: string
}

export type WordElement = {
  type?: string | null
  properties?: {
    [key: string]: boolean | number | string
  }
  children: WordNode[]
}

type WordProps = { [key: string]: boolean | number | string }
interface PropsElement extends XML.Element {
  attributes: {
    val?: string
  }
}

export function isWordText(node: WordNode): node is WordText {
  return (node as WordText)?.text !== undefined
}

export function isWordError(node: WordNode): node is WordError {
  return (
    (node as WordError).type === 'error' &&
    (node as WordError).msg !== undefined
  )
}

export function isWordElement(node: WordNode): node is WordElement {
  return (
    (node as WordElement).children !== undefined &&
    (node as WordElement).type !== undefined
  )
}

// Text(t) -> Text(t.children[0])

export const t = (el: XML.Node): WordText | XML.Node => {
  return XML.isText(el) ? { text: el.text } : el
}

export const r = (el: XML.Node): WordNode | XML.Node => {
  if (!XML.isElement(el)) {
    return el
  }

  if (
    !Object.keys(el.attributes).length &&
    el.children.length === 1 &&
    XML.isText(el.children[0])
  ) {
    return { text: el.children[0].text }
  }
}

export const p = (parent: XML.Node): WordElement | XML.Node => {
  if (!XML.isElement(parent)) {
    return parent
  }
  return {
    type: 'paragraph',
    properties: {},
    children: parent.children
  }
}

const wordElement = (node?: Partial<WordElement>): WordElement => {
  return {
    type: node?.type ?? null,
    properties: node?.properties ?? {},
    children: node?.children ?? []
  }
}

export const convertNode = (node) => {}

export const convert = (acc: WordElement | null, el: XML.Node): WordNode => {
  const parent = acc || wordElement()

  if (XML.isText(el)) {
    // kinda a hack, maybe
    // if parent has properties, we assume that we want to keep the parent
    // ; otherwise, we want to lift the Text node
    return Object.keys(parent.properties).length
      ? {
          ...parent,
          children: [...parent.children, { text: el.text }]
        }
      : { text: el.text }
  }

  // if (!isWordElement(acc)) {
  //   return acc
  // }

  // const children = parent.children.reduce(convert, parent)

  switch (el.name) {
    default:
      return el.children.reduce(convert, parent)
    case 'r': {
      // is this kinda a hack?
      const newRun = el.children.reduce(convert, {
        ...parent,
        type: 'span'
      })

      // return {
      //   ...parent,
      //   children: [...parent.children, newRun]
      // }
      return acc
        ? { ...parent, children: [...parent.children, newRun] }
        : newRun
    }
    case 'p': {
      const newParagraph = el.children.reduce(convert, {
        ...parent,
        type: 'paragraph'
      })

      return acc
        ? { ...parent, children: [...parent.children, newParagraph] }
        : newParagraph
    }
    case 'body':
      return {
        type: 'body',
        properties: {},
        children: el.children.map((n) => convert(null, n))
      }
    case 'rStyle': {
      return {
        ...parent,
        properties: {
          ...parent.properties,
          style: el.attributes.val
        }
      }
    }
    case 'b':
      return {
        ...parent,
        properties: {
          ...parent.properties,
          bold: true
        }
      }
    case 'i':
      return {
        ...parent,
        properties: {
          ...parent.properties,
          italic: true
        }
      }
    case 'u':
      return {
        ...parent,
        properties: {
          ...parent.properties,
          underline: true
        }
      }
    // table
    case 'tbl':
      return el.children.reduce(convert, {
        ...parent,
        type: 'table'
      })
    case 'tr': {
      const newRow = el.children.reduce(convert, {
        type: 'table-row',
        properties: {},
        children: []
      })

      return {
        ...parent,
        children: [...parent.children, newRow]
      }
    }
    case 'tc': {
      const newCell = el.children.reduce(
        convert,
        wordElement({
          type: 'table-cell'
        })
      )

      return {
        ...parent,
        children: [...parent.children, newCell]
      }
    }
    // drawing / image
    case 'drawing':
      return el.children.reduce(convert, {
        ...parent,
        type: 'image'
      })
    case 'inline':
      return el.children.reduce(convert, {
        ...parent,
        properties: {
          ...parent.properties,
          inline: true
        }
      })
    case 'blip':
      return {
        ...parent,
        properties: { ...parent.properties, id: el.attributes.embed }
      }
    case 'cNvPr': // non-visual image properties
      return {
        ...parent,
        properties: {
          ...parent.properties,
          name: el.attributes.name,
          description: el.attributes.descr
        }
      }
  }

  // return el.children.reduce<WordElement>(
  //   produce((acc, child: XML.Node) => {
  //     if (!XML.isElement(child)) {
  //       child
  //     }

  //     switch (child.name) {
  //       default:
  //         return acc
  //       case 't':
  //         if (XML.isText(child.children[0])) {
  //           return { text: child.children[0].text }
  //         }
  //     }
  //   }),
  //   {
  //     type: undefined,
  //     properties: undefined,
  //     children: undefined
  //   }
  // )
}

// export const mergeChildren = (nodes: WordNode[]): WordNode[] => {
//   // console.log('mergeChildren:', nodes)
//   return nodes.reduce(
//     produce((acc, child) => {
//       if (!isWordElement) {
//         acc.push(child)
//       }

//       switch (child.type) {
//         default:
//           acc.push(child)
//           return
//         case 'list':
//           const prev = acc[acc.length - 1]

//           const listitem = {
//             type: 'listitem',
//             properties: {},
//             children: child.children
//           }

//           if (!prev || prev.properties.listId !== child.properties.listId) {
//             acc.push({
//               type: 'list',
//               properties: child.properties,
//               children: [listitem]
//             })

//             return
//           }

//           prev.children.push(listitem)

//         // const prev = acc[acc.length - 1]
//         // if (prev.name !== 'list' || prev?.properties?.numId) {
//         //   acc.push({
//         //     type: 'list',
//         //     properties: child.properties,
//         //     children: [
//         //       {
//         //         type: 'listItem',
//         //         properties: {},
//         //         children: child.children
//         //       }
//         //     ]
//         //   })
//         //   return
//         // }

//         // prev.children.push({
//         //   type: 'listitem',
//         //   properties: {},
//         //   children: child.children
//         // })
//         // return
//       }
//     }),
//     []
//   )
// }

// export const doChildren = (el: Node): WordNode => {
//   if (isText(el)) {
//     return {
//       text: el.text
//     }
//   }

//   const { type, properties, children } = el.children.reduce<WordElement>(
//     produce((acc, child) => {
//       if (!child.children) {
//         return acc
//       }

//       switch (child.name) {
//         default:
//           return acc
//         case 't':
//           acc.children.push({
//             text: isText(child.children[0]) ? child.children[0].text : ''
//           })
//           return
//         case 'r': {
//           const { type, properties, children } = doChildren(
//             child
//           ) as WordElement
//           if (!properties && children.length === 1 && isWordText(children[0])) {
//             return children[0]
//           }

//           acc.children = [...acc.children, ...children]
//           return
//         }
//         case 'p': {
//           console.log('p', child)
//           const { type, properties, children } = doChildren(
//             child
//           ) as WordElement

//           return {
//             type: 'paragraph',
//             properties: properties,
//             children: children
//           }
//         }
//         case 'pPr':
//           return {
//             ...acc,
//             ...doChildren(child)
//           }
//         case 'pStyle':
//           acc.properties = { ...acc.properties, style: child.attributes.val }
//           return
//         case 'numPr':
//           return {
//             ...doChildren(child),
//             type: 'list'
//           }
//         case 'ilvl':
//           acc.properties.listLevel = parseInt(child.attributes.val)
//           return
//         case 'numId':
//           acc.properties.listId = parseInt(child.attributes.val)
//           return
//       }
//     }),
//     {
//       type: null,
//       properties: {},
//       children: []
//     }
//   )

//   return {
//     type,
//     properties,
//     children: children ? mergeChildren(children) : []
//   }
// }
