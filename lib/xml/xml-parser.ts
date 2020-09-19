import * as Sax from 'sax'
import { Node, Element, Text, isElement, isText } from './node'

interface XMLParserOptions {
  ignoreNS?: boolean
}

function isQualifiedTag(
  tag: Sax.QualifiedTag | Sax.Tag
): tag is Sax.QualifiedTag {
  return (tag as Sax.QualifiedTag).local !== undefined
}

function isQualifiedAttr(
  attr: Sax.QualifiedAttribute | string
): attr is Sax.QualifiedAttribute {
  return (attr as Sax.QualifiedAttribute).local !== undefined
}

export function parse(xml: string, options: XMLParserOptions = {}) {
  return new Promise((resolve, reject) => {
    const parser = Sax.parser(true, { xmlns: options.ignoreNS })

    const rootNode: Element = {
      children: []
    }
    const stack: Element[] = []
    let currentNode: Element = rootNode

    parser.onopentag = function (tag) {
      const { name, attributes } = tag
      const newNode = {
        name: isQualifiedTag(tag) ? tag.local : tag.name,
        attributes: Object.keys(tag.attributes).reduce((acc, key) => {
          const attr = tag.attributes[key]
          const name = isQualifiedAttr(attr) ? attr.local : key

          return {
            ...acc,
            [name]: isQualifiedAttr(attr) ? attr.value : attr
          }
        }, {}),
        children: []
      }
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
