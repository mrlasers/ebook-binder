import * as Sax from 'sax'
import { Node, Element, Text, isElement, isText } from './node'

interface XMLParserOptions {
  ignoreNS?: boolean
}

export function parse(xml: string, options: XMLParserOptions = {}) {
  return new Promise((resolve, reject) => {
    const parser = Sax.parser(true)

    const rootNode: Element = {
      children: []
    }
    const stack: Element[] = []
    let currentNode: Element = rootNode

    parser.onopentag = function ({ name, attributes }) {
      const newNode = { name, attributes, children: [] }
      currentNode.children.push(newNode)
      stack.push(currentNode)
      currentNode = newNode
    }

    parser.onclosetag = function () {
      currentNode = stack.pop()
    }

    parser.ontext = function (text) {
      if (currentNode !== rootNode) {
        const newNode: Text = { text }
        currentNode.children.push(newNode)
      }
    }

    parser.onend = function () {
      resolve(rootNode.children[0])
    }

    parser.onerror = function (err) {
      reject(err)
    }

    parser.write(xml).close()
  })
}
