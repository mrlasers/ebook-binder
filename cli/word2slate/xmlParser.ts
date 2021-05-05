import * as Sax from 'sax'
// import { Text } from 'slate'

export type Text = {
  text: string
}

export const isText = (node: XmlNode): node is Text => {
  return Object.keys(node).length === 1 && 'text' in node
}

export type Element = {
  name?: string
  attributes?: object
  children: (Text | Element)[]
}

const Element = (node: Element | string): XmlNode => {
  if (typeof node === 'string') {
    return { text: node }
  }
}

export type XmlNode = Text | Element

export const processAttrs = (attrs) => {
  // return attrs
  return Object.keys(attrs).reduce((acc, key) => {
    const attr = attrs[key]
    const { local } = attr
    const hasNamespace = local !== undefined
    // console.log('preprocess attr:', attr)
    const result = {
      ...acc,
      [hasNamespace ? attr.name : key]: hasNamespace ? attr.value : attr
    }

    // console.log('processed attr:', result)
    return result
  }, {})
}

export function parse(xml: string) {
  return new Promise<XmlNode>((resolve, reject) => {
    const parser = Sax.parser(true, { xmlns: true })

    const rootNode: Element = { children: [] }
    const stack: Element[] = []
    let currentNode: Element = rootNode

    parser.onopentag = (tag) => {
      const { name, attributes } = tag
      const newNode = {
        name: tag.name,
        attributes: processAttrs(attributes),
        children: []
      }

      currentNode.children.push(newNode)
      stack.push(currentNode)
      currentNode = newNode
    }

    parser.onclosetag = () => {
      currentNode = stack.pop()
    }

    parser.ontext = (text) => {
      if (currentNode !== rootNode) {
        currentNode.children.push({ text })
      }
    }

    parser.onend = () => {
      return resolve(rootNode.children[0])
    }

    parser.onerror = (err) => {
      return reject(err)
    }

    parser.write(xml).close()
  })
}
