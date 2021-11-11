import Cheerio from 'cheerio'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { isNumber } from 'fp-ts/lib/number'
import * as O from 'fp-ts/Option'
import Path from 'path'

import { dirtyUnsafeMetadata } from '../_unsafeHacks'
import * as Paths from '../paths'
import { FileOutput, Heading, Image, Page, TextLink } from '../tasks'
import { Metadata } from '../types'
import { combineConsecutiveH1Headings } from './cleanHtml'
import { TocNode } from './navdocs/nesto'

export * from './cleanHtml'
export * from './finalize'
export * from './collector'
export * from './output'

export function load(html: string | Buffer) {
  return Cheerio.load(html, { xmlMode: true, decodeEntities: false })
  // return Cheerio.load(html, { xmlMode: true, decodeEntities: false })
}

export function idNodeToFilename(node: {
  id: string
  filename?: string
}): string {
  // undefined check cuz i fucked up and don't have time to fix now
  return typeof node.filename === 'undefined'
    ? ''
    : node.filename + (node.id ? `#${node.id}` : '')
}

// export type Metadata = {
//   pubId: string
//   title: string
//   author: string
//   publisher: string
// }

export type CollectorTOC = {
  filename: string
  level: number
  text: string
  html: string
  landmark?: string
}

export type Collector = {
  metadata: Metadata
  headings: Heading[]
  pages: Required<Page>[]
  files: FileOutput[]
  missingFootnotes: string[]
  images: Image[]
  toc?: {
    inline: CollectorTOC[]
    linear: CollectorTOC[]
    nested: TocNode[]
  }
  figures: TextLink[]
  tables: TextLink[]
}

export function getFiguresFromHtml(html: string): TextLink[] {
  return pipe(load(html), ($) => {
    return $('figure[figure]')
      .map(function (): TextLink {
        return {
          text: $(this).attr('figure'),
          filename: $(this).attr('id')
        }
      })
      .toArray()
  })
}

export function getHeadingsFromHtml(
  html: string,
  landmark?: string
): Heading[] {
  const $ = pipe(load(html), combineConsecutiveH1Headings)

  const headings = $('*[level]') // $('h1,h2,h3,h4,h5,h6,.h7,.h8,.h9,.h10')
    .map(function (i, el): Heading {
      if ($(this).attr('toc') === 'false') {
        // console.log(`skipping heading: ${$(this).text()}`)
        return null
      }
      $(this).find('img').remove()
      $(this).find('sup').remove()
      $(this).find('del').remove()
      $(this).find('ins').contents().unwrap()
      // $(this).find('span').contents().unwrap()
      // $(this)
      //   .find('ins')
      //   .each(function () {
      //     console.log('headHeadingsFromHtml():', $(this).text())
      //   })
      $(this).find('br').replaceWith(' ')
      const html = $(this).html().trim().replace(/\s+/g, ' ')

      if ($(this).attr('toc')) {
        console.log(
          `getHeadingsFromHTML() :: ${isNumber(Number($(this).attr('toc')))}`
        )
      }

      const level =
        $(this).attr('toc') && isNumber(Number($(this).attr('toc')))
          ? Number($(this).attr('toc'))
          : Number($(this).attr('level'))
      // $(this).find('ins').contents().unwrap()

      const navlevel =
        $(this).attr('navlevel') && isNumber(Number($(this).attr('navlevel')))
          ? Number($(this).attr('navlevel'))
          : Number($(this).attr('level'))

      // if (
      //   !!$(this)
      //     .text()
      //     .match(/Acknowledgments/)
      // ) {
      //   console.log(`~~~~~~~~~~~~~ ${!!$(this).attr('nolandmark')}`)
      // }

      const nextLandmark =
        landmark && i === 0 && !$(this).attr('nolandmark')
          ? landmark
          : undefined

      // if (
      //   !!$(this)
      //     .text()
      //     .match(/Acknowledgments/)
      // ) {
      //   console.log(`~~~~~~~~~~~~~ ${nextLandmark}`)
      // }

      // if (nextLandmark && !!nextLandmark.match(/bodymatter/)) {
      //   console.log(
      //     `=== getHeadingsFromHtml :: ${i} : ${nextLandmark} : ${nextLandmark}`
      //   )
      // }

      const result = {
        id: $(this).attr('id'),
        level: level, // Number($(this).attr('level')), //Number(el.name.slice(1)),
        navlevel: navlevel,
        text: $(this)
          .text()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/^.+?\|/, (str) => str.toUpperCase()),
        html: html,
        landmark: nextLandmark
        // .replace(/<\/*del>/g, '')
      }

      return result
    })
    .toArray()
    .filter(Boolean)

  return headings
}

export function getPagesFromHtml(html: string): Page[] {
  const $ = load(html)

  const pages = $('*[id^="p"]')
    .map(function (i, el) {
      return $(this).attr('id')
    })
    .toArray()
    .map((id) => {
      if (id === 'xx') {
        console.log('===getPagesFromHtml', id)
      }
      return {
        id,
        num: id.replace(/^p/, '')
      }
    })

  return pages
}

export function srcFilenameToImage(
  source: string,
  destinationPath: string = 'Images'
): Image {
  return {
    source: source, //Path.basename(source),
    destination: Paths.joinPath(
      destinationPath,
      Path.basename(source, Path.extname(source)) + '.jpg'
    )
  }
}

export function getImagesFromHtml(html: string): Image[] {
  const $ = load(html)

  return $('img')
    .map(function () {
      return srcFilenameToImage($(this).attr('src'))
    })
    .toArray()
}

export function getFootnotesFromHtml(html: string) {
  const $ = load(html)

  const footnotes = $('*[id^="fnref"]')
    .map(function () {
      return $(this).text()
    })
    .toArray()

  const expectedFootnotes = $('sup')
    .map(function () {
      return pipe($(this).text().trim()) //, (num) => (isNumber(num) ? num : null))
    })
    .toArray()
    .filter(Boolean)

  return footnotes.filter((fn) => !expectedFootnotes.includes(fn))
}

export function decorateFileOutput(file: FileOutput): FileOutput {
  let headings = [...file.headings, ...getHeadingsFromHtml(file.html)]

  if (!!file?.landmark?.match(/toc/)) {
    console.log(`decorateFileOutput() :: ${JSON.stringify(file)}`)
  }

  return {
    ...file,
    headings: file.headings, // [...file.headings, ...getHeadingsFromHtml(file.html)],
    pages: [...file.pages], //, ...getPagesFromHtml(file.html)],
    images: [...file.images, ...getImagesFromHtml(file.html)]
  }
}
