import { Do } from 'fp-ts-contrib/Do'
import { guard } from 'fp-ts-std/Function'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { flow, identity, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import Fs from 'fs/promises'
import { nanoid } from 'nanoid'
import Path from 'path'

import { prepExport } from './export'
// import { Content, Image, Section } from './types/manifest'
import { stripExt } from './helpers'
import { readFootnotes, readManifest } from './import'
import { readFile } from './io'
import {
    Content,
    Err,
    Factory,
    FileOutput,
    HTML,
    Image,
    Input,
    isContentInput,
    isFactoryInput,
    isImageInput,
    isSectionInput,
    Section
} from './types'

export function readProjectConfig(projectPath: string) {
  return Do(TE.Monad)
    .bind('footnotes', readFootnotes(projectPath))
    .bind('manifest', readManifest(projectPath))
    .return(({ manifest, footnotes }) => ({ ...manifest, footnotes }))
}

export const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

export function sectionToFileOutput(input: Section): FileOutput {
  return {
    _tag: 'HTML',
    title: input.title,
    filename: `${stripExt(input.filename)}.xhtml`,
    body: `<div class="cover"><img src="${input.filename}" alt="${input.title}"/></div>`
  }
}

const makeEmptyFileOutput = (): FileOutput => ({
  _tag: 'HTML',
  body: '',
  filename: '',
  title: ''
})

const factoryToFileOutput = (input: Factory): FileOutput => ({
  _tag: 'HTML',
  filename: '',
  body: '',
  title: ''
})

const contentToFileOutput =
  (input: Content) =>
  (html: HTML): FileOutput => ({
    _tag: 'HTML',
    title: '',
    filename: input.filename,
    body: ''
  })

type ConvertInputOptions = {
  sourcePaths: {
    content: string
    images: string
  }
}

const convertInput =
  (options: ConvertInputOptions) =>
  (input: Input): TE.TaskEither<Error, FileOutput> => {
    // if (isImageInput(input)) return imageToFileOutput(input)
    if (isSectionInput(input)) return TE.of(sectionToFileOutput(input))
    if (isContentInput(input))
      return pipe(
        readFile(Path.resolve(options.sourcePaths.content, input.filename)),
        TE.map(contentToFileOutput(input))
      )
    if (isFactoryInput(input)) return TE.of(factoryToFileOutput(input))

    // return TE.left(Err.InputTypeError.of(`Unhandled input type: ${input._tag}`))

    // switch (input._tag) {
    //   default:
    //     O.none
    //   case 'IMAGE':
    //     const i = input
    //     O.of(imageToFileOutput(input))
    // }
  }

export type Collector = {
  paths: {
    rootPath: string
    outputRoot: string
  }
}

type Success = {
  status: 'SUCCESS',
  message: string
}

const program = pipe(
  readProjectConfig(buildPath),
  TE.map(({ files }) => pipe(files, A.filter(isImageInput))),
  TE.map(
    A.map(
      (image) => (collected: Collector) =>
        pipe(
          TE.tryCatch(
            () =>
              Fs.copyFile(
                Path.resolve(collected.paths.rootPath, image.filename),
                Path.resolve(
                  collected.paths.outputRoot,
                  'Images',
                  image.filename
                )
              ).then((_): Success => ({
                status: 'SUCCESS',
                message: `Copied file ${image.filename} to destination`
              })),
            (): Error =>
              Err.OutputWriteError.of(
                `Could not copy ${image.filename} to output location`
              )
          )
        )
    )
  ),
  TE.map(A.map(TE.ap(TE.of<never, Collector>({paths: }))))
  // TE.chain(
  //   ({ metadata, files, footnotes }) =>
  //     pipe(
  //       files,
  //       A.map(
  //         convertInput({
  //           sourcePaths: {
  //             content: Path.resolve(buildPath, 'source', 'xhtml'),
  //             images: Path.resolve(buildPath, 'source', 'images')
  //           }
  //         })
  //       ),
  //       A.sequence(TE.Monad)
  //       // A.map(TE.map((f) => f.body.slice(0, 40)))
  //     )
  //   // pipe(files, A.filter(isSectionInput))
  // )
  // TE.map(A.map(imageToFileOutput))

  //== this is like pre-export stuff
  // TE.map(
  //   A.map(
  //     prepExport({
  //       paths: {
  //         content: 'Content',
  //         images: 'Images',
  //         navigation: 'Navigation',
  //         styles: 'Styles'
  //       }
  //     })
  //   )
  // )
)

program().then(console.log)
