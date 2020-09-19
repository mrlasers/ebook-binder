import * as DocumentXML from './documentXml'

test('passes', () => expect(true).toBe(true))

describe('paragraphs', () => {
  test('gets a paragraph with text', () => {
    const input = {
      name: 'p',
      attributes: {},
      children: [
        {
          name: 'r',
          attributes: {},
          children: [
            {
              name: 't',
              attributes: {},
              children: [
                {
                  text: 'Hello, World!'
                }
              ]
            }
          ]
        }
      ]
    }

    const expected = {
      type: 'paragraph',
      attributes: {},
      children: [{ text: 'Hello, World!' }]
    }

    expect(DocumentXML.convertParagraph(input, {})).toMatchObject(expected)
  })
})
