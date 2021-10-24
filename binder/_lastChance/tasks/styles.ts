import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import { isBoolean } from 'fp-ts/lib/boolean'
import { isNumber } from 'fp-ts/lib/number'
import { isString } from 'fp-ts/lib/string'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import Path from 'path'

import {
    cleanHtml,
    CleanHtmlOptions,
    getHeadingsFromHtml,
    getImagesFromHtml,
    getPagesFromHtml,
} from '../exporter'
import * as Paths from '../paths'
import { readFile } from '../readWrite'
import { Err, FilePaths, InputStyles } from '../types'
import { Styles as InputType } from '../types/manifest'
import { basename, FileOutput, Heading, Image, isHtmlFilename } from './'

export type Options = {
  internalPath?: string
  sourcePath?: string
  paths?: {
    source?: FilePaths
    epub?: FilePaths
  }
}

export function of(
  input: InputStyles,
  options?: CleanHtmlOptions & Options
): TE.TaskEither<Err.MyError, FileOutput> {
  const filename =
    Paths.safeJoinPath(options?.internalPath, input.filename) || input.filename

  console.log(`Styles.of(): ${filename}`)

  return pipe(
    readFile(
      Path.resolve(
        options?.sourcePath ?? Paths.sourceStylesPath,
        input.filename
      )
    ),
    TE.map((css): FileOutput => {
      return {
        _tag: 'STYLES',
        filename: filename,
        headings: [],
        html: css,
        images: [],
        pages: [],
        landmark: null,
        toc: false
      }
    })
  )
}
