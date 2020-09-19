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

export function mapPropsToParagraph(
  para: Slate.Element,
  props: Element,
  styles?: Styles
): Slate.Element {
  return props.children.reduce<Slate.Element>((acc, n) => {
    if (!isElement(n)) {
      return acc
    }

    switch (n.name) {
      default:
        return acc
      case 'pStyle':
        console.log('pStyle!!!')
        if (styles[n.attributes.val]?.outlineLvl < 9) {
          return {
            ...acc,
            type: 'heading',
            level: styles[n.attributes.val]?.outlineLvl
          }
        }

        return acc
    }
  }, para)
}

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
          return mapPropsToParagraph(acc, n, styles)
        case 'r':
          return mapRunToChild(acc, n)
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

  return {
    children: body.children.reduce<Slate.Element[]>((acc, node) => {
      if (!isElement(node)) {
        return acc
      }

      switch (node.name) {
        default:
          return acc
        case 'p':
          return [...acc, convertParagraph(node, styles)]
      }
    }, [])
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
