import { CheerioAPI } from 'cheerio'
import { join } from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import Path from 'path'

import { finalClean, load, unwrapDocumentBody } from '../'
import { writeFile } from '../../readWrite'
import { Err, OutputTuple } from '../../types'

export const htmlBodyToCombinedHtml = (html: string): string => `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta http-equiv="default-style" content="text/html;charset=utf-8" />
  <title>COMBINED</title>
  <link rel="stylesheet" type="text/css" href="../Styles/styles.css" />
  <link rel="stylesheet" type="text/css" href="../Styles/fullpage.css" />
  <link rel="stylesheet" type="text/css" href="../Styles/boxes.css" />
</head>
<body>${html}</body></html>`

console.log(`A.filter: ${A.filter}`)

export const writeCombinedHtml =
  (outputPath: string) => (tuples: OutputTuple[]) =>
    pipe(
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
      htmlBodyToCombinedHtml,
      (html) => writeFile(outputPath, finalClean(html))
    )
