import { isText, isElement, getFirstChild, getChildByProp } from '../xml/node'

it('tests that a text node is text', () => {
  return expect(isText({ text: 'Hello, World!' })).toBe(true)
})

it('tests that an Element is an Element', () => {
  return expect(isElement({ children: [] })).toBe(true)
})

describe('getFirstChild', () => {
  it('returns `null` if not an Element or has no children', () => {
    expect(getFirstChild({ text: 'Hello, World!' })).toBeNull()
    expect(getFirstChild({ children: [] })).toBeNull()
    return
  })

  it('gets first child of Element', () => {
    return expect(
      getFirstChild({ children: [{ text: 'Hello, World!' }] })
    ).toEqual({ text: 'Hello, World!' })
  })
})

describe('getChild', () => {
  it('gets child by text value', () => {
    return expect(
      getChildByProp(
        { children: [{ text: 'Hello' }, { text: 'World' }] },
        'text',
        'World'
      )
    ).toEqual({ text: 'World' })
  })
})
