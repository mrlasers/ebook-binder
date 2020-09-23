import * as H from './word2html'

describe('toStyle', () => {
  test('converts bold+italic to style', () => {
    return expect(
      H.toStyle({
        bold: true,
        italic: true
      })
    ).toBe('font-style: italic; font-weight: bold;')
  })
})

describe('toHtml', () => {
  test('converts text to html', () => {
    expect(
      H.toHtml({
        text: 'Hello, World!'
      })
    ).toBe('Hello, World!')
  })

  describe('span', () => {
    test('converts bold span to html', () => {
      expect(
        H.toHtml({
          type: 'span',
          properties: {
            bold: true
          },
          children: [{ text: 'Hello, World!' }]
        })
      ).toBe('<b>Hello, World!</b>')
    })

    test('converts italic span to html', () => {
      expect(
        H.toHtml({
          type: 'span',
          properties: {
            italic: 'true'
          },
          children: [{ text: 'Hello, World!' }]
        })
      ).toBe('<i>Hello, World!</i>')
    })

    test('converts underline span to html', () => {
      expect(
        H.toHtml({
          type: 'span',
          properties: {
            underline: 'true'
          },
          children: [{ text: 'Hello, World!' }]
        })
      ).toBe('<u>Hello, World!</u>')
    })

    test('converts bold+italic span to html', () => {
      expect(
        H.toHtml({
          type: 'span',
          properties: {
            italic: true,
            bold: true
          },
          children: [{ text: 'Hello, World!' }]
        })
      ).toBe(
        '<span style="font-style: italic; font-weight: bold;">Hello, World!</span>'
      )
    })
  })

  describe('paragraph', () => {
    test('empty string from empty paragraph', () => {
      expect(
        H.toHtml({
          type: 'paragraph',
          properties: {},
          children: []
        })
      ).toBe('')
    })

    test('paragraph with style', () => {
      expect(
        H.toHtml({
          type: 'paragraph',
          properties: { style: 'Heading1' },
          children: [{ text: 'Hello, World!' }]
        })
      ).toBe('<p class="Heading1">Hello, World!</p>')
    })

    test('paragraph with various styled spans', () => {
      expect(
        H.toHtml({
          type: 'paragraph',
          properties: {},
          children: [
            {
              type: 'span',
              properties: {
                bold: true
              },
              children: [{ text: 'Hello, ' }]
            },
            {
              type: 'span',
              properties: { italic: true },
              children: [{ text: 'World!' }]
            }
          ]
        })
      ).toBe('<p><b>Hello, </b><i>World!</i></p>')
    })
  })
})
