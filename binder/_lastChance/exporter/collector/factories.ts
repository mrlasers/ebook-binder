import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'

import { Collector } from '../'
import * as Paths from '../../paths'
import { FileOutput, Heading, Image, Page } from '../../tasks'
import { Metadata, NormalizedConfig } from '../../types'

export type TocFactory = {
  [key: string | symbol]: (file: FileOutput, collected: Collector) => FileOutput
}

const tocFactory: TocFactory = {
  _default: (file, collected) => {
    return {
      ...file,
      html:
        `<h1><span>${
          file.headings?.[0].text ?? 'Table of Contents'
        }</span></h1>` +
        // collected.headings
        collected.toc.inline
          // .filter((heading) => heading.toc)
          .map((heading) => {
            const level = heading.level + 1
            const tocClass =
              level === 2 && !heading.text.toLowerCase().match(/^chapter/)
                ? `toc`
                : `toc${level}`

            return `${'  '.repeat(
              heading.level
            )}<p class="${tocClass}"><a href="${Paths.relativePath(
              Paths.htmlPath,
              heading.filename
            )}">${heading.html}</a></p>`
          })
          .join('\n'),
    }
  },
  possibilities: (file, collected) => {
    return {
      ...file,
      html:
        `<h1>${file.headings?.[0].text ?? 'Table of Contents'}</h1>` +
        `<table class="toc">` +
        collected.toc.inline
          .map((heading) => {
            const level = heading.level + 1
            const tocClass = `toc${level}`
            const path = Paths.relativePath(Paths.htmlPath, heading.filename)
            const [left, right] = heading.html
              .split('</span>')
              .map((s) => s.replace(/<span>/g, ''))

            if (!right) {
              return `<tr class="${tocClass}"><td colspan="2"><a href="${path}">${left}</a></td></tr>`
            }
            return `<tr class="${tocClass}"><td>${left}</td><td><a href="${path}">${
              right ?? left
            }</a></td></tr>`
          })
          .join('\n') +
        `</table>`,
    }
  },
  gaines: (file, collected) => {
    return {
      ...file,
      html:
        `<h1><span>${
          file.headings?.[0].text ?? 'Table of Contents'
        }</span></h1>` +
        collected.toc.inline
          .map((heading) => {
            const level = heading.level
            const tocClass = `toc${level}`

            return `${'  '.repeat(
              heading.level
            )}<p class="${tocClass}"><a href="${Paths.relativePath(
              Paths.htmlPath,
              heading.filename
            )}">${heading.html}</a></p>`
          })
          .join('\n'),
    }
  },
}

export const resolveFactories =
  (config?: NormalizedConfig) => (collected: Collector) => {
    console.log(
      `
=== resolveFactories() ========================================
Need to fix:
  * chooses between 'toc' and 'toc2' classes based on whether
    the text begins with "chapter"
  -------------------------------------------------------------
  variant: ${config?.variant}
===============================================================
  `.trim()
    )
    //== only doing toc factory atm
    return {
      ...collected,
      files: collected.files.map((file) => {
        if (file._tag !== 'FACTORY') {
          return file
        }

        // console.log(`resolveFactories() :: ${file.landmark}`)

        return (tocFactory[config?.variant] || tocFactory['_default'])(
          file,
          collected
        )
      }),
    }
  }
