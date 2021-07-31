import { Node, Element, isText, isElement } from '@mrlasers/xml-parser'
import * as Fp from '../../../lib/fp'

export function body(el: Element) {
  return el.children.reduce<Element>(
    (acc, child) => {
      // ignore direct text children
      if (isText(child)) {
        return acc
      }

      switch (child.name) {
        default:
          return acc
        case 'w:p':
          return p(child, acc)
      }
    },
    { name: 'document', attributes: {}, children: [] }
  )
}

export function p(el: Element, parent: Element) {
  const paragraph = el.children.reduce<Element>(
    (acc, child) => {
      // ignore direct text children
      if (isText(child)) {
        return acc
      }

      switch (child.name) {
        default:
          return acc
        case 'w:pPr':
          return pPr(child, acc)
        case 'w:r':
          return r(child, acc)
      }
    },
    {
      name: 'paragraph',
      attributes: {},
      children: []
    }
  )

  return {
    ...parent,
    children: [...parent.children, paragraph]
  }
}

export function pPr(el: Element, parent: Element) {
  return el.children.reduce<Element>((acc, child) => {
    // ignore direct text children
    if (isText(child)) {
      return acc
    }

    switch (child.name) {
      default:
        return acc
      case 'w:pStyle': {
        const styleName = child.attributes['w:val']?.toString()
        if (styleName) {
          if (styleName.match(/^Heading[0-9]+$/)) {
            return {
              ...acc,
              name: 'heading',
              attributes: {
                ...acc.attributes,
                level: styleName.replace(/^Heading/g, '')
              }
            }
          }

          return {
            ...acc,
            attributes: {
              ...acc.attributes,
              style: child.attributes['w:val']
            }
          }
        }

        return acc
      }
    }
  }, parent)
}

export function r(el: Element, parent: Element) {
  const run = el.children.reduce<Element>(
    (acc, child) => {
      // ignore direct text children
      if (isText(child)) {
        return acc
      }

      switch (child.name) {
        default:
          return acc
        case 'w:t':
          return t(child, acc)
      }
    },
    {
      name: 'run',
      attributes: {},
      children: []
    }
  )

  if (run.children.length === 0) {
    return parent
  }

  if (
    run.children.length === 1 &&
    isText(run.children[0]) &&
    Object.keys(run.attributes).length === 0
  ) {
    return { ...parent, children: [...parent.children, run.children[0]] }
  }

  return { ...parent, children: [...parent.children, run] }
}

export function t(el: Element, parent: Element) {
  if (el.children.length === 1 && isText(el.children[0])) {
    const [childs, lastChild] = Fp.headsTail(parent.children)

    const children =
      lastChild && isText(lastChild)
        ? [
            ...childs,
            {
              text: lastChild.text + el.children[0].text
            }
          ]
        : [...childs, lastChild, el.children[0]]

    return { ...parent, children }
  }

  return parent
}
