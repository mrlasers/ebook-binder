import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe, flow, identity } from 'fp-ts/function'
import { Do } from 'fp-ts-contrib/Do'

import Fs from 'fs/promises'
import Path from 'path'
import { readJson, FileOpenError } from '../lib'
import { isNumber } from 'fp-ts/lib/number'

import {
  FootnoteItems,
  Manifest,
  Item,
  ManifestMetaData,
  FilesTypes
} from '../types'

export const loadFootnotes = flow(
  readJson,
  TE.map((json) => json as FootnoteItems)
)

export function filterFootnotes(footnotes: FootnoteItems): FootnoteItems {
  return Object.keys(footnotes).reduce(
    (acc, key) => ({
      ...acc,
      [key]: footnotes[key].map((s) => s.trim()).filter(Boolean)
    }),
    {}
  )
}

export const loadManifest = flow(
  readJson,
  TE.map((manifest) => manifest as Manifest)
)

export function liftToItem(item: string | Item): Item {
  return typeof item === 'string' ? { filename: item } : item
}

export function assignItem(item: Item): FilesTypes.ItemFile {
  if (item.filename.match(/\.(xhtml|html|htm)$/)) {
    return {
      _tag: 'XHTML',
      filename: item.filename
    }
  }

  if (item.filename.match(/\.(jpg|png)$/)) {
    if (item)
      return {
        _tag: 'IMAGE',
        filename: item.filename
      }
  }

  return {
    _tag: 'UNKNOWN',
    filename: item.filename,
    source: item
  }
}

export type Configuration = {
  buildPath: string
  footnotes: FootnoteItems
  metadata: ManifestMetaData
  files: FilesTypes.ItemFile[]
}

export function loadConfiguration(path: string) {
  return Do(TE.Monad)
    .bindL('footnotes', () => loadFootnotes(Path.join(path, 'footnotes.json')))
    .bindL('manifest', () => loadManifest(Path.join(path, 'manifest.json')))
    .return(({ footnotes, manifest }): Configuration => {
      return {
        buildPath: path,
        footnotes: filterFootnotes(footnotes),
        metadata: manifest.metadata,
        files: A.map(flow(liftToItem, assignItem))(manifest.files)
      }
    })
}

// we want to get the headings and processing info whatever from the files
// export function processFile(file: FilesTypes.ItemFile): E.Either<Error, FilesTypes.FileMetadata> {

// }

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

const program = flow(loadConfiguration(buildPath))

program().then(console.log) //.then((x) => console.log(JSON.stringify(x, null, 2)))
