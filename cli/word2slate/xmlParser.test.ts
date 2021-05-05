import * as Xml from './xmlParser'

it('tests attributes', () => {
  expect(Xml.processAttrs({ hello: 'world' })).toMatchObject({ hello: 'world' })
})

describe('xml node tests', () => {
  it('identifies a text node as text', () => {
    expect(Xml.isText({ text: 'Hello, World!' })).toBe(true)
  })

  it('identifies text node with extra attributes as not text', () => {
    expect(Xml.isText({ text: 'Hello', attributes: { world: '!' } })).toBe(
      false
    )
  })

  it('identifies element node as not text', () => {
    expect(Xml.isText({ name: 'p', children: [] })).toBe(false)
  })
})

describe('xml parser', () => {
  it('parses a basic html tag', async () => {
    return expect(await Xml.parse('<p>Hello, World!</p>')).toMatchObject({
      name: 'p',
      attributes: {},
      children: [{ text: 'Hello, World!' }]
    })
  })

  it('parses paragraph with id and class attributes', async () => {
    const result = await Xml.parse(
      '<p id="hello" class="first">Hello, World!</p>'
    )
    expect(result).toMatchObject({
      name: 'p',
      attributes: {
        id: 'hello',
        class: 'first'
      },
      children: [{ text: 'Hello, World!' }]
    })
  })

  it('parses paragraph with bold and italic', async () => {
    const result = await Xml.parse('<p><b>Hello</b>, <i>World</i>!</p>')
    expect(result).toMatchObject({
      name: 'p',
      attributes: {},
      children: [
        {
          name: 'b',
          attributes: {},
          children: [{ text: 'Hello' }]
        },
        { text: ', ' },
        { name: 'i', attributes: {}, children: [{ text: 'World' }] },
        { text: '!' }
      ]
    })
  })
})
