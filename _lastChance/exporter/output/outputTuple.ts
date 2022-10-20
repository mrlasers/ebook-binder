import * as A from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import Path from "path"

import {
  addDocumentWrapHtml,
  Collector,
  decorateFileOutput,
  finalClean,
} from "../"
import { prettyPrint } from "../../../binder/processing"
import * as Paths from "../../paths"
import { FileOutput, isStylesOutput } from "../../tasks"
import { Metadata, OutputTuple, OutputTupleOptions } from "../../types"

export const makeStyleTuple = (path: string, css: string): OutputTuple => [
  'style',
  path,
  css,
]

export function collectedToOutputTuples(options: OutputTupleOptions) {
  return (collected: Collector): OutputTuple[] => {
    return pipe(
      collected.files,
      A.map<FileOutput, OutputTuple>((file): OutputTuple => {
        switch (file._tag) {
          default:
            return undefined
          case 'STYLES':
            return makeStyleTuple(file.filename, file.html)
          case 'HTML':
          case 'SECTION':
          case 'IMAGE':
          case 'FACTORY':
            return [
              'content',
              file.filename,
              pipe(
                file,
                addDocumentWrapHtml(collected.files.filter(isStylesOutput)),
                finalClean
              ),
            ]
          case 'NAVDOC':
          case 'NCX':
          case 'OPF':
            return ['xml', file.filename, prettyPrint(file.html)]
          case 'FONT':
            return [
              'font',
              file.filename,
              Path.resolve(
                options.sourceFontPath,
                Path.basename(file.filename)
              ),
            ]
        }
      }),
      A.filter(Boolean),
      A.concat(
        pipe(
          collected.images,
          A.map((img): OutputTuple => {
            return [
              'image',
              img.destination,
              Path.resolve(options.sourceImagePath, img.source),
            ]
          })
        )
      )
    )
  }
}
