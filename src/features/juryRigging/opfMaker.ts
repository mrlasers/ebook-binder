import { promises as fs } from 'fs'
import { v4 as Uuid } from 'uuid'
import produce from 'immer'

import { Publication } from './publication'

const tap = (x) => {
  console.log(x)
  return x
}

const config =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\J\\Jonathan Ellis\\Speaking with Impact\\build\\epub\\publication.json'

const isUuid = (s: string) =>
  !s
    ? false
    : s.match(
        /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/
      )

const isISBN = (s: string) =>
  !s ? false : s.replace(/[- ]/g, '').match(/^(97(8|9))?\d{9}(\d|X)$/)

const normalizeId = (id) => {
  if (typeof id === 'string') {
    if (isUuid(id)) {
      return { type: 'uuid', id }
    }
    if (isISBN(id)) {
      return { type: 'isbn', id }
    }
  }
  if (isUuid(id?.id)) {
    return { type: 'uuid', id: id?.id }
  }
  if (isISBN(id?.id)) {
    return { type: 'isbn', id: id?.id }
  }
  return { type: 'uuid', id: Uuid() }
}

const cleanConfig = produce((draft) => {
  draft.metadata.identifier = normalizeId(draft.metadata.identifier)
})

fs.readFile(config, { encoding: 'utf-8' })
  .then(JSON.parse)
  .then(cleanConfig)
  .then(tap)
//   .then((json) => {
//     return [
//       '<package version="3.0" xmlns="http://www.idpf.org/2007/opf" xml:lang="en-US" dir="ltr" unique-identifier="pub-id">',
//       formatMetadata(json.metadata)
//     ].flat()
//     // .join('\n')
//   })
//   .then(console.log)
