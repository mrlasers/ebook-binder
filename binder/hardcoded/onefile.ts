import * as TE from 'fp-ts/TaskEither'
import { pipe, flow } from 'fp-ts/function'
import { Lens } from 'monocle-ts'

import Fs from 'fs/promises'
import Path from 'path'

import { readFile, writeFile } from '../lib'
import { prettyPrint, processHtml } from '../processing'
import { FileError } from '../lib/fileIoTypes'
import { FileItem } from '../types'

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
const htmlfilename = 'Chapter2.xhtml'
const filename = Path.join(buildPath, 'source', 'xhtml', htmlfilename)
const outfilename = Path.join(buildPath, 'output', htmlfilename)

export type Item = {
  filename: string
  headings?: any[]
  pages?: any[]
  html?: string
}

// 3. load html content for current segment
const pipeline = pipe(
  readFile(filename),
  TE.map(processHtml({ footnotes: { '7': ['Hello, World!', 'The. End.'] } })),
  TE.chain((item) => {
    const { headings, pages, html } = item

    console.log('headings:', headings)
    console.log('pages:', pages)

    return pipe(
      writeFile(outfilename, prettyPrint(html)),
      TE.map((): Item => ({ filename: htmlfilename, headings, pages }))
    )
  })
)

// 4. make a function of the above
export function prepFilePipeline(
  inpath: string,
  outpath: string
): TE.TaskEither<FileError, Item> {
  return pipe(
    readFile(filename),
    TE.map(processHtml()),
    TE.chain((item) => {
      const { headings, pages, html } = item

      // console.log('headings:', headings)
      // console.log('pages:', pages)

      return pipe(
        writeFile(outfilename, prettyPrint(html)),
        TE.map((): Item => ({ filename: htmlfilename, headings, pages }))
      )
    })
  )
}

// result
const result = pipeline().then(console.log) //.then((x) => console.log(JSON.stringify(x, null, 2)))
