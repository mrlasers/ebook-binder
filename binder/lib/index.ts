import * as _Cheerio from "cheerio"
import { createHash } from "crypto"
import { parse, parseO } from "fp-ts-std/JSON"
import { flow, identity, pipe } from "fp-ts/function"
// import * as IO from 'fp-ts/IO'
import * as IO from "fp-ts/IOEither"
import * as TE from "fp-ts/TaskEither"
import Fs from "fs/promises"
import Path from "path"

import {
  FileError,
  FileOpenError,
  FileWriteError,
  JsonReadError,
} from "./fileIoTypes"

export { CheerioAPI } from 'cheerio'
export * from './fileIoTypes'

export const cheerio = {
  load: (content: string | _Cheerio.Node | _Cheerio.Node[] | Buffer) =>
    _Cheerio.load(content, { xmlMode: true, decodeEntities: false }),
}

export function hashString(str: string): string {
  return createHash('md5').update(str).digest('hex')
}

// export function readFile(path: string) {
//   return TE.tryCatch(
//     () => Fs.readFile(path, { encoding: 'utf-8' }),
//     (err) => new Error(String(err))
//   )
// }

export function writeFile(
  filename: string,
  content: string
): TE.TaskEither<FileError, void> {
  return TE.tryCatch(
    () => Fs.writeFile(filename, content, { encoding: 'utf-8' }),
    () => FileWriteError.of(filename)
  )
}

export function readFile(filename: string): TE.TaskEither<FileError, string> {
  return TE.tryCatch(
    () => Fs.readFile(filename, { encoding: 'utf-8' }),
    () => FileOpenError.of(filename)
  )
}

export const readJson = flow(
  readFile,
  TE.chain(flow(parse(JsonReadError.of), TE.fromEither))
)
