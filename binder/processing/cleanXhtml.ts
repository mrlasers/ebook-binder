import {
  AcceptedElems,
  BasicAcceptedElems,
  Cheerio,
  Element,
  Node,
} from "cheerio"
import { pipe } from "fp-ts/function"
import { minify } from "html-minifier-terser"
import beautify from "js-beautify"
import Path from "path"

import { cheerio, CheerioAPI } from "../lib"
import { Extractor, FileItem } from "../types"

function RegexEscape(s: string) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
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

export function uglyPrint(html: string): string {
  return pipe(html, finalCleanHtml, minify)
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

export function replaceIllustrationPlaceholders(
  $html: string | FileItem
): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html as string)

  $('div.illus').each(function (i, el) {
    if ($(this).children().length) return

    const [file, alt] = $(this).text().split('|')

    const img = !file.trim().match(/\.(jpg|png)$/) ? `${file}.jpg` : file

    $(this).html(
      `<img src="../Images/${img.trim()}" alt="${alt ? alt.trim() : ''}"/>`
    )
  })

  return { ...item, html: $.html() }
}

export function mergePullquotes($html: string | FileItem): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html as string)

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
      .wrapAll('<p></p>')
    // .each(function () {
    //   $(this).wrap('<p></p>')
    // })
  })

  $('div.pullquote + div.pullquote')
    .not('.newFirst')
    .each(function (i, el) {
      $(this).prev().append($(this).contents())
      $(this).remove()
    })
  // $('div.pullquote + div.pullquote').each(function (i, el) {
  //   $(this).prev().append($(this).contents())
  //   $(this).remove()
  // })

  return { ...item, html: $.html() }
}

export function mergeLists($html: string | FileItem): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html as string)

  $('ul + ul').each(function (i, el) {
    $(this).prev().append($(this).contents())
    $(this).remove()
  })

  return {
    ...item,
    html: $.html(),
  }
}

export function wrapListItemContentInParagraph(
  $html: string | FileItem
): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html as string)

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
      .wrapAll('<p></p>')
    // .each(function () {
    //   $(this).wrap('<p></p>')
    // })
  })

  return { ...item, html: $.html() }
}

// common issue with VBA export
export function unwrapStrongHeading($html: FileItem | string): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html as string)

  $('h1,h2,h3,h4,h5,h6')
    .find('strong')
    .each(function (i, el) {
      $(this).contents().unwrap()
    })

  return {
    ...item,
    html: $.html(),
  }
}

export function removeEmptyParagraphs($html: FileItem | string): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html as string)

  $('p').each(function (i, el) {
    const $trimmed = $(this).text().trim()
    if (!$trimmed.length || $trimmed === '/') {
      $(this).remove()
    }
  })

  return {
    ...item,
    html: $.html(),
  }
}

export function replaceBreak($html: FileItem | string): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html as string)

  $('*.break').replaceWith(
    '<div class="break"><img src="../Images/break.jpg" alt=""/>'
  )
  return {
    ...item,
    html: $.html(),
  }
}

export function removeClasses(remove: string | string[]) {
  return ($html: FileItem | string): FileItem => {
    const item = typeof $html === 'string' ? { html: $html } : $html

    if (!item.html) {
      return item
    }

    const $ = cheerio.load(item.html)

    const toRemove = typeof remove === 'string' ? remove : remove.join(' ')
    // remove classes we don't want
    if (toRemove.length) {
      $('*').removeClass(toRemove)
    }

    // remove all empty classes
    $('[class]').each(function (i, el) {
      if (!$(this)?.attr('class')?.trim().length) {
        $(this).removeAttr('class')
      }
    })

    return {
      ...item,
      html: $.html(),
    }
  }
}
