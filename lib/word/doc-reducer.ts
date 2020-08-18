import { Node, Element, getChildByProp, isElement, isText } from '../xml/node'

function paraPropReducer(props, prop) {
  switch (prop.name) {
    default:
      return props
    case 'w:pStyle':
      return { ...props, style: prop.attributes['w:val'] }
  }
}

export function paraProperties(props): {} {
  return props.reduce((props, prop) => {
    if (!isElement(prop)) {
      return props
    }

    return paraPropReducer(props, prop)
  }, {})
}

export function paragraphNode(node: Element) {
  const paragraph = node.children.reduce(
    (para: Element, child: Node) => {
      if (!isElement(child)) {
        return para
      }

      const children: Node[] = child.children
      if (child.name === 'w:pPr' && children) {
        return {
          ...para,
          properties: paraProperties(children)
        }
      }
      return para
    },
    { type: 'paragraph', children: [] }
  )
  return paragraph
}

export function parseDocx(doc: Element) {
  const body = getChildByProp(doc, 'name', 'w:body')

  let stack: Node[] = []

  if (!isElement(body)) {
    return null
  }

  for (const i in body.children) {
    const child = body.children[i]
    if (child.name === 'w:p') {
      stack.push({ type: 'paragraph', children: [] })
    }
  }

  const result = body.children.reduce(
    (acc: Element, child: Node) => {
      if (isText(child)) {
        return { children: [...acc.children, child] }
      }
      if (child.name === 'w:p') {
        return {
          children: [...acc.children, paragraphNode(child)]
        }
      }
    },
    { children: [] }
  )

  return result // { children: stack }
}
