import { Transforms } from 'slate'
import { jsx } from 'slate-hyperscript'

const ELEMENT_TAGS = {
  PRE: () => ({ type: 'code' }),
  H1: () => ({ type: 'heading', level: 1 }),
  P: () => ({ type: 'paragraph' })
}

const TEXT_TAGS = {
  I: () => ({ italic: true }),
  EM: () => ({ italic: true }),
  B: () => ({ bold: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true })
}

export const _deserializeHtml = (el) => {
  const { nodeName, nodeType } = el

  if (nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    return null
    return '\n'
  }

  let parent = el
  const children = Array.from(parent.childNodes).map(deserializeHtml).flat()

  if (nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }
}

export const deserializeHtml = (el) => {
  console.log(el.nodeName, el.childNodes)

  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    return null
    return '\n'
  }

  const { nodeName } = el
  let parent = el

  console.log('nodeName:', nodeName)

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }

  const children = Array.from(parent.childNodes).map(deserializeHtml).flat()

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el)
    return jsx('element', attrs, children)
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el)
    return children.map((child: Node) => jsx('text', attrs, child))
  }

  return children
}

export const withHtmlPaste = (editor) => {
  const { insertData, isInline, isVoid } = editor

  editor.isInline = (element) => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const html = data.getData('text/html')

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      console.log(parsed.body)
      const fragment = deserializeHtml(parsed.body)
      console.log(JSON.stringify(fragment[0]))
      return Transforms.insertFragment(editor, fragment, { hanging: false })
    }

    insertData(data)
  }

  return editor
}
