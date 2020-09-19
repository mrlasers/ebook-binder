import { parse, getFirstChild, Node, Element, isElement } from '../../xml'

export type Style = {
  type: 'paragraph' | 'character'
  name: string
  baseOn?: string
  next?: string
  keepNext?: boolean
  keepLines?: boolean | number // i think?
  spacing?: {
    before: number
    after: number
  }
  outlineLvl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0
  font?: {
    color: string
    themeColor: string
    themeShade: string
    size: number
  }
}

export type Styles = {
  [key: string]: Style
}

interface StyleElement extends Element {
  attributes: {
    default?: string
    styleId?: string
    type?: string
    [key: string]: string
  }
  children: StyleElement[]
}

export const convertStyleProperties = (props: StyleElement) => {
  return props.children.reduce(
    (acc, n) => {
      if (!isElement(n)) {
        return acc
      }

      switch (n.name) {
        default:
          return acc
        // pPr
        case 'keepNext':
        case 'keepLines':
          return { ...acc, [n.name]: true }
        case 'spacing':
          return {
            ...acc,
            spacing: {
              before: parseInt(n.attributes.before),
              after: parseInt(n.attributes.after)
            }
          }
        case 'outlineLvl':
          return { ...acc, outlineLvl: parseInt(n.attributes.val) }
        // rPr
        case 'sz':
          return {
            ...acc,
            font: { ...acc.font, size: parseInt(n.attributes.val) }
          }
        case 'color': {
          return {
            ...acc,
            font: {
              ...acc.font,
              color: '#' + n.attributes.val,
              themeColor: n.attributes.themeColor,
              themeShade: n.attributes.themeShade
            }
          }
        }
      }
    },
    { font: {} }
  )
}

export const convertStyle = (node: StyleElement) => {
  return {
    [node.attributes.styleId]: {
      type: node.attributes.type,
      // default: node.attributes.default,
      ...node.children.reduce((acc, n) => {
        if (!isElement(n)) {
          return acc
        }

        switch (n.name) {
          default:
            return acc
          case 'pPr':
          case 'rPr':
            return { ...acc, ...convertStyleProperties(n) }
          case 'keepNext':
            return { ...acc, [n.name]: true }
          case 'name':
          case 'basedOn':
          case 'next':
            return { ...acc, [n.name]: n.attributes.val }
        }
      }, {})
    }
  }
}

export const convertStyles = (styles: Element) => {
  return styles.children.reduce((acc, node: StyleElement) => {
    if (!isElement(node) || node.name !== 'style') {
      return acc
    }

    return {
      ...acc,
      ...convertStyle(node)
    }
  }, {})
}
