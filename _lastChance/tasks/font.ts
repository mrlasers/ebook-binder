import * as A from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import { isBoolean } from "fp-ts/lib/boolean"
import { isNumber } from "fp-ts/lib/number"
import { isString } from "fp-ts/lib/string"
import * as O from "fp-ts/Option"
import * as TE from "fp-ts/TaskEither"
import Path from "path"

import {
  cleanHtml,
  CleanHtmlOptions,
  getHeadingsFromHtml,
  getImagesFromHtml,
  getPagesFromHtml,
} from "../exporter"
import * as Paths from "../paths"
import { readFile } from "../readWrite"
import { Err, InputFont } from "../types"
import { Styles as InputType } from "../types/manifest"
import { basename, FileOutput, Heading, Image, isHtmlFilename } from "./"

type Options = {
  path?: string
  sourcePath: string
}

export function of(
  input: InputFont,
  options?: CleanHtmlOptions & Options
): TE.TaskEither<Err.MyError, FileOutput> {
  return pipe(
    readFile(Path.resolve(options.sourcePath, input.filename)),
    TE.map((css): FileOutput => {
      return {
        _tag: 'FONT',
        filename:
          Paths.safeJoinPath(options?.path, input.filename) || input.filename,
        headings: [],
        html: css,
        images: [],
        pages: [],
        landmark: null,
        toc: false,
      }
    })
  )
}
