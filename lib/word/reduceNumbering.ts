import * as XML from '../xml'

type Numbering = {
  abstractNumbers?: {
    [key: string]: any
    level?: {
      [key: number]: any
    }
  }
  numbers?: {
    [key: string]: any
  }
}

export const convert = (acc: Numbering | null, node: XML.Node) => {
  if (!XML.isElement(node)) {
    return {
      abstractNumbers: {},
      numbers: {}
    }
  }

  const parent = acc || {
    abstractNumbers: {},
    numbers: {}
  }

  // return
  switch (node.name) {
    default:
      return XML.isElement(node)
        ? node.children.reduce(convert, parent)
        : parent
    case 'abstractNum':
      return {
        ...parent,
        abstractNumbers: {
          ...parent.abstractNumbers,
          [node.attributes.abstractNumId]: node.children.reduce(convert, {})
        }
      }
    case 'lvl':
      return {
        ...parent,
        level: parseInt(node.attributes.ilvl)
      }
    case 'numFmt':
      return {
        ...parent,
        format: node.attributes.val
      }
    case 'num':
      return {
        ...parent,
        numbers: {
          ...parent.numbers,
          [node.attributes.numId]: node.children.reduce(convert, {})
        }
      }
    case 'abstractNumId': {
      return {
        ...parent,
        abstractNumId: parseInt(node.attributes.val, 0)
      }
    }
  }
}
