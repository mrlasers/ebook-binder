import Cheerio, {
  BasicAcceptedElems,
  CheerioAPI,
  CheerioOptions,
  Document,
  Node,
} from "cheerio"
import { id } from "date-fns/locale"
import * as E from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import * as IO from "fp-ts/IO"
import * as O from "fp-ts/Option"
import beautify from "js-beautify"
import Path from "path"

// import { prettyPrint } from "../../process/processing"
import * as Paths from "../paths"
import { GeneratedOutput, Html } from "../types"
import { load } from "./"
import { removeClasses } from "./cleanHtml"

export type FinalCleanOptions = {
  imagePath: string
}

export function finalCleanHtml(html: string): string {
  const tags = ['p', 'div', 'figcaption'].join('|')
  return (
    html
      .replace(/^\s+/g, '')
      .replace(/\s+$/g, '')
      .replace(/<p><strong>\/<\/strong><\/p>/g, '')
      // removes em tag in "<em>.</em>" -- may need to expand this to other tags
      .replace(new RegExp(`<em>([.])+<\/em>`, 'g'), (_, chars) => chars)
      .replace(/<\/*(strong)[^>]*>\s*<\/*(strong)[^>]*>/g, ' ')
      .replace(/<\/*(sup)[^>]*>\s*<\/*(sup)[^>]*>/g, ' ')
      .replace(/<\/*(em)[^>]*>\s*<\/*(em)[^>]*>/g, ' ')
      .replace(/<\/*em[^>]*>\s*<\/*em[^>]*>/g, ' ')
      // trims space inside `tags` noted above
      .replace(new RegExp(`(<(${tags})[^>]*>)\\s+`, 'g'), (_, tag) => tag)
      .replace(new RegExp(`\\s+(<\/(${tags})>)`, 'g'), (_, tag) => tag)
      //:: forgot that this should go in somewhere else
      // .replace(/\s*<sup>\s*([0-9]+)\s*<\/sup>/g, (_, num) => {
      //   return `<sup><a id="fnref${num}" href="#fn2${num}" epub:type="noteref">${num}</a></sup>`
      // .replace(/<p><strong>\/<\/strong><\/p>/g, '')
      .replace(/\s+<sup>/g, '<sup>')
      .replace(/[\r\n]+/g, ' ')
  )
}

export function prettyPrint(html: string) {
  const cleanHtml = finalCleanHtml(html)

  return beautify.html(cleanHtml, {
    indent_size: 2,
    indent_body_inner_html: false,
    preserve_newlines: false,
    end_with_newline: true,
    extra_liners: [],
    wrap_line_length: 0,
  })
}

export function finalClean(html: Html, options?: FinalCleanOptions) {
  const $ = load(html)

  const tempAttributes = ['level', 'new', 'figure', 'table']

  const customDataToRemove = [
    'toc',
    'level',
    'navlevel',
    'navLevel',
    'nolandmark',
  ]

  $('[remove]').each(function () {
    $(this).remove()
  })

  tempAttributes.forEach((attr) => $(`*[${attr}]`).removeAttr(attr))

  $('*[href]').each(function () {
    const href = $(this).attr('href').trim().replace(' ', '%20')
    $(this).attr('href', href)
  })
  customDataToRemove.forEach((prop) => $(`*[${prop}]`).removeAttr(prop))
  $('del').contents().unwrap()
  $('ins').remove()
  removeClasses('gender')($)
  addImagePath(options?.imagePath ?? Paths.relativePathContentToImages)($)

  const $html = $.html().replace('’ ”', '’&#xa0;”').replace('“ ‘', '“&#xa0;‘')

  return prettyPrint($html)
}

export const addImagePath =
  (contentToImagePath: string) =>
  ($: CheerioAPI): CheerioAPI => {
    $('img').each(function () {
      $(this).attr(
        'src',
        Paths.joinPath(contentToImagePath, $(this).attr('src'))
      )
    })

    return $
  }
