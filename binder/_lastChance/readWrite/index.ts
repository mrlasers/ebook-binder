import { parse } from "fp-ts-std/JSON"
import { flow, pipe } from "fp-ts/lib/function"
import { Json } from "fp-ts/lib/Json"
import * as T from "fp-ts/Task"
import * as TE from "fp-ts/TaskEither"
import Fs from "fs/promises"
import Path from "path"
import Rimraf from "rimraf"
import { promisify } from "util"

import * as Paths from "../paths"
import { Footnotes } from "../types"
import * as Err from "../types/errors"
import * as Normalize from "./normalize"

export * from './zip'
export * from './image'

const rimraf = promisify(Rimraf)

// export const writeFile = (path: string, data: string) => {
//   // console.log({ src: 'writeFile():', path, text: data.slice(0, 20) })
//   return TE.tryCatch(
//     () =>
//       Fs.writeFile(path, data, { encoding: 'utf-8' }).then(() => {
//         return `File written: ${path}`
//       }),
//     (err) => Err.MyError.of(`Error writing file ${String(err)}`)
//   )
// }

export const writeFile = (path: string, data: string) => {
  // console.log({ src: 'writeFile():', path, text: data.slice(0, 20) })
  // return pipe(
  //   TE.tryCatch(
  //     () =>
  //       Fs.stat(Path.dirname(path))
  //         .then((stats) => stats.isDirectory)
  //         .catch(() => Fs.mkdir(Path.dirname(path))),
  //     (err) =>
  //       Err.MyError.of(`Attempted to write to directory that does not exist`)
  //   ),
  //   TE.mapLeft
  // )

  return TE.tryCatch(
    () =>
      Fs.writeFile(path, data, { encoding: 'utf-8' }).then(() => {
        return `File written: ${path}`
      }),
    (err) => Err.MyError.of(`Error writing file ${String(err)}`)
  )
}

export const readFile = (path: string) =>
  TE.tryCatch(
    () => Fs.readFile(path, { encoding: 'utf-8' }),
    () => Err.MyError.of(`Error loading file ${path}`)
  )

export const readJson = (path: string) =>
  pipe(
    readFile(path),
    TE.chain(
      flow(
        parse((e) => Err.MyError.of(`ERROR parsing json from ${path}: ${e}`)),
        TE.fromEither
      )
    )
  )

export const deleteFile = (path: string) =>
  TE.tryCatch(() => rimraf(path), Err.MyError.of)

export const mkDir = (path: string) =>
  TE.tryCatch(() => Fs.mkdir(path, { recursive: true }), Err.MyError.of)

export const readJsonArray = (path: string) =>
  pipe(
    readJson(path),
    TE.chain((json) =>
      Array.isArray(json)
        ? TE.of(json)
        : TE.left(
            Err.MyError.of(
              `ERROR reading json array: expected ${path} to be array`
            )
          )
    )
  )

export const readFootnotes = (path: string) =>
  pipe(readJson(path), TE.map(Normalize.FootnoteseJson))

export const copyFile = (from: string, to: string) => {
  return TE.tryCatch(
    () => Fs.copyFile(from, to).then(() => `Copied file to ${to}`),
    Err.MyError.of
  )
}
