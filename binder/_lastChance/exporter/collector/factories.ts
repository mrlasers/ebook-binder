import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { toTitleCase } from '@artsy/to-title-case'

import {
    Collector,
    CollectorTOC,
    decorateFileOutput,
    getFootnotesFromHtml,
} from '../'
import { reduceFilterImages, sortImages } from '../..'
import * as Paths from '../../paths'
import { FileOutput, Heading, Image, Page } from '../../tasks'
import { Metadata } from '../../types'
import { reduceToNestedHeadings } from '../navdocs/nesto'

export const resolveFactories = (collected: Collector) => {
  //== only doing toc factory atm
  return {
    ...collected,
    files: collected.files.map((file) => {
      if (file._tag !== 'FACTORY') {
        return file
      }

      return {
        ...file,
        html:
          `<h1><span>Table of Contents</span></h1>` +
          collected.headings
            .filter((heading) => heading.toc)
            .map((heading) => {
              if (
                heading.text ===
                'Helpful Pointers for Dilation after vaginoplasty'
              ) {
                console.log(
                  `resolveFactories() :: ${heading.text} ${heading.level + 1} ${
                    heading.id
                  } ${heading.filename}`
                )
              }
              const level = heading.level + 1
              const tocClass =
                level === 2 && !heading.text.toLowerCase().match(/^chapter/)
                  ? `toc`
                  : `toc${level}`

              if (
                heading.text ===
                'If you were assigned female, learn about egg harvesting and cryopreservation'
              ) {
                console.log(`${heading.text}\n${toTitleCase(heading.text)}`)
              }

              return `${'  '.repeat(
                heading.level
              )}<p class="${tocClass}"><a href="${Paths.relativePath(
                Paths.htmlPath,
                heading.filename + (heading.id ? `#${heading.id}` : '')
              )}">${heading.html}</a></p>`
            })
            .join('\n')
      }
    })
  }
}
