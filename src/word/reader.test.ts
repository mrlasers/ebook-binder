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
