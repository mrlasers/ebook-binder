import Fs from 'fs/promises'
import Path from 'path'
import * as TE from 'fp-ts/TaskEither'
import { parse } from 'fp-ts-std/JSON'
import { pipe, flow } from 'fp-ts/lib/function'
import { Json } from 'fp-ts/lib/Json'

import { Err } from '../types'

// import * as Normalize from './normalize'
// import * as Err from '../types/errors'
// import { Footnotes } from '../types'

// import * as Paths from '../paths'

export const doesFileExist = (path: string) =>
  TE.tryCatch(
    () => Fs.stat(path),
    () => Err.FileReadError.of(`File does not exist: ${path}`)
  )

export const readFile = (path: string): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () => Fs.readFile(path, { encoding: 'utf-8' }),
    () => Err.FileReadError.of(path)
  )

export const parseJson = flow(parse(Err.JsonParseError.of), TE.fromEither)

export const readJson = flow(readFile, TE.chain(parseJson))

// export const isFile = flow(Fs.)
