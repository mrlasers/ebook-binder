import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe, flow } from 'fp-ts/function'
import { Lens } from 'monocle-ts'

import Fs from 'fs/promises'
import Path from 'path'

import { readFile, readJson, writeFile } from '../lib'
import { prettyPrint, processHtml, ProcessOptions } from '../processing'
import { FileError, JsonReadError } from '../lib/fileIoTypes'
import { FileItem, FootnoteItems } from '../types'

export type HTML = string

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

// 1. get the metadata for the book
const bookMeta = {
  title:
    'A Practical Reference for Transgender and Gender-Noncomforming Adults',
  pubId: '3df43f3b-d894-40fb-8ba6-b2dcef42d984',
  author: 'Linda Gromko, MD',
  publisher: 'Bainbridge Books'
}

// 2. get filename and path for current segment
const htmlfilename = 'Chapter4.xhtml'
const filename = Path.join(buildPath, 'source', 'xhtml', htmlfilename)
const outfilename = Path.join(buildPath, 'output', 'Content', htmlfilename)

export type Item = {
  filename: string
  headings?: any[]
  pages?: any[]
  html?: string
}

// 3. load html content for current segment
// const pipeline = pipe(
//   readFile(filename),
//   TE.map(processHtml({ footnotes: { '7': ['Hello, World!', 'The. End.'] } })),
//   TE.chain((item) => {
//     const { headings, pages, html } = item

//     // console.log('headings:', headings)
//     // console.log('pages:', pages)

//     return pipe(
//       writeFile(outfilename, prettyPrint(html)),
//       TE.map((): Item => ({ filename: htmlfilename, headings, pages }))
//     )
//   })
// )

// 4. make a function of the above
export function prepFilePipeline(
  infile: string,
  outfile: string,
  options?: ProcessOptions
): TE.TaskEither<Error, Item> {
  return pipe(
    readFile(infile),
    TE.map(processHtml(options)),
    TE.chain((item) => {
      const { html, ...rest } = item

      // console.log('headings:', headings)
      // console.log('pages:', pages)

      return pipe(
        writeFile(outfilename, prettyPrint(html)),
        TE.map((): Item => ({ ...rest, filename: htmlfilename }))
      )
    })
  )
}

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

const result = pipe(
  readJson(Path.join(buildPath, 'footnotes.json')),
  TE.chain(ifFootnotes),
  TE.chain((footnotes: FootnoteItems) => {
    const infile = filename
    const outfile = outfilename
    return prepFilePipeline(infile, outfile, { footnotes })
  })
)().then((x) => console.log(JSON.stringify(x, null, 2)))

// TE.map((footnotes: FootnoteItems) => {
//   const infile = filename
//   const outfile = outfilename
//   return prepFilePipeline(infile,outfile,{footnotes})
// }))

// result
// const result = pipeline().then(console.log) //.then((x) => console.log(JSON.stringify(x, null, 2)))
