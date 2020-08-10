import * as Sax from 'sax'

/*
    We want to parse an XML document string into a monad containing the document
    data and functions for retrieving and mapping over elements

    # Methods

    1. getFirstChild: returns first child element
    2. getFirstChildByName: returns first child with supplied name
    3. getText?: returns string containing text
    4. getObjectValue: returns plain JS object value

    Element can either be a Text value or a Node value

    A text value has a type of 'text' and 
*/

export class Element {
  #value: object

  constructor(value) {
    this.#value = {}
  }

  static of(value) {
    return new Element(value)
  }
}

export interface Tag {
  name: string
  attributes: { [key: string]: string | Sax.QualifiedAttribute }
}

export type element = text | node

export interface text {
  type: 'text'
  text: string
}

export interface RootNode {
  children: element[]
}

export interface node extends RootNode {
  type: 'node'
  name: string
  attributes: { [key: string]: string }
}

export function createElement (input: string): text
export function createElement (input: Tag): node
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

interface XMLParserOptions {
  ignoreNS?: boolean
}

export function parse (xml: string, options: XMLParserOptions = {}) {
  return new Promise((resolve, reject) => {
    const parser = Sax.parser(true)

    const rootNode = createElement()
    const stack = []
    let currentNode: RootNode & Partial<node> = rootNode

    parser.onopentag = function ({ name, attributes }) {
      const newNode = createElement({
        name: options?.ignoreNS ? name.replace(/.+\:/, '') : name,
        attributes
      })

      currentNode.children.push(newNode)
      stack.push(currentNode)
      currentNode = newNode
    }

    parser.onclosetag = function () {
      currentNode = stack.pop()
    }

    parser.onend = function () {
      resolve(rootNode.children[0])
    }

    parser.ontext = function (text) {
      if (currentNode !== rootNode) {
        const newNode = createElement(text)
        currentNode.children.push(newNode)
      }
    }

    parser.onerror = function (e) {
      console.error('we have a problem!!!')
      reject()
    }

    parser.write(xml).close()
  })
}
