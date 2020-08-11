import { parse, Node } from './xml-parser'

it('parses an XML document', () => {
  const input = '<hello><world>Earth</world></hello>'
  const expected: Node = {
    name: 'hello',
    attributes: {},
    children: [
      {
        name: 'world',
        attributes: {},
        children: [{ text: 'Earth' }]
      }
    ]
  }

  expect(parse(input)).resolves.toEqual(expected)
})
