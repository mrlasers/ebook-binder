import { Node } from '../xml/xml-reader'
/*

Goal for our document structure

{
  type: 'section',
  children: [
    {
      type: 'paragraph',
      children: [
        type: 'text',
        text: 'Hello, World!'
      ]
    }
  ]
}
*/

export function addNewSection (doc) {
  return {
    ...doc,
    sections: [...doc.sections, { paragraphs: [] }]
  }
}

export function parse (xml: Node) {
  if (xml.name !== 'document') {
    throw new Error('Invalid Word XML object')
  }

  const body = xml.children[0]

  if (body.type === 'text' || body.name !== 'body') {
    throw new Error('Invalid Word XML object: body is not first child element')
  }

  const result = body.children.reduce(
    (acc, child) => {
      switch (child.type) {
        default:
          return acc
        case 'node':
          switch (child.name) {
            default:
              return acc
            case 'p':
              acc.sections[acc.sections.length - 1].paragraphs.push({})
          }
        case 'text':
          return acc
      }
    },
    {
      sections: [
        {
          paragraphs: []
        }
      ]
    }
  )

  return result

  return {
    sections: []
  }
}
