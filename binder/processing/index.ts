import {
  mergeLists,
  unwrapStrongHeading,
  removeEmptyParagraphs,
  replaceBreak,
  removeClasses,
  wrapListItemContentInParagraph,
  replaceIllustrationPlaceholders
} from './cleanXhtml'
import {
  addAndExtractHeadings,
  addAndExtractFootnoteRefs,
  addDocumentWrap
} from './extractXhtml'
import { Cheerio } from '../lib'
import { pipe, flow } from 'fp-ts/function'
import { FileItem, FootnoteItems } from '../types'
// import Cheerio from 'cheerio'

export { prettyPrint } from './cleanXhtml'

export type ProcessOptions = {
  title?: string
  footnotes?: FootnoteItems
}

export function processHtml(options?: ProcessOptions) {
  return (html: string): FileItem => {
    // const $ = Cheerio.load(html)

    // const xhtml = $('body').html() || html

    return pipe(
      Cheerio.load(html)('body').html() || html,
      replaceIllustrationPlaceholders,
      replaceBreak,
      wrapListItemContentInParagraph,
      removeEmptyParagraphs,
      unwrapStrongHeading,
      mergeLists,
      addAndExtractHeadings,
      addAndExtractFootnoteRefs(options.footnotes),
      removeClasses('gender'),
      addDocumentWrap()
    )
  }
}
