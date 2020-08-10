import * as Reader from './reader'

it('parses <hello style="cool"><world>Earth</world></hello>', () => {
  const input = '<hello style="cool"><world>Earth</world></hello>'
  const expected = {
    type: 'node',
    name: 'hello',
    attributes: {
      style: 'cool'
    },
    children: [
      {
        type: 'node',
        name: 'world',
        attributes: {},
        children: [
          {
            type: 'text',
            text: 'Earth'
          }
        ]
      }
    ]
  }

  expect.assertions(1)
  return expect(Reader.parse(input)).resolves.toEqual(expected)
})

describe('Elements', () => {
  it('creates a text element', () => {
    const input = 'Hello, World!'
    const expected = { type: 'text', text: 'Hello, World!' }
    return expect(Reader.createElement(input)).toEqual(expected)
  })

  it('creates node element with just a name', () => {
    const input = { name: 'hello', attributes: {} }
    const expected = {
      type: 'node',
      name: 'hello',
      attributes: {},
      children: []
    }

    return expect(Reader.createElement(input)).toEqual(expected)
  })

  it('creates node element with attributes', () => {
    const input = {
      name: 'hello',
      attributes: { style: 'paragraph', id: 'p001' }
    }
    const expected = {
      type: 'node',
      name: 'hello',
      attributes: {
        style: 'paragraph',
        id: 'p001'
      },
      children: []
    }

    return expect(Reader.createElement(input)).toEqual(expected)
  })
})
