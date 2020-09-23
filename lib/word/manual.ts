import { convert } from './nodeReducers'

const doLog = (label, msg, stringify = false) =>
  console.log(label + ':', stringify ? JSON.stringify(msg, null, 2) : msg)

const rPr = convert({
  name: 'rPr',
  attributes: {},
  children: [{ name: 'b', attributes: {}, children: [] }]
})

doLog('rPr', rPr)
