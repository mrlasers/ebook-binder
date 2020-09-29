import * as XML from '../xml'

export const convert = (parent, node: XML.Node) => {
  if (!XML.isElement(node)) {
    return parent
  }

  switch (node.name) {
    default:
      return node.children.reduce(convert, parent)
    case 'lvl':
      return {
        ...parent,
        level: {
          [node.attributes.ilvl]: node.children.reduce(convert, {})
        }
      }
    case 'numFmt':
      return {
        ...parent,
        format: node.attributes.val
      }
    case 'lvlText':
      return {
        ...parent,
        text: node.attributes.val
      }
    case 'lvlJc':
      return {
        ...parent,
        alignment: node.attributes.val
      }
    case 'ind':
      return {
        ...parent,
        indent: {
          left: node.attributes.left,
          hanging: node.attributes.hanging
        }
      }
  }
}
