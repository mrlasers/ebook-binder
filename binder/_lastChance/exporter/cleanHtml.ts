import Cheerio, {
  BasicAcceptedElems,
  CheerioAPI,
  CheerioOptions,
  Document,
  Node,
} from "cheerio"
import { id } from "date-fns/locale"
import { join } from "fp-ts-std/Array"
import * as A from "fp-ts/Array"
import * as E from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import * as IO from "fp-ts/IO"
import * as O from "fp-ts/Option"
import Path from "path"

import { stripExt } from "../../__lastChangeREFACTOR/helpers"
import { prettyPrint } from "../../processing"
// const getIO
import { load } from "../lib/cheerio"
import * as Paths from "../paths"
import { FileOutput, StylesOutput } from "../tasks"
import { GeneratedOutput, HTML } from "../types"
import {
  addFootnoteRefs,
  convertOversetHeadings,
  wrapConsecutiveH1Headings,
} from "./clean"
import { unwrapDocumentBody } from "./clean/body"
import { mergeSameConsecutiveLink } from "./clean/links"
import { removeEmptyParagraphs } from "./clean/paragraphs"
import * as variantCleaners from "./cleanHtml/variants"

const loadIO = (html: string) => IO.of(load(html))
const selectIO =
  (
    selector?: BasicAcceptedElems<Node>,
    context?: BasicAcceptedElems<Node>,
    root?: BasicAcceptedElems<Document>,
    options?: CheerioOptions
  ) =>
  ($: CheerioAPI) =>
    IO.of($(selector, context, root, options))

export type CheerioFunc = ($: CheerioAPI) => CheerioAPI

const blockTags =
  'figure,h1,h2,h3,h4,h5,h6,h7,h8,h9,h10,p,div,ul,ol,table'.split(',')

const mergePullquotes: CheerioFunc = ($) => {
  $('div.pullquote').each(function () {
    $(this)
      .contents()
      .filter(function (i, el) {
        switch (el.type) {
          default:
            return !blockTags.includes($(this).prop('name'))
          case 'text':
            return true
          case 'comment':
            return false
        }
      })
      .wrapAll('<p>')
  })

  $('div.pullquote + div.pullquote')
    .not('.newFirst')
    .each(function () {
      $(this).prev().append($(this).contents())
      $(this).remove()
    })

  return $
}

const replaceIllustrationPlaceholders =
  (imgPath: string): CheerioFunc =>
  ($) => {
    $('div.illus').each(function () {
      if ($(this).children().length) return

      const [file, alt] = $(this).text().split('|')

      if (file.trim() === '/') {
        console.log(
          `replaceIllustrationPlaceholders() :: ignoring empty image placeholders, but should really do better with this`
        )
        $(this).addClass('fixme')
        $(this).text(`IMAGE PLACEHOLDER WAS NOT PROCESSED BECAUSE OOPS`)

        return
      }

      const img = !file.trim().match(/\.(jpg|jpeg|png|gif)$/)
        ? `${file}.jpg`
        : file
      // const img = `${file.replace(/\.png$/, '')}.jpg`

      const parent = pipe(
        O.fromNullable($(this).parent().get()[0]),
        O.map((el) => {
          return el.tagName
        }),
        O.map((name) => {
          if (name === 'figure') {
            $(this).removeClass('illus')
          }
        })
      )

      const caption = pipe(
        O.fromNullable($(this).next('caption').get()[0]),
        O.map((cap) => {
          const result = `<p>${$(cap).text().trim()}</p>`
          $(cap).remove()
          return result
        }),
        O.getOrElse(() => '')
      )

      $(this).html(
        `<img src="${pathJoin(imgPath, img.trim())}" alt="${
          alt ? alt.replace(/\s+/g, ' ').trim() : ''
        }"/>` + caption
      )
    })

    return $
  }

const replaceBreak =
  (imgPath: string): CheerioFunc =>
  ($) => {
    $('.break').replaceWith(
      `<div class="break"><img src="${pathJoin(
        imgPath,
        'break.jpg'
      )}" alt="break"/></div>`
    )

    return $
  }

const wrapListContent =
  (wrapper: string): CheerioFunc =>
  ($) => {
    $('li').each(function () {
      $(this)
        .contents()
        .filter(function (i, el) {
          switch (el.type) {
            default:
              return !blockTags.includes($(this).prop('name'))
            case 'text':
              return true
            case 'comment':
              return false
          }
        })
        .wrapAll(wrapper)
    })

    return $
  }

const unwrapStrongHeading: CheerioFunc = ($) => {
  $('h1,h2,h3,h4,h5,h6')
    .find('strong')
    .each(function () {
      $(this).contents().unwrap()
    })

  return $
}

const mergeLists: CheerioFunc = ($) => {
  $('ul + ul').each(function (i, el) {
    $(this).prev().append($(this).contents())
    $(this).remove()
  })

  return $
}

const addHeadingIDs: CheerioFunc = ($) => {
  let nextHeadingNumbo = 1

  $('h1,h2,h3,h4,h5,h6,h7,h8').each(function (i, el) {
    const hasNewAttr = !!$(this).attr('new')

    const isSecondConsecutiveHeading = pipe(
      O.fromNullable($(this).prev().get()[0]),
      O.map((el) => el.tagName),
      O.map((name) => name === el.tagName),
      O.getOrElse(() => false)
    )

    if (isSecondConsecutiveHeading === true && !hasNewAttr) {
      $(this).removeAttr('id')
      return
    }

    const id = pipe(
      $(this).attr('id'),
      O.fromNullable,
      O.chain((id) => {
        return !!id.match(/^(p([0-9]+|[ivxmcIVXMC]+)|x-[A-z0-9\-_]+)$/)
          ? O.of(id.replace(/^x-/, 'x-'))
          : O.none
      }),
      O.getOrElse(() => `r${nextHeadingNumbo++}`)
    )

    $(this).attr({ id, level: el.name.slice(1) })
  })

  // 2021-10-22 :: cleans up headings >8 and non-headings for x- ids
  $('*[id^=x-]').each(function (i, el) {
    const id = $(this).attr('id').replace(/^x-/, '')
    $(this).attr('id', id)
  })

  return $
}

export const removeClasses =
  (classes: string | string[]): CheerioFunc =>
  ($) => {
    if (!classes) return $

    $('*').removeClass(
      typeof classes === 'string' ? classes : classes.join(' ')
    )
    $('[class]').each(function () {
      if (!$(this)?.attr('class')?.trim().length) {
        $(this).removeAttr('class')
      }
    })

    return $
  }

const getCheerioHtml = ($: CheerioAPI): string => $.html()

function pathJoin(...paths: string[]): string {
  return Path.join(...paths).replace(/\\/g, '/')
}

const cleanLists = flow(wrapListContent('<p></p>'), mergeLists)

const cleanPlaceholders = (imgPath: string) =>
  flow(replaceIllustrationPlaceholders(imgPath), replaceBreak(imgPath))

const markupQA: CheerioFunc = ($) => {
  $('div.qa > p, p.qa').each(function () {
    const thisText = $(this).text().trim()
    const thisHtml = $(this).html().trim()

    // if (!!thisHtml.match(/^\s*([Q])(?=\s)/)) {
    //   $(this).addClass('em0')
    // }

    // if (!!thisHtml.match(/^\s*([A])(?=\s)/)) {
    //   $(this).addClass('top0')
    // }

    const qOrA = $(this).text().trim()[0]?.toLowerCase()

    if (qOrA === 'q' || qOrA === 'a') {
      $(this).addClass(qOrA)
    }

    $(this).html(
      thisHtml.replace(
        /^\s*([QA])(?=\s)/g,
        (matched) => `<span>${matched}</span>`
      )
    )
  })

  return $
}

type ProcessOptions = {
  title?: string
  footnotes?: any[]
  pretty?: boolean
  bodyClass?: string
}

export function addDocumentWrapHtml(styles: StylesOutput[]) {
  return (file: FileOutput): HTML => {
    return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en-US">
<head>
<meta http-equiv="default-style" content="text/html;charset=utf-8"/>
<title>${
      file?.headings?.[0]?.text.replace(/<.+?>/g, '') || stripExt(file.filename)
    }</title>
${pipe(
  styles,
  A.map(
    (output) =>
      `<link rel="stylesheet" type="text/css" href="${Paths.relativePath(
        Path.dirname(file.filename),
        output.filename
      )}"/>`
  ),
  join('\n')
)}
</head>
<body>
${file.html}
</body>
</html>
  `.trim()

    // return { ...file, html }
  }
}

export const addDocumentWrap =
  (options?: { title?: string; bodyClass?: string }): CheerioFunc =>
  ($) => {
    const html = `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
    <meta http-equiv="default-style" content="text/html;charset=utf-8"/>
    <title>${options?.title || 'Oops, no title'}</title>
    <link rel="stylesheet" type="text/css" href="../Styles/styles.css"/>
    </head>
    <body${options?.bodyClass ? ` class="${options?.bodyClass}"` : ''}>
    ${$.html()}
    </body>
    </html>
     `

    return load(html)
  }

const tightenUpTheGraphicsOnLevelSeven = (html: string) =>
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
    // .replace(new RegExp(`(<(${tags})[^>]*>)\\s+`, 'g'), (_, tag) => tag)
    // .replace(new RegExp(`\\s+(<\/(${tags})>)`, 'g'), (_, tag) => tag)
    //:: forgot that this should go in somewhere else
    // .replace(/\s*<sup>\s*([0-9]+)\s*<\/sup>/g, (_, num) => {
    //   return `<sup><a id="fnref${num}" href="#fn2${num}" epub:type="noteref">${num}</a></sup>`
    // .replace(/<p><strong>\/<\/strong><\/p>/g, '')
    .replace(/\s+<sup>/g, '<sup>')
    .replace(/[\r\n]+/g, ' ')

export type CleanHtmlOptions = {
  pretty?: boolean
  imageRelPath?: string
  removeClasses?: string | string[]
  footnotes?: { [key: number]: string[] }
}

export function combineConsecutiveH1Headings($: CheerioAPI): CheerioAPI {
  $('h1 + h1').each(function (el) {
    if ($(this).hasClass('new')) return

    $(this).prev().text($(this).prev().text().toUpperCase())
    $(this)
      .prev()
      .append(' | ' + $(this).html())
    $(this).remove()
  })

  return $
}

export function cleanHtml(
  html: string,
  options?: CleanHtmlOptions
): IO.IO<string> {
  return pipe(
    IO.of(load),
    IO.ap(IO.of(html)),
    IO.map(
      flow(
        flow(
          unwrapDocumentBody,
          flow(
            /* variants go here */

            variantCleaners.gender
          ),
          mergeSameConsecutiveLink,
          ($) => {
            /* remove all ids that aren't for pages */
            $('*[id^="r"]').removeAttr('id')

            return $
          }
        ),
        cleanPlaceholders(options?.imageRelPath ?? ''),
        flow(unwrapStrongHeading, cleanLists),
        mergePullquotes,
        flow(markupQA, removeClasses(options?.removeClasses)),
        flow(
          addHeadingIDs,
          convertOversetHeadings,
          wrapConsecutiveH1Headings({
            divClass: 'chapter',
            secondClass: 'title',
          })
        ),
        flow(addFootnoteRefs(options?.footnotes), removeEmptyParagraphs)
      )
    ),
    IO.map(getCheerioHtml)
  )
}
