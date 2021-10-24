import Path from 'path'
import { readFile, readJson } from '../lib'
import { pipe } from 'fp-ts/function'
import { guard } from 'fp-ts-std/Function'
import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export type FileImage = {
  title?: string
  filename: string
  html?: string
}

export type FileContent = {
  filename: string
  html?: string
}

export type InputFile = string | { filename: string; [key: string]: any }

export type FileType = FileImage | FileContent

export type Manifest = {
  metadata: {
    title: string
    pubId: string
    author: string
    publisher: string
  }
  files: (string | FileType)[]
}

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

const img = {
  filename: 'hello.jpg'
}

export function isFileImage(img: any): img is FileImage {
  const $img = img as FileImage
  return (
    $img.filename !== undefined && !!$img.filename.match(/\.(jpg|png|gif)$/)
  )
}

const content = {
  filename: 'Chapter1.xhtml'
}

export function isFileContent(content: any): content is FileContent {
  const $content = content as FileImage
  return (
    $content.filename !== undefined &&
    !!$content.filename.match(/\.(xhtml|html|htm)$/)
  )
}

export function isManifest(manifest: any): manifest is Manifest {
  const $manifest = manifest as Manifest
  return Array.isArray($manifest.files)
}

console.log(isManifest({ files: ['hello'] }))

// function liftIfString(filename: any | string) {
//   return typeof filename === 'string' ? { filename } : filename
// }

export function contentTask(path: string) {
  return (content: FileContent): TE.TaskEither<Error, FileContent> => {
    return pipe(
      readFile(Path.join(path, 'source/xhtml', content.filename)),
      TE.map((html) => {
        return {
          ...content,
          html
        }
      })
    )
  }
}

// const assignTask = (path: string) => (item: FileType) => {
//   if (isFileContent(item)) {
//     return contentTask(path)(item)
//   }

//   item

//   return TE.right(`${item?.filename} not handled`)
// }

const result = pipe(
  readJson(Path.join(buildPath, 'manifest.json')),
  TE.chain((json) => {
    if (isManifest(json)) {
      // return pipe(json.files.map(assignTask(buildPath)), A.sequence(TE.Monad))
      // return TE.of(json.files)
    }

    return TE.left(new Error(String(json)))
  })
)

result().then(console.log)
