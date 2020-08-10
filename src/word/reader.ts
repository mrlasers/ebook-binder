import * as Sax from 'sax'

export interface Tag {
  name: string
  attributes: { [key: string]: string | Sax.QualifiedAttribute }
}

export type Element = Text | Node

export interface Text {
  type: 'text'
  text: string
}

export interface RootNode {
  children: Element[]
}

export interface Node extends RootNode {
  type: 'node'
  name: string
  attributes: { [key: string]: string }
}

export function createElement (input: string): Text
export function createElement (input: Tag): Node
export function createElement (input: void): RootNode
export function createElement (input: any): any {
  if (typeof input === 'undefined') {
    return { children: [] }
  }

  if (typeof input === 'string') {
    return {
      type: 'text',
      text: input
    }
  }

  const { name, attributes = {} } = input
  return {
    type: 'node',
    name,
    attributes,
    children: []
  }
}

export function parse (xml: string) {
  return new Promise((resolve, reject) => {
    const parser = Sax.parser(true)

    const root = createElement()
    const stack = []
    let currentNode: RootNode & Partial<Node> = root

    parser.onopentag = function (tag) {
      const newNode = createElement(tag)

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
      const newNode = createElement(text)

      currentNode.children.push(newNode)
    }

    parser.onerror = function (e) {
      console.error('we have a problem!!!')
      reject()
    }

    parser.write(xml).close()
  })
}
