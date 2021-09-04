import Path from 'path'
import Fs from 'fs/promises'

import { readJson } from '../lib'
import { normalize, loadManifestFileItem } from '../manifest'

import { pipe, flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as IO from 'fp-ts/IO'
import * as IOE from 'fp-ts/IOEither'
import { processHtml } from '../processing'
import { task } from 'fp-ts'

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

const manifestPath = Path.join(buildPath, 'file-list.json')

const xhtmlSrcPath = Path.join(buildPath, 'source', 'xhtml')

const outputPath = Path.join(manifestPath, 'output')

const json = readJson(manifestPath)

const maybeJsonArray = (json: Item[]): O.Option<Item[]> => {
  if (!Array.isArray(json)) {
    return O.none
  }

  return O.some(json)
}

export type Item = {
  filename: string
}

const confirmItem = (item: string | Item): O.Option<Item> => {
  if (typeof item === 'string') {
    return O.some({ filename: item })
  }

  if (typeof item.filename !== 'string') {
    return O.none
  }

  return O.some(item)
}

const program = pipe(
  json,
  TE.fold(
    () => T.of<Item[]>([]),
    (json) => T.of(json)
  )
)

program().then(console.log)

// pipe(
//   json,
//   TE.map((json): O.Option<{ filename: string }> => {
//     if (!Array.isArray(json)) {
//       return O.none
//     }

//     return json[0]
//   })
// )

// json().then(console.log)

// Fs.readFile(manifestPath, { encoding: 'utf-8' })
//   .then((json) => JSON.parse(json))
//   .then(normalizeJsonItems)
//   .then(function (items) {
//     return Promise.all(
//       items.map(function (item) {
//         const src = !!item.filename.match(/\.(jpg|png)$/)
//           ? 'source/images'
//           : 'source/xhtml'
//         return Fs.readFile(Path.join(buildPath, src, item.filename), {
//           encoding: 'utf-8'
//         })
//           .then((html) => ({ ...item, html, type: 'html' }))
//           .catch((err) => ({ ...item, html: null, type: null }))
//       })
//     ).then((items) =>
//       items.filter((i) => (i as { html: string }).html !== undefined)
//     )
//   })
//   .then(cleanAndSaveOutputHtml)
//   .then(items => {
//     return Promise.all(items.map(item => {
//       return Fs.writeFile(Path.join(outputPath, item.))
//     }))
//   })
//   .then(console.log)

// function cleanAndSaveOutputHtml(items: { filename: string; html: string }[]) {
//   return items
//     .map(function (item) {
//       return item.html ? processHtml(item.html) : null
//     })
//     .filter(Boolean)
// }

// function normalizeJsonItems(items: (string | { filename: string })[]) {
//   return items
//     .map((item) => {
//       if (typeof item === 'string') return { filename: item }
//       if (typeof item.filename === 'string') return item
//       return null
//     })
//     .filter(Boolean)
// }

// function tap(x: any) {
//   console.log(x)
//   return x
// }

// export function maybeItem(item: string | { filename: string }) {
//   if (typeof item === 'string') {
//     return O.of({ filename: item })
//   }

//   if ((item as { filename: string }).filename !== undefined) {
//     return O.of(item)
//   }

//   return O.none
// }

// export const itemsToOptionItems = flow(
//   A.map(maybeItem),
//   A.filter(O.isSome),
//   A.sequence(O.Monad)
// )

// Fs.readFile(manifestPath, { encoding: 'utf-8' })
//   .then((json) => JSON.parse(json))
//   // .then(tap)
//   .then(itemsToOptionItems)
//   .then(
//     O.map(
//       A.map((item) =>
//         IOE.tryCatch(
//           () =>
//             Fs.readFile(Path.join(xhtmlSrcPath, item.filename), {
//               encoding: 'utf-8'
//             }),
//           (err) => new Error(String(err))
//         )
//       )
//     )
//   )
//   .then(O.map(A.sequence(IOE.Monad)))
//   // .then((items): O.Option<{ filename: string }>[] => {
//   //   return items.map(maybeItem)
//   // })
//   // .then(A.filter(O.isSome))
//   .then(console.log)
