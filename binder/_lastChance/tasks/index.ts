import * as TE from 'fp-ts/TaskEither'
import * as Path from 'path'

import { CleanHtmlOptions } from '../exporter'
import * as Paths from '../paths'
import { Err, FileInput, FilePaths } from '../types'
// import {Image,Content,} from '../types/manifest'
import * as Manifest from '../types/manifest'
import * as Content from './content'
import * as Factory from './factory'
import * as Font from './font'
import * as ImageSection from './image'
import * as Section from './section'
import * as Styles from './styles'

export const basename = (filename: string) =>
  filename.trim().replace(/\.[^.]*$/g, '')

export const isHtmlFilename = (filename: string): boolean =>
  !!filename.match(/\.(html|xhtml|htm)$/)

export const isImageFilename = (filename: string): boolean =>
  !!filename.match(/\.(jpg|jpeg|png|gif)/)

export const ALL_TAGS = [
  'HTML',
  'IMAGE',
  'SECTION',
  'FACTORY',
  'ERROR',
  'NCX',
  'NAVDOC',
  'STYLES',
  'OPF',
  'FONT'
] as const
export type TagTuple = typeof ALL_TAGS
export type Tag = TagTuple[number]

export type Heading = {
  id: string | null
  text: string
  html?: string
  level: number
  filename?: string
  toc?: boolean
  landmark?: string
}

export type Page = {
  id: string
  num: string
  filename?: string
}

export type Image = {
  source: string
  destination: string
}

export type TextLink = {
  text: string
  filename: string
}

export type FileOutput = {
  _tag: Tag
  filename: string
  headings: Heading[]
  pages: Page[]
  images: Image[]
  html: string
  toc?: boolean
  landmark?: string
}

export type StylesOutput = FileOutput & { _tag: 'STYLES' }

export function isFileOutput(file: any): file is FileOutput {
  const $file = file as FileOutput

  if (!$file) return false
  if (!ALL_TAGS.includes($file._tag)) return false
  if (typeof $file.filename !== 'string') return false
  if (!Array.isArray($file.headings)) return false
  if (!Array.isArray($file.pages)) return false
  if (!Array.isArray($file.images)) return false
  if (typeof $file.html !== 'string') return false

  return true
}

export function isStylesOutput(output: FileOutput): output is StylesOutput {
  return output._tag === 'STYLES'
}

export type AssignToFileTaskEitherOptions = {
  paths?: {
    buildPath: string
    epub?: FilePaths
    source?: FilePaths
  }
}

export const assignToFileTaskEither =
  (options?: CleanHtmlOptions & AssignToFileTaskEitherOptions) =>
  (file: Required<FileInput>): TE.TaskEither<Err.MyError, FileOutput> => {
    switch (file._tag) {
      default:
        return TE.left(
          Err.MyError.of(
            `Unknown input file, this probably shouldn't happen: ${file}`
          )
        )
      case 'CONTENT':
        // console.log(
        //   `assignToFileTaskEither() :: ${options?.paths?.source?.stylePath}`
        // )
        return Content.of(file, {
          internalPath: options?.paths?.epub?.htmlPath,
          sourcePath: Path.resolve(
            options.paths.buildPath,
            options?.paths?.source?.htmlPath
          ),
          footnotes: options?.footnotes
        })
      case 'IMAGE':
        return ImageSection.of(file, {
          internalPath: options?.paths?.epub?.imagePath,
          sourcePath: Path.resolve(
            options.paths.buildPath,
            options?.paths?.source?.imagePath
          ),
          htmlPath: Paths.joinPath(options?.paths?.epub?.htmlPath)
        })
      case 'SECTION':
        return Section.of(file, { path: options?.paths?.epub?.htmlPath })
      case 'FACTORY':
        return Factory.of(file, { path: options?.paths?.epub?.htmlPath })
      case 'STYLES':
        return Styles.of(file, {
          internalPath: options?.paths?.epub?.stylePath,
          sourcePath: Path.resolve(
            options.paths.buildPath,
            options?.paths?.source?.stylePath
          )
        })
      case 'FONT':
        console.log(
          `assignToFileTaskEither(fontPath):: ${options?.paths?.source?.fontPath}`
        )
        return Font.of(file, {
          path: options?.paths?.epub?.fontPath,
          sourcePath: Path.resolve(
            options.paths.buildPath,
            options?.paths?.source?.fontPath
          )
        })
    }
  }
