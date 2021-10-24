import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe, flow, identity } from 'fp-ts/function'
import { Do } from 'fp-ts-contrib/Do'
import { Lens } from 'monocle-ts'

import Fs from 'fs/promises'
import Path from 'path'

import { readFile, readJson, writeFile } from '../lib'
import { prettyPrint, processHtmlHACK, ProcessOptions } from '../processing'
import { FileError, FileOpenError, JsonReadError } from '../lib/fileIoTypes'
import {
  FileItem,
  FootnoteItems,
  Manifest,
  Item,
  ImageItem,
  isImageItem,
  ErrorItem,
  ContentItem,
  isSectionItem,
  isItem,
  ManifestItem,
  isErrorItem,
  FilesTypes
} from '../types'

export type HTML = string

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'
const filename = 'Chapter1.xhtml'

// 1. get the metadata for the book
const bookMeta = {
  title:
    'A Practical Reference for Transgender and Gender-Noncomforming Adults',
  pubId: '3df43f3b-d894-40fb-8ba6-b2dcef42d984',
  author: 'Linda Gromko, MD',
  publisher: 'Bainbridge Books'
}

// 2. get filenames for all segments
const files = ['Chapter1.xhtml', 'Chapter2.xhtml']

// 2. get filename and path for current segment
// const htmlfilename = 'Chapter4.xhtml'
// const filename = Path.join(buildPath, 'source', 'xhtml', htmlfilename)
// const outfilename = Path.join(buildPath, 'output', 'Content', htmlfilename)

// 3. load html content for current segment

// 4. make a function of the above

function isFootnotes(obj: any): obj is FootnoteItems {
  return Object.keys(obj as FootnoteItems).reduce<boolean>((acc, key) => {
    if (Array.isArray((obj as FootnoteItems)[key])) {
      return true
    }

    return acc
  }, true)
}

const manifestPath = Path.join(buildPath, 'manifest.json')

function doSomethingWithTheConfig(files: Item[]) {
  return files
}

export function makeContentItem(item: Item): ContentItem {
  return {
    _tag: 'CONTENT',
    filename: item.filename
  }
}

export function makeImageItem(item: Item): ImageItem {
  const avoidToc =
    typeof item?.avoidToc === 'boolean' ? item.avoidToc : undefined
  return {
    _tag: 'IMAGE',
    filename: item.filename,
    title: item?.title || ''
    // landmark: item?.landmark,
    // avoidToc
  }
}

export function makeErrorItem(
  item: Item,
  msg: string = 'default error message'
): ErrorItem {
  return { _tag: 'ERROR', msg, item }
}

// export function liftToTypeItem(item: string | Item): Item {
//   return pipe(liftToItem(item), (i) => {
//     if (!!i.filename.match(/\.(jpg|png|gif|svg)$/)) {
//       return makeImageItem(i)
//     }

//     return i
//   })
// }

function eitherString(value: any): E.Either<any, string> {
  return typeof value === 'string' ? E.of(value) : E.left(value)
}

// const result = pipe(arr, A.map(liftToItem), A.separate)

// console.log(result)

export function liftToItem(item: string | Item): Item {
  return typeof item === 'string' ? { filename: item } : item
}

const assignItemType = (item: Item): ManifestItem => {
  if (!!item.filename.match(/\.(jpg|png|gif|svg)$/)) {
    return item?.level
      ? {
          _tag: 'SECTION',
          filename: item.filename,
          title: item.title,
          level: item.level,
          landmark: item.landmark || null,
          avoidToc: item.avoidToc || null
        }
      : {
          _tag: 'IMAGE',
          filename: item.filename,
          title: item?.title ?? '[MISSING TITLE]'
        }
  }

  if (item.filename.match(/\.(xhtml|html|htm)$/)) {
    return {
      _tag: 'CONTENT',
      filename: item.filename,
      headings: [],
      pages: []
    }
  }

  return {
    _tag: 'ERROR',
    item,
    message: `"${item.filename}" is not one of the droids we are looking for`
  }
}

const assignItem = (item: Item) => pipe(item, liftToItem, assignItemType)

function mapManifestItems(items: Item[]) {
  return items.map((item) => {
    if (item?.factory) {
      switch (item.factory) {
        case 'toc':
          return TE.right({ filename: item.filename, html: '<p>TOC</p>' })
      }
    }
  })
}

export const fileIngestionPipeline = (
  file: FilesTypes.ManifestFileItem
): FilesTypes.ItemFile => {
  const item = typeof file === 'string' ? { filename: file } : file

  if (!!item.filename.match(/\.(xhtml|html|htm)/)) {
    return {
      _tag: 'XHTML',
      ...item
    }
  }
}

const program = pipe(loadConfiguration(buildPath))

program().then(console.log)

function ifFootnotes(json: any) {
  return isFootnotes(json)
    ? TE.of(json)
    : TE.left(JsonReadError.of('was not footnotes'))
}

function ifManifest(json: any) {
  return (function (obj: any): obj is Manifest {
    return (obj as Manifest).files !== undefined
  })(json)
    ? TE.of(json)
    : TE.left(FileOpenError.of('manifest was not manifest'))
}

export const loadFootnotes = flow(readJson, TE.chain(ifFootnotes))

export const loadManifest = flow(readJson, TE.chain(ifManifest))

// export type Validator<T> = T extends (a: infer U) => U | never

// export function jsonLoader<Type>(fun: (json: any) => U extends E.Right<T> ? U : E.Left<T>) {
//   return (value: Type): TE.TaskEither<Error, Type> => TE.fromEither(fun(value))
// }

// const footnoteLoader = jsonLoader((json): Item => typeof json === 'string' ? E.of(json) : E.left(new Error(String(json))))

export function loadConfiguration(path: string) {
  return Do(TE.Monad)
    .bindL('footnotes', () => loadFootnotes(Path.join(path, 'footnotes.json')))
    .bindL('manifest', () => loadManifest(Path.join(path, 'manifest.json')))
    .return(({ footnotes, manifest }) => ({
      root: path,
      footnotes,
      metadata: manifest.metadata,
      files: manifest.files
    }))
}

export function fileProcessTask(
  input: string,
  output: string,
  options?: ProcessOptions
): TE.TaskEither<Error, FileItem> {
  return pipe(
    readFile(input),
    TE.map(processHtmlHACK(options)),
    TE.chain((item) => {
      const { html, ...rest } = item
      return pipe(
        writeFile(output, options?.pretty ? prettyPrint(html) : html),
        TE.map((): FileItem => ({ ...rest, filename: Path.basename(output) }))
      )
    })
  )
}
