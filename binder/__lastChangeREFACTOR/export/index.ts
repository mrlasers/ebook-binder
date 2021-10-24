import Path from 'path'
import Cheerio, {
  CheerioOptions,
  BasicAcceptedElems,
  Node,
  Document,
  CheerioAPI
} from 'cheerio'
import { pipe, flow } from 'fp-ts/function'

import { FileOutput, HTML } from '../types'
import { toLinuxPath } from '../helpers'

export const load = (html: string): CheerioAPI =>
  Cheerio.load(html, { xmlMode: true, decodeEntities: false })

export function addImagePath(imagePath: string) {
  return ($: CheerioAPI): CheerioAPI => {
    $('img').each(function () {
      $(this).attr(
        'src',
        toLinuxPath(Path.join(imagePath, $(this).attr('src')))
      )
    })

    return $
  }
}

export function addDocumentWrap(file: FileOutput) {
  return (body: string) => {
    return `
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
  <meta http-equiv="default-style" content="text/html;charset=utf-8"/>
  <title>${file.title || 'Oops, no title'}</title>
  <link rel="stylesheet" type="text/css" href="../Styles/styles.css"/>
  </head>
  <body>
  ${body}
  </body>
  </html>
   `
  }
}

export type PrepExportOptions = {
  paths: {
    content: string
    images: string
    navigation: string
    styles: string
  }
}

export function prepExport(options: PrepExportOptions) {
  return (file: FileOutput): FileOutput => {
    if (file._tag === 'HTML') {
      return {
        ...file,
        body: pipe(
          load(file.body),
          addImagePath(
            Path.relative(options.paths.content, options.paths.images)
          ),
          (x) => x.html(),
          addDocumentWrap(file)
        )
      }
    }

    return file
  }
}
