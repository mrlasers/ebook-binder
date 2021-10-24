import Cheerio, {
    BasicAcceptedElems,
    CheerioAPI,
    CheerioOptions,
    Document,
    Node
} from 'cheerio'
import * as A from 'fp-ts/Array'
import { flow, identity, pipe } from 'fp-ts/function'
import * as IO from 'fp-ts/IO'
import { isNumber } from 'fp-ts/lib/number'
import * as O from 'fp-ts/Option'
import Path from 'path'

import { Footnotes, HTML } from '../../types'

export type CleanHtmlOptions = {
  removeClasses: string | string[]
  footnotes: Footnotes
}

const cleanPlaceholders = flow(
  replaceIllustrationPlaceholders,
  replaceBreaks('break.jpg')
)

const cleanHeadings = flow(addHeadingIDs('r'), convertOversetHeadings)

const removeExtraStuff = flow(removeClasses('gender'), removeEmptyParagraphs)

export function cleanVBAHtml(footnotes: { [key: number]: string[] }) {
  return (html: HTML): IO.IO<string> => {
    return pipe(
      IO.of(load),
      IO.ap(IO.of(html)),
      IO.map(
        flow(
          unwrapDocumentBody,
          mergePullquotes,
          cleanPlaceholders,
          combineSiblingH1Headings(' | '),
          markupQA_GENDER,
          cleanHeadings,
          addFootnoteRefs(footnotes),
          removeExtraStuff
        )
      ),
      IO.map(($) => $.html()),
      IO.map(tightenUpTheGraphicsOnLevelSeven)
    )
  }
}

export function load(html: string | Buffer) {
  return Cheerio.load(html, { xmlMode: true, decodeEntities: false })
  // return Cheerio.load(html, { xmlMode: true, decodeEntities: false })
}

export function unwrapDocumentBody($: CheerioAPI): CheerioAPI {
  return load($('body').html())

  return $
}

export function mergePullquotes($: CheerioAPI): CheerioAPI {
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

export function replaceBreaks(imageFilename: string) {
  return ($: CheerioAPI): CheerioAPI => {
    $('*.break').replaceWith(
      `<div class="break"><img src="${imageFilename}" alt="break"/></div>`
    )

    return $
  }
}

export function replaceIllustrationPlaceholders($: CheerioAPI): CheerioAPI {
  $('div.illus').each(function () {
    if ($(this).children().length) return

    const [file, alt] = $(this)
      .text()
      .split('|')
      .map((t) => t.trim())

    const img = !file.trim().match(/\.(jpg|jpeg|png|gif)$/)
      ? `${file}.jpg`
      : file

    $(this).html(`<img src="${img}" alt="${alt || ''}"/>`)
  })
  return $
}

export function combineSiblingH1Headings(delimiter: string) {
  return ($: CheerioAPI): CheerioAPI => {
    $('h1 + h1').each(function () {
      if ($(this).hasClass('new')) return // bail early if we're not supposed to combine

      $(this)
        .prev()
        .append(delimiter + $(this).html())
      $(this).remove()
    })

    return $
  }
}

export function markupQA_GENDER($: CheerioAPI): CheerioAPI {
  $('div.pullquote.qa p').each(function () {
    $(this).html(
      $(this)
        .html()
        .replace(
          /^\s*([QA])\s+/g,
          (matched) => `<span>${matched.trim()}</span> `
        )
    )
  })

  return $
}

export function addHeadingIDs(prefix: string) {
  return ($: CheerioAPI): CheerioAPI => {
    const $prefix = !!prefix.match('p') ? 'heading' : prefix
    let nextHeadingNumbo = 1

    $('h1,h2,h3,h4,h5,h6,h7,h8,h9,h10').each(function (i, el) {
      const id = pipe(
        $(this).attr('id'),
        O.fromNullable,
        O.chain((id) => {
          return !!id.match(/^p([0-9]+|ivxmcIVXMC]+)$/) ? O.of(id) : O.none
        }),
        O.getOrElse(() => `${$prefix}${nextHeadingNumbo++}`)
      )

      $(this).attr('id', id)
    })

    return $
  }
}

export function convertOversetHeadings($: CheerioAPI): CheerioAPI {
  $('h7,h8,h9,h10').each(function (i, el) {
    const { id, ...attrs } = $(this).attr()

    const newAttrs = !!id?.match(/^p/) ? { id, ...attrs } : attrs

    const contents = $(this).contents()
    $(this)
      .wrapInner('<p>')
      .children()
      .unwrap()
      .attr(newAttrs)
      .addClass(el.name)
  })

  return $
}

export function removeClasses(classes: string | string[]) {
  return ($: CheerioAPI): CheerioAPI => {
    if (!classes.length) return $

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
}

export function removeEmptyParagraphs($: CheerioAPI): CheerioAPI {
  $('p').each(function () {
    const trimmed = $(this).text().trim()
    if (!trimmed.length || trimmed === '/') {
      $(this).remove()
    }
  })

  return $
}

export function addFootnoteRefs(footnotes: { [key: number]: string[] }) {
  return ($: CheerioAPI): CheerioAPI => {
    const fnBody = $('sup')
      .map(function () {
        return pipe(
          Number($(this).text().trim()),
          O.fromPredicate((n) => !isNaN(n) && !!footnotes[n]),
          O.map((fn) => ({
            fn,
            notes: footnotes[fn].map((f) => f.trim()).filter(Boolean)
          })),
          O.map(({ fn, notes }) => {
            $(this).html(
              `<a id="fnref${fn}" href="#fn${fn}" epub:type="noteref">${fn}</a>`
            )

            return `<tr id="fn${fn}"><td><a href="#fnref${23}">${fn}.</a></td><td>${notes.map(
              (note) => `<p>${note}</p>`
            )}</td></tr>`
          }),
          O.getOrElse(() => '')
        )
      })
      .toArray()
      .filter(Boolean)
      .join('')

    const html =
      $.html() +
      `<aside epub:type="footnote"><table class="footnotes"><tbody>${fnBody}</tbody></table></aside>`

    return load(html)
  }
}

export function tightenUpTheGraphicsOnLevelSeven(html: string) {
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
      // .replace(new RegExp(`(<(${tags})[^>]*>)\\s+`, 'g'), (_, tag) => tag)
      // .replace(new RegExp(`\\s+(<\/(${tags})>)`, 'g'), (_, tag) => tag)
      //:: forgot that this should go in somewhere else
      // .replace(/\s*<sup>\s*([0-9]+)\s*<\/sup>/g, (_, num) => {
      //   return `<sup><a id="fnref${num}" href="#fn2${num}" epub:type="noteref">${num}</a></sup>`
      // .replace(/<p><strong>\/<\/strong><\/p>/g, '')
      .replace(/\s+<sup>/g, '<sup>')
      .replace(/[\r\n]+/g, ' ')
  )
}
