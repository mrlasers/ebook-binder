import { isBoolean } from 'fp-ts/lib/boolean'
import { isNumber } from 'fp-ts/lib/number'
import { isString } from 'fp-ts/lib/string'
import * as TE from 'fp-ts/TaskEither'

import * as Paths from '../paths'
import { Err, InputFactory } from '../types'
import { basename, FileOutput, isHtmlFilename } from './'
import * as Content from './content'

export function of(
  input: InputFactory,
  options?: { path?: string }
): TE.TaskEither<Err.MyError, FileOutput> {
  if (input.factory !== 'toc')
    return TE.left(
      Err.MyError.of(`Unsupported factory type. Supported factory types: "toc"`)
    )

  return TE.of({
    _tag: 'FACTORY',
    filename:
      Paths.safeJoinPath(options?.path, input.filename) || input.filename,
    headings: [
      {
        id: null,
        text: input.title,
        html: input.title,
        toc: input.toc,
        level: 0,
        landmark: 'toc'
      }
    ],
    pages: [],
    images: [],
    html: '',
    toc: false,
    landmark: input.landmark || undefined
  })
}
