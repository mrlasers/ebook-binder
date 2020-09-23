import * as Word from './nodeReducers'
import * as XML from '../xml'

const convert = (test: XML.Node) => Word.convert(null, test)

const doLog = (label, msg, stringify = false) =>
  console.log(label + ':', stringify ? JSON.stringify(msg, null, 2) : msg)

const br = convert({
  name: 'br',
  attributes: {},
  children: []
})

doLog('br', br)

const pBr = convert({
  name: 'p',
  attributes: {},
  children: [
    {
      name: 'r',
      attributes: {},
      children: [
        {
          name: 'br',
          attributes: {},
          children: []
        }
      ]
    }
  ]
})

doLog('pBr', pBr)
