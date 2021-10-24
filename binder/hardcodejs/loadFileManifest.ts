import Path from 'path'
import { pipe, flow } from 'fp-ts/function'
import { FootnoteItems } from '../types'
import { readFile, readJson } from './readWrite'
import { Node, FileNode, Image, Content, MyFile } from './types'

import { MyError } from './errors'

import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'

// export function loadFileManifest(
//   manifestPath: string,
//   footnotes: FootnoteItems
// ) {
//   return pipe(readJson(manifestPath))
// }

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

const manifestPath = Path.join(buildPath, 'files-manifest.json')

const jsonFileToEitherMyFile = (file): E.Either<MyError, MyFile> => {
  if (typeof file === 'string') {
    return E.of({ filename: file })
  }

  if (typeof file.filename === 'string') {
    return E.of(file)
  }

  return E.left(
    MyError.of(`manifest file entry wasn't formed right, but dunno why`)
  )
}

export const loadJsonArray = flow(
  readJson,
  TE.chain((json) =>
    Array.isArray(json)
      ? TE.right(json)
      : TE.left(MyError.of(`file manifest isn't an array`))
  ),
  TE.map(A.map(jsonFileToEitherMyFile)),
  TE.map(
    A.map(
      E.chain((file) => {
        if (!!file.filename.match(/\.(xhtml|html|htm)$/)) {
          return E.of({
            filename: file.filename,
            pages: [],
            headings: []
          })
        }
      })
    )
  )
  // TE.map(
  //   A.map(
  //     E.chain((file): E.Either<MyError, FileNode> => {
  //       if (!!file.filename.match(/\.(xhtml|html|htm)$/)) {
  //         return E.of(Content.of(file))
  //       }

  //       // if (!!file.filename.match(/\.(jpeg|jpg|png|gif)$/)) {
  //       //   return E.of(file)
  //       // }

  //       return E.left(MyError.of(`Unhandled filetype: ${file.filename}`))
  //     })
  //   )
  // ),
  // TE.map(A.map(E.map((file) => file.filename)))
  // TE.map(A.filter(E.isRight))
)

const result = pipe(loadJsonArray(manifestPath))

result().then(console.log)

// const result = loadFileManifest(Path.join(buildPath, 'files-manifest.json'), [])
