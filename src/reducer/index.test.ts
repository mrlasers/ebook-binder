import { reduceNode } from './index'

it('passes a test', () => {
  expect(1).toBe(1)
})

// it('does a document', () => {
//   const input = {
//     name: 'document',
//     children: [{ name: 'body', children: [{ name: 'p' }] }]
//   }
//   const result = {
//     children: []
//   }
//   return expect(reduceNode(input)).toEqual(result)
// })

it('does a paragraph', () => {
  const input = {
    name: 'p',
    children: [{ text: 'Hello, World!' }]
  }
  const result = {
    type: 'paragraph',
    children: []
  }
  expect(reduceNode(input)).toEqual(result)
})
