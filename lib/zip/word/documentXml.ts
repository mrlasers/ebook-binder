import {
  parse,
  getFirstChild,
  Node,
  Element,
  isElement,
  isText
} from '../../xml'
import Slate from 'slate'
import { Style, Styles } from './stylesXml'
import produce from 'immer'

const addProp = (parent, key, value) => ({ ...parent, [key]: value })
const addChild = (parent, child) => ({
  ...parent,
  children: [...parent.children, child]
})

export const convertRunProps = (run: Slate.Element, props: Element) => {
  return props.children.reduce((acc, prop) => {
    if (!isElement(prop)) {
      return acc
    }

    switch (prop.name) {
      default:
        return acc
      case 'i':
        return addProp(run, 'italic', true)
      case 'b':
        return addProp(run, 'bold', true)
    }
  }, run)
}

export const convertRun = (r: Element) => {
  return r.children.reduce(
    (acc: Slate.Element, n) => {
      if (!isElement(n)) {
        return acc
      }

      switch (n.name) {
        default:
          return acc
        case 't':
          return addChild(acc, n.children[0])
        case 'rPr':
          return convertRunProps(acc, n)
      }
    },
    {
      type: 'run',
      // attributes: {},
      children: []
    }
  )
}

function isString(el: string | Node[] | { [key: string]: string }) {
  console.log('isString:', typeof el)
  return typeof el === 'string'
}

export function mapRunToChild(
  parent: Slate.Element,
  run: Element
): Slate.Element {
  return run.children.reduce<Slate.Element>((acc, n) => {
    if (!isElement(n)) {
      return acc
    }

    switch (n.name) {
      default:
        return acc
      case 'rPr':
        console.log('rPr!!!!!!!!!!!!!!!', n.children)
        return {
          ...acc,
          properties: {}
        }
      case 't':
        if (isText(n.children[0])) {
          return {
            ...acc,
            children: [...acc.children, n.children[0]]
          }
        }

        return acc
    }
  }, parent)
}

export interface ReduceChild {
  (parent: Slate.Element, child: Element, config?: any): Slate.Element
}

const applyRunPr: ReduceChild = (parent, child) => {
  switch (child.name) {
    default:
      return parent
    case 'i':
      return {
        ...parent,
        italic: true
      }
    case 'b':
      return {
        ...parent,
        bold: true
      }
  }
}

export const applyRun: ReduceChild = (parent, child) => {
  switch (child.name) {
    default:
      return parent
    case 'rPr':
      return applyRrunPrToParent(parent, child)
    case 't':
      if (isText(child.children[0])) {
        return {
          ...parent,
          children: [...parent.children, child.children[0]]
        }
      }
    case 'br':
      return {
        ...parent,
        children: [...parent.children, { type: 'br', children: [] }]
      }
    case 'drawing':
      return
  }
}

export const applyParaPr: ReduceChild = (parent, child, config) => {
  switch (child.name) {
    default:
      return parent
    case 'pStyle':
      const level = config[child.attributes?.val]?.outlineLvl
      return {
        ...parent,
        type: level < 9 ? 'heading' : parent.type,
        level: level,
        style: child.attributes?.val
      }
  }
}

export function applyToParent(func: ReduceChild) {
  return function (
    parent: Slate.Element,
    child: Element,
    config?: any
  ): Slate.Element {
    return child.children.reduce((acc, n) => {
      return isElement(n) ? func(acc, n, config) : acc
    }, parent)
  }
}

const applyParaPrToParent = applyToParent(applyParaPr)
const applyRunToParent = applyToParent(applyRun)
const applyRrunPrToParent = applyToParent(applyRunPr)

// convertParagraph :: Element -> Slate.Element
export function convertParagraph(el: Element, styles?: Styles): Slate.Element {
  if (!el.children) {
    console.log(el)
  }
  return el.children.reduce<Slate.Element>(
    (acc, n) => {
      if (!isElement(n)) {
        return acc
      }

      switch (n.name) {
        default:
          return acc
        case 'pPr':
          return applyParaPrToParent(acc, n, styles)
        case 'r':
          return {
            ...acc,
            children: [
              ...acc.children,
              applyRunToParent({ type: 'run', children: [] }, n)
            ]
          }
      }
    },
    {
      type: 'paragraph',
      children: []
    }
  )
  // return node.children.reduce(
  //   (acc, n) => {
  //     return acc
  //   },
  //   {
  //     type: 'paragraph',
  //     children: []
  //   }
  // )
}

// convertToSlate :: Element -> Slate.Element
export function convert(body: Element, styles?: Styles): Slate.Element {
  if (!body.children) {
    throw 'need a children, dummy'
  }

  // return { children: [] }

  const sections = body.children.reduce<Slate.Element[]>(
    produce((acc, node) => {
      if (!isElement(node)) {
        return acc
      }

      switch (node.name) {
        default:
          return acc
        case 'p':
          acc[acc.length - 1].children.push(convertParagraph(node, styles))
          break
        case 'sectPr':
          acc[acc.length - 1].properties = {}
          acc.push({ type: 'section', children: [] })
          break
        // return [...acc, convertParagraph(node, styles)]
      }
    }),
    [{ type: 'section', children: [] }]
  )

  const combineChildren = (prev, next) => {
    const { children: prevChildren, ...prevRest } = prev
    const { children: nextChildren, ...nextRest } = next

    if (JSON.stringify(prevRest) === JSON.stringify(nextRest)) {
      return {
        ...prevRest,
        children: [...prevChildren, ...nextChildren]
      }
    }

    return [prev, next]
  }

  return {
    children: sections.slice(0, sections.length - 1)
  }

  // return {
  //   children: body.children.reduce((acc, node) => {
  //     if (!isElement(node)) {
  //       return acc
  //     }

  //     switch (node.name) {
  //       default:
  //         return acc
  //       case 'p':
  //         return [...acc, convertParagraph(node, styles)]
  //     }
  //   }, [])
  // }
}
