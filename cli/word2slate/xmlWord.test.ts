import * as Word from './xmlWord'

it('tests true', () => expect(true).toBe(true))

// it('lifts text to child of parent', async () => {
//   const parent = {name: 'r', children: [{name: 't', children: [{ text: 'Hello, World!'}]}]}
//   const child = parent.children[0]
//   expect(Word.processNode(parent)(child)).toMatchObject({
//     name: 'r',
//     children: [{text: 'Hello, World!'}]
//   })
// })
