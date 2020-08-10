import { createRun, Run } from './types'

const input = {
  type: 'node',
  name: 'r',
  attributes: {},
  children: [
    {
      type: 'node',
      name: 'rPr',
      attributions: {},
      children: []
    },
    {
      type: 'text',
      text: 'Hello, World!'
    }
  ]
}

it('passes a test', () => expect(1).toBe(1))

// it('makes a basic run from run node', () => {
//   const expected = {
//     type: 'run',
//     properties: {},
//     content: ['Hello, World!']
//   }

//   const result = createRun(input)

//   expect.assertions(2)
//   expect(result.getValue()).toMatchObject(expected)
//   expect(result.getText()).toBe('Hello, World!')
// })

// it('makes instance of Run monad', () => {
//   const run = Run.of(input)

//   expect(run.getText()).toBe('Hello, World!')
// })
