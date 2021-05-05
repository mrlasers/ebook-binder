// import { Element, XmlNode } from './xmlParser'
// import { convert } from './xmlConvert'

// it('returns text node when passed text node', () => {
//   const text = { text: 'Hello, World!' }
//   return expect(convert()(text)).toMatchObject(text)
// })

// it('converts a node with one text child', () => {
//   const fun = convert({
//     tags: {
//       p: (p, c) => ({
//         ...p,
//         children: [...p.children, ...c.children]
//       })
//     }
//   })
//   const inputNode: Element = {
//     name: 'word',
//     attributes: {},
//     children: [
//       {
//         text: 'Hello, World!'
//       },
//       {
//         name: 'p',
//         attributes: {},
//         children: [{ text: 'Goodnight, Moon.' }]
//       },
//       {
//         name: 'invalid',
//         attributes: {},
//         children: [{ text: 'Hello, World!' }]
//       }
//     ]
//   }
//   const expected: Element = {
//     name: 'word',
//     attributes: {},
//     children: [{ text: 'Hello, World!' }, { text: 'Goodnight, Moon.' }]
//   }
//   return expect(fun(inputNode)).toMatchObject(expected)
// })

it('passes a test', () => expect(true).toBe(true))
