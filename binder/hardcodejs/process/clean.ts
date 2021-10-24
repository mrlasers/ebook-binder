import Path from 'path'
import Cheerio, {
  CheerioOptions,
  BasicAcceptedElems,
  Node,
  Document,
  CheerioAPI
} from 'cheerio'
import { pipe, flow } from 'fp-ts/function'
import * as IO from 'fp-ts/IO'
import * as O from 'fp-ts/Option'

import {
  addAndExtractHeadings,
  addAndExtractFootnoteRefs
  // addDocumentWrap
} from '../../processing/extractXhtml'
import { prettyPrint } from '../../processing'

// const getIO

export function load(html: string | Buffer) {
  return Cheerio.load(html, { xmlMode: true, decodeEntities: false })
  // return Cheerio.load(html, { xmlMode: true, decodeEntities: false })
}

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

// export function cleanHtml(html: string | Buffer) {
//   return pipe(load(html)('body').html() || html, loadIO)
// }

const getIO = (selection) => IO.of(selection.get())

export type CheerioFunc = ($: CheerioAPI) => CheerioAPI

const mergePullquotes: CheerioFunc = ($) => {
  $('div.pullquote').each(function () {
    $(this)
      .contents()
      .filter(function (i, el) {
        switch (el.type) {
          default:
            return !['p', 'div', 'ul', 'table'].includes($(this).prop('name'))
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

      const img = !file.trim().match(/\.(jpg|jpeg|png|gif)$/)
        ? `${file}.jpg`
        : file

      $(this).html(
        `<img src="${pathJoin(imgPath, img.trim())}" alt="${
          alt ? alt.trim() : ''
        }"/>`
      )
    })

    return $
  }

const replaceBreak =
  (imgPath: string): CheerioFunc =>
  ($) => {
    $('*.break').replaceWith(
      `<div class="break"><img src="${pathJoin(
        imgPath,
        'break.jpg'
      )}" alt=""/></div>`
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
              return !['p', 'div', 'ul', 'table', 'figure'].includes(
                $(this).prop('name')
              )
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

const removeEmptyParagraphs: CheerioFunc = ($) => {
  $('p').each(function () {
    const trimmed = $(this).text().trim()
    if (!trimmed.length || trimmed === '/') {
      $(this).remove()
    }
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
  let nextHeadingNumber = 1

  $('h1,h2,h3,h4,h5,h6').each(function (i, el) {
    const id = pipe(
      $(this).attr('id'),
      O.fromNullable,
      O.chain((id) =>
        O.fromNullable(!!id.match(/^p([0-9]+|ivxmcIVXMC]+)/) && id)
      ),
      O.getOrElse(() => `r${nextHeadingNumber++}`)
    )

    $(this).attr('id', id)
  })

  return $
}

const removeClasses =
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

const addFootnoteRefs =
  (footnotes?: { [key: number]: string[] }): CheerioFunc =>
  ($) => {
    if (footnotes) {
      const aside = $('sup')
        .map(function () {
          return pipe(
            Number($(this).text()),
            O.fromPredicate((n) => !isNaN(n)),
            O.chain(O.fromPredicate((n) => !!footnotes[n])),
            O.map((n) => {
              $(this).html(
                `<a id="fnref${n}" href="#fn${n}" epub:type="noteref">${n}</a>`
              )

              return n
            }),
            O.map(
              (n) =>
                `<tr><td><a href="#fnref${n}">${n}.</a></td><td><div id="#fn${n}">${footnotes[
                  n
                ]
                  .filter((t) => !!t.trim())
                  .map((text) => `<p>${text}</p>`)
                  .join('')}</div></td></tr>`
            ),
            O.map(
              (fns) =>
                `<aside epub:type="footnote"><table class="footnotes"><tbody>${fns}</tbody></table>`
            ),
            // O.map((fns) => $.html() + fns)
            O.getOrElse(() => '')
          )
        })
        .toArray()
        .join('')

      const html = $.html() + '\n\n' + aside
      return load(html)
      // $.html(html + aside)
      console.log('='.repeat(60))
      console.log(aside)
      console.log('='.repeat(60))

      // $.html($.html() + aside)
    }

    return $
  }

const markupQA: CheerioFunc = ($) => {
  $('div.pullquote.qa p').each(function () {
    $(this).html(
      $(this)
        .html()
        .replace(/^\s*([QA])(?=\s)/g, (matched) => `<span>${matched}</span>`)
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

const addDocumentWrap =
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

export type CleanHtmlOptions = {
  pretty?: boolean
  imageRelPath?: string
  removeClasses?: string | string[]
  footnotes?: { [key: number]: string[] }
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
        mergePullquotes,
        cleanPlaceholders(options?.imageRelPath ?? ''),
        unwrapStrongHeading,
        cleanLists,
        markupQA,
        flow(addHeadingIDs, removeClasses(options?.removeClasses)),
        addFootnoteRefs(options?.footnotes),
        removeEmptyParagraphs,
        addDocumentWrap()
      )
    ),
    IO.map(getCheerioHtml),
    IO.map((html) => (options?.pretty ? prettyPrint(html) : html))
  )
}

const html = `<h1 class="gendo bendo">Hello, <strong>World</strong>!</h1><h2 id="p23">Page 23</h2><div class="pullquote">Hello, World!</div><div class="pullquote">The End  <sup>  1  </sup> </div>

<div class="illus">   Hello.jpg |   Hello, World!   </div>
  
  <div class="pullquote qa"><p>Q Do you think sex is just a synonym for gender?</p><p>A Yes, yes I am that much of a retard</p></div>
  
  <div class="break"/><ul><li>Hello</li><li>World<sup>2</sup></li></ul><p><strong>/</strong></p><p>The. End.</p><ul><li>Hello, World!</li></ul><ul><li>The end.</li></ul>`

// const result = cleanHtml(html, {
//   pretty: true,
//   imageRelPath: '../Images',
//   removeClasses: 'gendo bendo'
// })

// console.log(result())
