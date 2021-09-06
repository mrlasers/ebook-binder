import {
  mergeLists,
  unwrapStrongHeading,
  removeEmptyParagraphs,
  replaceBreak,
  removeClasses,
  wrapListItemContentInParagraph,
  replaceIllustrationPlaceholders,
  mergePullquotes
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
      addAndExtractHeadings,
      removeClasses('gender'),
      markupQA,
      addAndExtractFootnoteRefs(options.footnotes),
      addDocumentWrap(options)
    )
  }
}
