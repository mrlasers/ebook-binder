// import { Element, XmlNode, isText } from './xmlParser'

type HasChildren = {
  children: any[]
}

const processNode = (node: HasChildren) => {
  return node.children.reduce((acc, val) => {
    return val
  }, {})
}

// type ConvertConfig = {
//   ignoreNodes?: string[]
//   tags?: { [key: string]: (parent: Element, child: Element) => XmlNode }
//   logger?: (any) => void
// }

// const defaultConfig: ConvertConfig = {
//   ignoreNodes: []
// }

// export const convert = (config: ConvertConfig = defaultConfig) => {
//   return function convertNode(node: XmlNode): XmlNode {
//     if (isText(node)) {
//       return node
//     }

//     if (config.ignoreNodes?.includes(node.name)) {
//       return null
//     }

//     return node.children.reduce(
//       (newNode: Element, child: XmlNode) => {
//         if (isText(child)) {
//           return { ...newNode, children: [...newNode.children, child] }
//         }

//         if (config.tags?.[child.name]) {
//           return config.tags[child.name](newNode, child)
//         }

//         return newNode
//       },
//       {
//         name: node.name,
//         attributes: {},
//         children: []
//       }
//     )
//   }
// }
