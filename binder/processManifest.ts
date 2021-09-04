import Fs from 'fs/promises'
import Path from 'path'
import { pipe, flow } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { parse } from 'fp-ts-std/JSON'
import { guard } from 'fp-ts-std/Function'
import { pick } from 'fp-ts-std/Record'

import { hashString, readJson, readFile } from './lib'
import { ManifestItem, Key } from './types'

import {} from 'fp-ts-contrib'
import { F } from 'ramda'

// 1. Read manifest.json

// 2. Do each file

//  A. if file(string)
//    + { filename: string }
//  B. if filename(string)
//    + if string(image|jpg|png)
//      : generateImageHtml(string)
//    - load(filename(string))
//  C. processXhtml(html)
//  D. writeXhtml(wrapHtml(html))
//  E. write file back to manifest, less html field

const manifestPath =
  'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/A Practical Reference/build/manifest.json'
const buildPath = Path.dirname(manifestPath)

const path = Path.dirname(manifestPath)

export type HasFiles = {
  files: (FileItem | string)[]
  [key: Key]: any
}

export type FileItem = {
  filename: string
  [key: Key]: any
}

// html pipeline
/**
 * n. Load HTML
 * n. Clean HTML
 *  * Set heading IDs
 *  * Remove excess classes (ex: .gender)
 *
 * n. Derive stuff from HTML
 */

// const result = pipe(
//   readJson(manifestPath),
//   TE.map((manifest: HasFiles) => {
//     const metadata = manifest.metadata

//     return !manifest.files
//       ? O.none
//       : pipe(
//           manifest.files,
//           O.of,
//           O.map(
//             flow(
//               A.map((f) => {
//                 return typeof f === 'string' ? f : f.filename
//               }),
//               O.sequence(A.Monad),
//               TE.fromOption,
//               TE.chain((filename) => {
//                 return readFile(Path.join(path, 'content', filename))
//               })
//             )
//           )
//         )
// return manifest.files
//   .map(
//     guard<string | FileItem, E.Either<Error, FileItem>>([
//       [(f) => typeof f === 'string', (f: string) => E.of({ filename: f })],
//       [
//         (f) => typeof f !== 'string' && typeof f?.filename === 'string',
//         (f: FileItem) => E.of(f)
//       ]
//     ])((f) => E.left(new Error(`${f}`)))
//   )
// return manifest.files.map(file => {
//   return typeof file === 'string' ? { filename: file } : file
// })
//   })
// )

// result().then(console.log)

// const pipeline = (file: string | { filename: string }) => {
//   return pipe(
//     file,
//     (f) => (typeof f === 'string' ? { filename: f } : f),
//     (f) => {}
//   )
// }

// const liftFilename = (filename: string | FileItem): FileItem => {
//   return typeof filename === 'string' ? { filename } : filename
// }

// const readUtf8 = (path: string): TE.TaskEither<Error, string> =>
//   TE.tryCatch(
//     () => Fs.readFile(path, { encoding: 'utf-8' }),
//     (err) => new Error(String(err))
//   )

// const parseTE = flow(
//   parse((err) => new Error(String(err))),
//   TE.fromEither
// )

// export type FileItem = {
//   filename: string
// }

// export type Manifest = {
//   files: (FileItem | string)[]
// }

// const result = pipe(
//   readUtf8(manifestPath),
//   TE.chain(parseTE),
//   TE.map((manifest: Manifest) => {
//     return manifest.files
//       .map(liftFilename)
//       .filter(({ filename }) => !filename.match(/\.(jpg|png)/))
//       .map((file) => {
//         return pipe(
//           readUtf8(file.filename),
//           TE.map((html) => {
//             return {
//               ...file,
//               html
//             }
//           })
//         )
//       })
//   })
//   // TE.chain(TE.sequenceArray)
// )

// result().then(console.log)

// // const r2 = E.tryCatch(
// //   () => JSON.parse('{ hello: world }'),
// //   (err) => new Error(String(err))
// // )

// // console.log(r2)

// // 1.
// const first = (path: string) =>
//   Fs.readFile(path, { encoding: 'utf-8' })
//     .then((json) => {
//       return JSON.parse(json)
//     })
//     .then(async (manifest) => {
//       const path = Path.dirname(manifestPath)
//       // if (!Array.isArray(manifest?.files)) {
//       //   throw new Error('manifest.files is supposed to be an array')
//       // }

//       // 2.
//       const files = manifest.files.map((file) => {
//         // return pipe(
//         //   file,
//         //   liftFilename // 2A.
//         // )
//         // 2A.
//         const _file = typeof file === 'string' ? { filename: file } : file

//         // 2B.
//         // console.log(Path.extname(_file.filename))
//         if (Path.extname(_file.filename) === '.jpg') {
//           // return TE.right({ ..._file, html: '<body><img/></body>' })()
//           return pipe(
//             _file.filename,
//             (filename) =>
//               TE.tryCatch(
//                 () =>
//                   Fs.readFile(Path.join(path, 'source', 'images', filename), {
//                     encoding: 'binary'
//                   }),
//                 (err: any) => new Error(`${err}`)
//               ),
//             TE.fold(
//               (err: Error) => TE.left({ file: _file, err: err.message }),
//               (x) => TE.right(_file)
//             )
//           )()
//         }

//         return pipe(
//           _file.filename,
//           (filename) =>
//             TE.tryCatch(
//               // 2B-
//               () =>
//                 Fs.readFile(Path.join(path, 'source', 'xhtml', filename), {
//                   encoding: 'utf-8'
//                 }),
//               (err: any) => new Error(`${err}`)
//             ),
//           TE.map((html) => {
//             return {
//               ..._file,
//               hash: hashString(html)
//             }
//           }),
//           TE.fold(
//             () => TE.left(_file),
//             (x) => TE.right(x)
//           )
//         )()

//         // return Fs.readFile(Path.join(path, 'source', 'xhtml', _file.filename), {
//         //   encoding: 'utf-8'
//         // })
//         //   .then((html) => {
//         //     return TE.right({ ..._file, html })
//         //   })
//         //   .catch(TE.left)
//       })

//       return files
//     })
//     .then((proms) => Promise.all(proms))
//     // .then((funs) =>
//     //   funs.map((f) => {
//     //     return typeof f === 'function' ? f() : f
//     //   })
//     // )
//     .then(console.log)
