import * as Sax from 'sax'
import { QualifiedAttribute } from 'sax'

export type Node = Text | Block

export interface Text {
  type: 'text'
  text: string
}

export interface Block {
  type: 'node'
  name: string
  attributes?: { [key: string]: string | QualifiedAttribute }
  children: Node[]
}

export function parse (xml: string) {
  return new Promise((resolve, reject) => {
    const parser = Sax.parser(true)

    const root: Node = { type: 'node', name: 'root', children: [] }
    const stack = []
    let currentNode = root

    parser.onopentag = function ({ name, attributes }) {
      console.log('open (currentNode):', currentNode)

      const newNode: Node = {
        type: 'node',
        name,
        attributes,
        children: []
      }

      currentNode.children.push(newNode)
      stack.push(currentNode)
      currentNode = newNode
    }

    parser.onclosetag = function () {
      currentNode = stack.pop()
    }

    parser.onend = function () {
      resolve(root.children[0])
    }

    parser.ontext = function (text) {
      const newNode: Node = {
        type: 'text',
        text
      }

      currentNode.children.push(newNode)
    }

    parser.onerror = function (e) {
      console.error('we have a problem!!!')
      reject()
    }

    parser.write(xml).close()
  })
}

// interface Text {
//   type: 'text'
//   text: string
// }

// interface Block {
//   type: 'node'
//   name: string
//   attributes?: object
//   children: (Block | Text)[]
// }

// type Node = Text | Block

// interface CreateNodeParams {
//   name?: string
//   text?: string
//   attributes: object
//   children: (Block | Text)[]
// }

// export function createTextNode (text): Text {
//   return {
//     type: 'text',
//     text
//   }
// }

// export function createBlockNode ({
//   name,
//   attributes = {},
//   children = []
// }): Block {
//   return {
//     type: 'node',
//     name,
//     attributes,
//     children
//   }
// }

// export function createNode ({
//   name,
//   text,
//   attributes,
//   children
// }: CreateNodeParams): Node {
//   if (text) {
//     return {
//       type: 'text',
//       text
//     }
//   }

//   return {
//     type: 'node',
//     name,
//     attributes: {},
//     children: []
//   }
// }

// export function xml (xml: string) {
//   const parser = Sax.parser(true)

//   const stack = []

//   parser.onopentag = function (node) {}

//   return {}
// }
