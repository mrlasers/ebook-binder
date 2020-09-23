import { produce } from 'immer'
import { Children } from 'react'
import * as XML from '../xml'
import { isText } from '../xml'

export type WordNode = WordElement | WordText | WordError

export type WordError = {
  type: 'error'
  msg: string
}

export type WordText = {
  text: string
}

export type WordElement = {
  type?: string | null
  properties?: {
    [key: string]: boolean | number | string
  }
  children: WordNode[]
}

export type WordProps = { [key: string]: boolean | number | string }

interface PropsElement extends XML.Element {
  attributes: {
    val?: string
  }
}

export function isWordText(node: WordNode): node is WordText {
  return node && (node as WordText)?.text !== undefined
}

export function isWordError(node: WordNode): node is WordError {
  return (
    node &&
    (node as WordError).type === 'error' &&
    (node as WordError).msg !== undefined
  )
}

export function isWordElement(node: WordNode): node is WordElement {
  return (
    node &&
    (node as WordElement).children !== undefined &&
    (node as WordElement).type !== undefined
  )
}

// Text(t) -> Text(t.children[0])

export const t = (el: XML.Node): WordText | XML.Node => {
  return XML.isText(el) ? { text: el.text } : el
}

export const r = (el: XML.Node): WordNode | XML.Node => {
  if (!XML.isElement(el)) {
    return el
  }

  if (
    !Object.keys(el.attributes).length &&
    el.children.length === 1 &&
    XML.isText(el.children[0])
  ) {
    return { text: el.children[0].text }
  }
}

export const p = (parent: XML.Node): WordElement | XML.Node => {
  if (!XML.isElement(parent)) {
    return parent
  }
  return {
    type: 'paragraph',
    properties: {},
    children: parent.children
  }
}

const wordElement = (node?: Partial<WordElement>): WordElement => {
  return {
    type: node?.type ?? null,
    properties: node?.properties ?? {},
    children: node?.children ?? []
  }
}

export const addChild = (parent: WordElement, child: WordNode): WordNode => {
  return isWordElement(parent)
    ? {
        ...parent,
        children: [...parent.children, child]
      }
    : child
}

export const addProperties = (
  parent: WordElement,
  properties: WordProps
): WordNode => {
  return {
    ...parent,
    properties: {
      ...parent.properties,
      ...properties
    }
  }
}

export const convert = (acc: WordElement | null, el: XML.Node): WordNode => {
  const parent = acc || wordElement()

  if (XML.isText(el)) {
    // kinda a hack, maybe
    // if parent has properties, we assume that we want to keep the parent
    // ; otherwise, we want to lift the Text node
    const newText = { text: el.text }
    return Object.keys(parent.properties).length
      ? addChild(parent, newText)
      : newText
  }

  // console.log(el.name)
  switch (el.name) {
    default:
      return el.children.reduce(convert, parent)

    // body
    case 'body':
      return {
        type: 'body',
        properties: {},
        children: el.children.map((n) => convert(null, n))
        // # this reduce combines sequential list items of the same
        // # type, but I think we're going to move that to the
        // # post processing step for the moment
        // .reduce((acc, child) => {
        //   if (isWordElement(child) && child.type === 'list') {
        //     const rest = acc.slice(0, acc.length - 1)
        //     const last = acc.slice(acc.length - 1)[0]
        //     if (
        //       isWordElement(last) &&
        //       last.type === 'list' &&
        //       last.properties.numId === child.properties.numId
        //     ) {
        //       return [
        //         ...rest,
        //         {
        //           ...last,
        //           children: [...last.children, ...child.children]
        //         }
        //       ]
        //     }
        //   }
        //   return [...acc, child]
        // }, [])
      }
    case 'r': {
      // is this kinda a hack?
      const newRun = el.children.reduce(convert, {
        ...parent,
        type: 'span'
      })

      return addChild(acc, newRun)
    }

    // list
    case 'numPr': {
      return el.children.reduce(convert, {
        ...parent,
        type: 'list'
      })
    }

    case 'ilvl': {
      return addProperties(parent, { level: parseInt(el.attributes.val) })
    }

    case 'numId': {
      return addProperties(parent, { numId: parseInt(el.attributes.val) })
    }

    // paragraph
    case 'p': {
      const newParagraph = el.children.reduce(convert, {
        ...parent,
        type: 'paragraph'
      })

      if (!isWordElement(newParagraph)) {
        return
      }

      const firstChild = newParagraph.children[0]

      if (isWordElement(firstChild)) {
        switch (firstChild.type) {
          case 'break':
            return firstChild
        }
      }

      if (isWordElement(newParagraph) && newParagraph.type === 'list') {
        return {
          ...newParagraph,
          properties: {
            ...newParagraph.properties,
            test: '123'
          },

          children: newParagraph.children.map((child) => {
            if (isWordError(child)) {
              return null
            }

            if (isWordText(child)) {
              return {
                type: 'list-item',
                properties: {},
                children: [{ text: child.text }]
              }
            }

            return {
              type: 'list-item',
              properties: {},
              children: child.children
            }
          })
        }
      }

      return addChild(acc, newParagraph)
      return acc
        ? { ...parent, children: [...parent.children, newParagraph] }
        : newParagraph
    }
    case 'rStyle': {
      return addProperties(parent, { style: el.attributes.val })
    }
    case 'b':
      return addProperties(parent, { bold: true })
    case 'i':
      return addProperties(parent, { italic: true })
    case 'u':
      return addProperties(parent, { underline: true })
    // table
    case 'tbl':
      return el.children.reduce(convert, {
        ...parent,
        type: 'table'
      })
    case 'tr': {
      const newRow = el.children.reduce(convert, {
        type: 'table-row',
        properties: {},
        children: []
      })

      return addChild(parent, newRow)
    }
    case 'tc': {
      const newCell = el.children.reduce(
        convert,
        wordElement({
          type: 'table-cell'
        })
      )

      return addChild(parent, newCell)
    }
    // drawing / image
    case 'drawing':
      return el.children.reduce(convert, {
        ...parent,
        type: 'image'
      })
    case 'inline':
      return el.children.reduce(
        convert,
        addProperties(parent, { inline: true })
      )
    case 'blip':
      return addProperties(parent, { id: el.attributes.embed })
    case 'cNvPr': // non-visual image properties
      return addProperties(parent, {
        name: el.attributes.name,
        description: el.attributes.descr
      })

    // breaks
    case 'type': {
      return addProperties(parent, { sectionType: el.attributes.val })
    }
    case 'sectPr':
    case 'br':
      return el.children.reduce(convert, {
        type: 'break',
        properties: {
          type:
            el.attributes.type || (el.name === 'sectPr' ? 'section' : 'page')
        },
        children: []
      })
  }
}
