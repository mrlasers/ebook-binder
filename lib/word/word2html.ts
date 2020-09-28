import * as Word from './nodeReducers'

export const toStyle = (props: Word.WordProps) => {
  return Object.keys(props)
    .map((key) => {
      switch (key) {
        default:
          return ''
        case 'bold':
          return props[key] ? 'font-weight: bold;' : ''
        case 'italic':
          return props[key] ? 'font-style: italic;' : ''
        case 'underline':
          return props[key] ? 'text-decoration: underline;' : ''
      }
    })
    .sort()
    .join(' ')
}

export const toHtml = (node: Word.WordNode): string => {
  if (Word.isWordText(node)) {
    return node.text
  }

  switch (node.type) {
    default:
      return Word.isWordElement(node) ? node.children.map(toHtml).join('') : ''
    case 'span':
      if (
        node.properties.bold &&
        !(node.properties.italic || node.properties.underline)
      ) {
        return `<b>${node.children.map(toHtml).join('')}</b>`
      }

      if (
        node.properties.italic &&
        !(node.properties.bold || node.properties.underline)
      ) {
        return `<i>${node.children.map(toHtml).join('')}</i>`
      }

      if (
        node.properties.underline &&
        !(node.properties.bold || node.properties.italic)
      ) {
        return `<u>${node.children.map(toHtml).join('')}</u>`
      }

      return `<span style="${toStyle(node.properties)}">${node.children
        .map(toHtml)
        .join('')}</span>`
    case 'paragraph':
      return node.children.length
        ? `<p${
            node.properties.style ? ` class="${node.properties.style}"` : ''
          }>${node.children.map(toHtml).join('')}</p>`
        : ''
    case 'image':
      // todo: make source path configurable (2020-09-23)
      return `<img src="Images/${node.properties.file}" alt="${
        node.properties.description || ''
      }"/>`
  }
}

export type Document = {
  content: Word.WordNode[]
}

export type Book = {
  documents: Document[]
}

export const toDocuments = (nodes: Word.WordNode[]): Book => {
  return {
    documents: []
  }
}
