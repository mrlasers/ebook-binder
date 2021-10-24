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
import { Err, InputStyles } from '../types'
import { Styles as InputType } from '../types/manifest'
import { basename, FileOutput, Heading, Image, isHtmlFilename } from './'

export function of(
  input: InputStyles,
  options?: CleanHtmlOptions & { path?: string }
): TE.TaskEither<Err.MyError, FileOutput> {
  return pipe(
    readFile(Path.resolve(Paths.sourceStylesPath, input.filename)),
    TE.map((css): FileOutput => {
      return {
        _tag: 'STYLES',
        filename:
          Paths.safeJoinPath(options?.path, input.filename) || input.filename,
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
