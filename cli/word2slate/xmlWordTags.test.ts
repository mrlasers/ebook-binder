import * as Tags from './xmlWordTags'

it('lifts text child from `t` tag', () => {
  const emptyElement = { name: '', attributes: {}, children: [] }
  const input = {
    name: 't',
    attributes: {},
    children: [{ text: 'Hello, World!' }]
  }
  return expect(Tags.t(emptyElement, input)).toMatchObject({
    name: '',
    attributes: {},
    children: [{ text: 'Hello, World!' }]
  })
})
