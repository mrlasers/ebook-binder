import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { Node, Element, isText, isElement } from '@mrlasers/xml-parser'

export const byName = (name: string) => (node: Node) => {
  return !isText(node) && node.name === name
}

export const getChild =
  (predicate: (el: Node) => boolean) => (node: Element) => {
    return node.children.find(predicate)
  }

export const getChildByName = (name: string) => getChild(byName(name))

export interface ElementProcessor {
  (el: Element, parent?: Element, next?: (n: Node) => Node): Node
}

export const wDocument: ElementProcessor = getChildByName('w:body')

export const wBody: ElementProcessor = (el) => {
  return {
    name: 'document',
    attributes: {},
    children: el.children.filter(isElement)
  }
}

export const wP = (el: Element, parent: Element) => {}

export interface NodeProcessor {
  (node: Node): Node
}

export const nodeProcessor = (
  processors: { [key: string]: ElementProcessor },
  parent?: Element
) =>
  function process(node: Node) {
    if (isText(node)) {
      return null
    }

    if (!processors[node.name]) {
      return null
    }

    return processors[node.name](node, parent, process)
  }

// export const processor = nodeProcessor({
//   'w:document': wDocument,
//   'w:body': wBody
// })

export const getFirstChildByName = (name: string) => (node: Node) => {
  if (isText(node)) {
    return O.none
  }

  return O.fromNullable(
    node.children.find((n) => !isText(n) && n.name === name)
  )
}

const processorFunctions = {
  'w:body': {
    process: (element: Element, parent: Element) => element,
    allowText: false
  },
  'w:p': {
    process: (element: Element, parent: Element) => ({
      ...parent,
      children: [
        ...parent.children,
        { name: 'paragraph', attributes: {}, children: [] }
      ]
    })
  }
}

export const processor = (parent?: Element) => (node: Node) => {
  if (isText(node)) {
    return node
  }

  return node.children.reduce(
    (acc, child) => {
      if (isText(child)) {
        if (
          parent &&
          processorFunctions[parent.name] &&
          processorFunctions[parent.name].allowText
        ) {
          return {
            ...parent,
            children: [...parent.children, child]
          }
        }
        return acc
      }

      return processorFunctions[child.name]
        ? processorFunctions[child.name].process(child, acc)
        : acc
    },
    {
      node
    }
  )
}

export const _processor = (parent?: Element) => (node: Node) => {
  if (isText(node)) {
    return null
  }

  switch (node.name) {
    default:
      return parent || node
    case 'w:document':
      return pipe(
        node,
        getFirstChildByName('w:body'),
        O.map(processor()),
        O.fold(
          () => null,
          (value) => value
        )
      )
    case 'w:body':
      return {
        name: 'document',
        attributes: {},
        children: node.children.map(processor())
      }
    case 'w:p':
      return node.children.reduce<Element>(
        (acc, child) => {
          return processor(acc)(child)
        },
        { name: 'paragraph', attributes: {}, children: [] }
      )
    case 'w:pPr':
      return node.children.reduce<Element>((acc, prop) => {
        if (isText(prop)) {
          return acc
        }
        switch (prop.name) {
          default:
            return acc
          case 'w:pStyle':
            if (prop.attributes['w:val']) {
              return {
                ...acc,
                attributes: {
                  ...acc.attributes,
                  style: prop.attributes['w:val']
                }
              }
            }
            return acc
        }
      }, parent)
    case 'w:r':
      return {
        ...parent,
        children: [
          ...parent.children,
          node.children.reduce(
            (acc, child) => {
              return processor(node)(child)
            },
            {
              name: 'run',
              attributes: {},
              children: []
            }
          )
        ]
      }
    case 'w:t':
      return {
        ...parent,
        children: [...parent.children, node.children[0]]
      }
  }
}
