import {
  mergeLists,
  unwrapStrongHeading,
  removeEmptyParagraphs,
  replaceBreak,
  removeClasses,
  wrapListItemContentInParagraph,
  replaceIllustrationPlaceholders,
  mergePullquotes,
  prettyPrint
} from './cleanXhtml'
import {
  addAndExtractHeadings,
  addAndExtractFootnoteRefs,
  addDocumentWrap
} from './extractXhtml'
import { markupQA } from './gendoBendos'

import { cheerio } from '../lib'
import { pipe, flow } from 'fp-ts/function'
import { FileItem, FootnoteItems } from '../types'
// import Cheerio from 'cheerio'

export { prettyPrint } from './cleanXhtml'

export type ProcessOptions = {
  title?: string
  footnotes?: FootnoteItems
  pretty?: boolean
  bodyClass?: string
}

export function processHtml(options?: ProcessOptions) {
  return (html: string): FileItem => {
    // const $ = Cheerio.load(html)

    // const xhtml = $('body').html() || html

    return pipe(
      cheerio.load(html)('body').html() || html,
      mergePullquotes,
      replaceIllustrationPlaceholders,
      replaceBreak,
      wrapListItemContentInParagraph,
      removeEmptyParagraphs,
      unwrapStrongHeading,
      mergeLists,
      addAndExtractHeadings, // split adding ids and extracting
      removeClasses('gender'),
      markupQA,
      addAndExtractFootnoteRefs(options?.footnotes), // split these

      addDocumentWrap(options)
    )
  }
}

type anythingWithHtml = {
  html: string
  [key: string]: any
}

export function processHtmlHACK(options?: ProcessOptions) {
  return (item: anythingWithHtml): any => {
    // const $ = Cheerio.load(html)

    // const xhtml = $('body').html() || html

    // console.log(item)

    return pipe(
      cheerio.load(item.html)('body').html() || item.html,
      mergePullquotes,
      replaceIllustrationPlaceholders,
      replaceBreak,
      wrapListItemContentInParagraph,
      removeEmptyParagraphs,
      unwrapStrongHeading,
      mergeLists,
      addAndExtractHeadings,
      removeClasses('gender'),
      markupQA,
      addAndExtractFootnoteRefs(options?.footnotes),
      addDocumentWrap(options),
      (item) => {
        return !options.pretty
          ? item
          : { ...item, html: prettyPrint(item.html) }
      },
      (html) => {
        // const $html = html?.html || html
        return {
          ...item,
          ...html
        }
      }
    )
  }
}
