import { parseDocx } from './doc-reducer'

it('gets document body', () => {
  const input = {
    name: 'w:document',
    attributes: {},
    children: [{ name: 'w:body', attributes: {}, children: [] }]
  }
  const expected = { children: [] }
  return expect(parseDocx(input)).toEqual(expected)
})

// it('gets document body w/ paragraph', () => {
//   const input = {
//     name: 'w:document',
//     attributes: {},
//     children: [
//       {
//         name: 'w:body',
//         attributes: {},
//         children: [
//           {
//             name: 'w:p',
//             attributes: {},
//             children: [
//               {
//                 name: 'w:pPr',
//                 attributes: {},
//                 children: [
//                   {
//                     name: 'w:pStyle',
//                     attributes: { 'w:val': 'Normal' },
//                     children: []
//                   },
//                   {
//                     name: 'w:bidi',
//                     attributes: { 'w:val': '0' },
//                     children: []
//                   },
//                   {
//                     name: 'w:jc',
//                     attributes: { 'w:val': 'left' },
//                     children: []
//                   },
//                   {
//                     name: 'w:rPr',
//                     attributes: {},
//                     children: []
//                   }
//                 ]
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   }
//   const expected = {
//     children: [
//       {
//         type: 'section',
//         children: [
//           { type: 'paragraph', attributes: { style: 'Normal' }, children: [] }
//         ]
//       }
//     ]
//   }
//   expect(document(input)).toEqual(expected)
// })
