import * as Word from './nodeReducers'
import * as Doc from './document'
import * as XML from '../xml'

const convert = (test: XML.Node) => Word.convert(null, test)

const doLog = (label, msg, stringify = false) =>
  console.log(label + ':', stringify ? JSON.stringify(msg, null, 2) : msg)

const result = Doc.process({
  children: [
    {
      type: 'list',
      properties: { numId: 1 },
      children: [{ text: 'Hello' }]
    }
  ]
})

console.log(JSON.stringify(result, null, 2))

// const br = convert({
//   name: 'br',
//   attributes: {},
//   children: []
// })

// doLog('br', br)

// const pBr = convert({
//   name: 'p',
//   attributes: {},
//   children: [
//     {
//       name: 'r',
//       attributes: {},
//       children: [
//         {
//           name: 'br',
//           attributes: {},
//           children: []
//         }
//       ]
//     }
//   ]
// })

// doLog('pBr', pBr)
