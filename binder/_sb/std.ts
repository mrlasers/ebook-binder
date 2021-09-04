import { when, ifElse } from 'fp-ts-std/Function'
import { pipe, flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import Path from 'path'
import Fs from 'fs/promises'

export interface Item {
  _tag: string
  filename: string
  [key: string]: any
}

export interface Image extends Item {
  width?: number
  height?: number
}

export interface Content extends Item {
  headings?: string[]
  pages?: string[]
}

const imagePipeline = flow<Image[], Image>((img) => {
  return {
    _tag: 'image',
    ...img,
    width: 0,
    height: 0
  }
})

const contentPipeline = flow<Content[], Content>((content) => {
  return {
    _tag: 'content',
    ...content,
    headings: [],
    pages: []
  }
})

const isImage = (img: any): img is Image => {
  return !!(img as Image).filename.match(/.(jpg|png)$/)
}
const path =
  'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/A Practical Reference/build/'
const input = 'TreeHouse.jpg'

const result = pipe(
  input,
  when((x) => typeof x === 'string')((filename) => ({ filename })),
  ifElse(imagePipeline)(contentPipeline)(isImage),
  (file) => {
    return TE.tryCatch(
      () =>
        Fs.readFile(
          Path.join(
            path,
            'source',
            file._tag === 'image' ? 'images' : 'xhtml',
            file.filename
          )
        ),
      (err) => new Error(`${err}`)
    )
  },
  TE.map((buffer) => {
    return buffer.toString()
  })
)

result().then(console.log)
