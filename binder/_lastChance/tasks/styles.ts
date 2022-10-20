import { pipe } from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import Path from "path"

import { CleanHtmlOptions } from "../exporter"
import * as Paths from "../paths"
import { readFile } from "../readWrite"
import { Err, FilePaths, InputStyles } from "../types"
import { FileOutput } from "./"

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
        toc: false,
      }
    })
  )
}
