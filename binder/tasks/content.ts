import * as A from "fp-ts/Array"
import { pipe } from "fp-ts/function"
import { isBoolean } from "fp-ts/lib/boolean"
import { isNumber } from "fp-ts/lib/number"
import { isString } from "fp-ts/lib/string"
import * as TE from "fp-ts/TaskEither"
import Path from "path"

import {
  cleanHtml,
  CleanHtmlOptions,
  getFiguresFromHtml,
  getHeadingsFromHtml,
  getImagesFromHtml,
  getPagesFromHtml,
} from "../exporter"
import * as Paths from "../paths"
import { readFile } from "../readWrite"
import { Err, FilePaths, InputContent } from "../types"
import { Content as InputType } from "../types/manifest"
import {
  basename,
  FileOutput,
  Heading,
  Image,
  isHtmlFilename,
  TextLink,
} from "./"

export function isInput(value: any): value is InputType {
  const content = value as InputType

  if (
    typeof content.filename !== 'string' ||
    !content.filename.length ||
    !isHtmlFilename(content.filename)
  )
    return false
  if (content.toc && !isBoolean(content.toc)) return false
  if (content.landmark && !isString(content.landmark)) return false
  if (content.title && !isString(content.title)) return false

  return true
}

export type Options = {
  internalPath?: string
  sourcePath?: string
  paths?: {
    source?: FilePaths
    epub?: FilePaths
  }
}

export function of(
  input: InputContent,
  options?: CleanHtmlOptions & Options
): TE.TaskEither<Err.MyError, FileOutput> {
  return pipe(
    readFile(
      // Path.resolve(options?.sourcePath ?? Paths.sourceHtmlPath, input.filename)
      Path.resolve(options?.sourcePath, input.filename)
    ),
    TE.map((html): FileOutput => {
      const $html = cleanHtml(html, options)()
      const filename =
        Paths.safeJoinPath(options?.internalPath, input.filename) ||
        input.filename

      return {
        _tag: 'HTML',
        filename: filename,
        headings: pipe(
          getHeadingsFromHtml($html, input.landmark),
          A.concat<Heading>(
            !!input.title
              ? [
                  {
                    id: null,
                    level: null,
                    text: input.title,
                    filename: input.filename,
                    html: input.title,
                    landmark: input.landmark,
                    toc: input.toc,
                  },
                ]
              : []
          )
        ),
        html: $html,
        toc: isBoolean(input.toc) ? input.toc : true,
        images: getImagesFromHtml($html),
        landmark: input.landmark || undefined,
        pages: getPagesFromHtml($html),
      }
    })
  )
}
