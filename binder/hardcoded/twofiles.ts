import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe, flow, identity } from 'fp-ts/function'
import { Do } from 'fp-ts-contrib/Do'
import { Lens } from 'monocle-ts'

import Fs from 'fs/promises'
import Path from 'path'

import { readFile, readJson, writeFile } from '../lib'
import { prettyPrint, processHtml, ProcessOptions } from '../processing'
import { FileError, FileOpenError, JsonReadError } from '../lib/fileIoTypes'
import { FileItem, FootnoteItems, Manifest } from '../types'
import { prepFilePipeline } from './onefile'

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

const manifestPath = Path.join(buildPath, 'manifest.json')

export function liftToFileItem(item: string | FileItem): FileItem {
  return typeof item === 'string' ? { filename: item } : item
}

export function loadConfiguration(path: string) {
  return Do(TE.Monad)
    .bindL('footnotes', () => loadFootnotes(Path.join(path, 'footnotes.json')))
    .bindL('manifest', () => loadManifest(Path.join(path, 'manifest.json')))
    .return(({ footnotes, manifest }) => ({
      root: path,
      footnotes,
      manifest: {
        ...manifest,
        files: manifest.files.map(liftToFileItem)
      }
    }))
}

const result = pipe(
  loadConfiguration(buildPath),
  TE.chain(({ footnotes, manifest, root }) => {
    const infile = Path.join(root, 'source', 'xhtml')
    const outfile = Path.join(root, 'output', 'Content')
    return pipe(
      manifest.files.map((item) =>
        !item.filename.match(/\.xhtml$/)
          ? TE.of(item)
          : fileProcessTask(
              Path.join(infile, item.filename),
              Path.join(outfile, item.filename),
              { footnotes, pretty: true, title: item.filename }
            )
      ),
      A.sequence(TE.Monad)
      // going to grab the headings together now
      // TE.map((items) => {
      //   return items.reduce((headings, item) => {
      //     if (item.headings) {
      //       return [...headings, ...item.headings]
      //     }

      //     return headings
      //   }, [])
      // }),
    )
  })
)().then(console.log)

export function fileProcessTask(
  input: string,
  output: string,
  options?: ProcessOptions
): TE.TaskEither<Error, FileItem> {
  return pipe(
    readFile(input),
    TE.map(processHtml(options)),
    TE.chain((item) => {
      const { html, ...rest } = item
      return pipe(
        writeFile(output, options?.pretty ? prettyPrint(html) : html),
        TE.map((): FileItem => ({ ...rest, filename: Path.basename(output) }))
      )
    })
  )
}
