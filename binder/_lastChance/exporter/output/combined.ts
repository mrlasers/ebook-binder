import { CheerioAPI } from 'cheerio'
import { join } from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import Path from 'path'

import { finalClean, load, unwrapDocumentBody } from '../'
import { safeJoinPath } from '../../paths'
import { writeFile } from '../../readWrite'
import { FileOutput } from '../../tasks'
import { Err, OutputTuple } from '../../types'

export const htmlBodyToCombinedHtml =
  ({ stylePath, imagePath, styles }: WriteCombinedHtmlOptions) =>
  (html: string): string => {
    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" land="us-EN">
<head>
  <meta http-equiv="default-style" content="text/html;charset=utf-8" />
  <title>COMBINED</title>
  ${pipe(
    styles,
    A.map((style) => Path.basename(style)),
    A.map(
      (style) =>
        `<link rel="stylesheet" type="text/css" href="${safeJoinPath(
          stylePath,
          style
        )}" />`
    )
  )}
  <link rel="stylesheet" type="text/css" href="${safeJoinPath(
    stylePath,
    'debug.css'
  )}" />
</head>
<body>${html}</body></html>`
  }

export type WriteCombinedHtmlOptions = {
  stylePath: string
  imagePath: string
  styles?: string[]
}

export const writeCombinedHtml =
  (outputPath: string, options: WriteCombinedHtmlOptions) =>
  (tuples: OutputTuple[]) => {
    console.log(
      `
=== writeCombinedHtml() ===================================
  * does not validate/create output directory, this should be fixed
===========================================================
`.trim()
    )

    const styles = pipe(
      tuples,
      A.filter(([type, destination, content]) => type === 'style'),
      A.map(([type, destination]) => Path.basename(destination))
    )

    return pipe(
      tuples,
      A.filter((tup) => ['content'].includes(tup[0])),
      A.map((tup): [string, CheerioAPI] => [
        Path.basename(tup[1]),
        load(tup[2])
      ]),
      A.map(([filename, $]) => {
        const html = unwrapDocumentBody($).html()

        return `<div class="debug"><hr/><a href="${filename}">${filename}</a><hr/></div>${html}`
      }),
      join('\n'),
      htmlBodyToCombinedHtml({ ...options, styles: styles }),
      (html) => writeFile(outputPath, finalClean(html, options))
    )
  }
