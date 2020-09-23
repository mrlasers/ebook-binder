import * as Word from './nodeReducers'
import * as XML from '../xml'

const convert = (test: XML.Node) => Word.convert(null, test)

describe('helper functions', () => {
  test('addChild to parent', () => {
    expect(
      Word.addChild(
        {
          type: '',
          properties: {},
          children: []
        },
        { text: 'Hello, World!' }
      )
    ).toMatchObject({
      type: '',
      properties: {},
      children: [{ text: 'Hello, World!' }]
    })
  })

  test('returns child if parent is not element', () => {
    expect(Word.addChild(null, { text: 'Hello, World!' })).toMatchObject({
      text: 'Hello, World!'
    })
  })

  test('addProperties to parent', () => {
    expect(
      Word.addProperties(
        {
          type: '',
          properties: {},
          children: []
        },
        {
          name: 'Hello',
          style: 'World'
        }
      )
    ).toMatchObject({
      type: '',
      properties: {
        name: 'Hello',
        style: 'World'
      },
      children: []
    })
  })
})

test('converts text node', () => {
  expect(convert({ text: 'Hello, World!' })).toMatchObject({
    text: 'Hello, World!'
  })
})

test('converts t element', () => {
  expect(
    convert({
      name: 't',
      attributes: {},
      children: [{ text: 'Hello, World!' }]
    })
  ).toMatchObject({
    text: 'Hello, World!'
  })
})

describe('run', () => {
  test('w/ no children', () => {
    expect(convert({ name: 'r', attributes: {}, children: [] })).toMatchObject({
      type: 'span',
      properties: {},
      children: []
    })
  })

  test('with text child', () => {
    expect(
      convert({
        name: 'r',
        attributes: {},
        children: [
          { name: 't', attributes: {}, children: [{ text: 'Hello, World!' }] }
        ]
      })
    ).toMatchObject({ text: 'Hello, World!' })
  })

  test('with bold property', () => {
    expect(
      convert({
        name: 'r',
        attributes: {},
        children: [
          {
            name: 'rPr',
            attributes: {},
            children: [{ name: 'b', attributes: {}, children: [] }]
          }
        ]
      })
    ).toMatchObject({
      type: 'span',
      properties: { bold: true },
      children: []
    })
  })

  test('with italic property', () => {
    expect(
      convert({
        name: 'r',
        attributes: {},
        children: [
          {
            name: 'rPr',
            attributes: {},
            children: [{ name: 'i', attributes: {}, children: [] }]
          }
        ]
      })
    ).toMatchObject({
      type: 'span',
      properties: { italic: true },
      children: []
    })
  })

  test('underline property', () => {
    expect(
      convert({
        name: 'r',
        attributes: {},
        children: [
          {
            name: 'rPr',
            attributes: {},
            children: [{ name: 'u', attributes: {}, children: [] }]
          }
        ]
      })
    ).toMatchObject({
      type: 'span',
      properties: { underline: true },
      children: []
    })
  })

  test('with bold, italic, and text', () => {
    expect(
      convert({
        name: 'r',
        attributes: {},
        children: [
          {
            name: 'rPr',
            attributes: {},
            children: [
              { name: 'b', attributes: {}, children: [] },
              { name: 'i', attributes: {}, children: [] }
            ]
          },
          { text: 'Hello, World!' }
        ]
      })
    ).toMatchObject({
      type: 'span',
      properties: { bold: true, italic: true },
      children: [{ text: 'Hello, World!' }]
    })
  })

  test('with style name', () => {
    expect(
      convert({
        name: 'r',
        attributes: {},
        children: [
          {
            name: 'rPr',
            attributes: {},
            children: [
              {
                name: 'rStyle',
                attributes: { val: 'IntenseEmphasis' },
                children: []
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'span',
      properties: { style: 'IntenseEmphasis' },
      children: []
    })
  })
})

describe('paragraph', () => {
  test('with single text-run child', () => {
    expect(
      convert({
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
                children: [{ text: 'Hello, World!' }]
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'paragraph',
      properties: {},
      children: [{ text: 'Hello, World!' }]
    })
  })

  test('w/ style name', () => {
    expect(
      convert({
        name: 'p',
        attributes: {},
        children: [
          {
            name: 'pPr',
            attributes: {},
            children: [
              {
                name: 'rStyle',
                attributes: { val: 'Quote' },
                children: []
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'paragraph',
      properties: {
        style: 'Quote'
      },
      children: []
    })
  })
})

describe('body', () => {
  test('w/ paragraph', () => {
    expect(
      convert({
        name: 'body',
        attributes: {},
        children: [
          {
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
                    children: [{ text: 'Hello, World!' }]
                  }
                ]
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'body',
      properties: {},
      children: [
        {
          type: 'paragraph',
          properties: {},
          children: [{ text: 'Hello, World!' }]
        }
      ]
    })
  })

  test('w/ 2 paragraphs', () => {
    expect(
      convert({
        name: 'body',
        attributes: {},
        children: [
          {
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
                    children: [{ text: 'Hello, World!' }]
                  }
                ]
              }
            ]
          },
          {
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
                    children: [{ text: 'Goodnight, Moon.' }]
                  }
                ]
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'body',
      properties: {},
      children: [
        {
          type: 'paragraph',
          properties: {},
          children: [{ text: 'Hello, World!' }]
        },
        {
          type: 'paragraph',
          properties: {},
          children: [{ text: 'Goodnight, Moon.' }]
        }
      ]
    })
  })
})

describe('breaks', () => {
  test('page break', () => {
    expect(
      convert({
        name: 'br',
        attributes: {},
        children: []
      })
    ).toMatchObject({
      type: 'break',
      properties: {},
      children: []
    })
  })

  test('page break inside paragraph', () => {
    expect(
      convert({
        name: 'p',
        attributes: {},
        children: [
          {
            name: 'r',
            attributes: {},
            children: [
              {
                name: 'br',
                attributes: { type: 'page' },
                children: []
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'break',
      properties: { type: 'page' },
      children: []
    })
  })

  test('section break', () => {
    expect(
      convert({
        name: 'sectPr',
        attributes: {},
        children: []
      })
    ).toMatchObject({
      type: 'break',
      properties: {
        type: 'section'
      },
      children: []
    })
  })

  test('section break w/ type', () => {
    expect(
      convert({
        name: 'sectPr',
        attributes: {},
        children: [
          {
            name: 'type',
            attributes: {
              val: 'continuous'
            },
            children: []
          }
        ]
      })
    ).toMatchObject({
      type: 'break',
      properties: {
        type: 'section',
        sectionType: 'continuous'
      },
      children: []
    })
  })

  test('section break in paragraph', () => {
    expect(
      convert({
        name: 'p',
        attributes: {},
        children: [
          {
            name: 'pPr',
            attributes: {},
            children: [
              {
                name: 'sectPr',
                attributes: {},
                children: []
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'break',
      properties: {
        type: 'section'
      },
      children: []
    })
  })
})

describe('drawing/image', () => {
  test('does a drawing with inline embedded id', () => {
    expect(
      convert({
        name: 'drawing',
        attributes: {},
        children: [
          {
            name: 'inline',
            attributes: {},
            children: [
              {
                name: 'graphic',
                attributes: {},
                children: [
                  {
                    name: 'nvPicPr',
                    attributes: {},
                    children: [
                      {
                        name: 'cNvPr',
                        attributes: {
                          name: 'Picture 1',
                          descr: 'Coral'
                        },
                        children: []
                      }
                    ]
                  },
                  {
                    name: 'blip',
                    attributes: {
                      embed: 'rId5'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'image',
      properties: {
        id: 'rId5',
        inline: true,
        name: 'Picture 1',
        description: 'Coral'
      },
      children: []
    })
  })
})

describe('table', () => {
  test('basic table', () => {
    expect(
      convert({
        name: 'tbl',
        attributes: {},
        children: [
          {
            name: 'tr',
            attributes: {},
            children: [
              {
                name: 'tc',
                attributes: {},
                children: [
                  {
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
                            children: [{ text: 'Name' }]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ).toMatchObject({
      type: 'table',
      properties: {},
      children: [
        {
          type: 'table-row',
          properties: {},
          children: [
            {
              type: 'table-cell',
              properties: {},
              children: [
                {
                  type: 'paragraph',
                  properties: {},
                  children: [{ text: 'Name' }]
                }
              ]
            }
          ]
        }
      ]
    })
  })
})
