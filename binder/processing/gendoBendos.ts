import Path from 'path'
import { cheerio, CheerioAPI } from '../lib'
import beautify from 'js-beautify'
import { Extractor, FileItem } from '../types'
import {
  AcceptedElems,
  BasicAcceptedElems,
  Node,
  Element,
  Cheerio
} from 'cheerio'

export function markupQA($html: string | FileItem): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html)

  $('div.pullquote.qa p').each(function (i, el) {
    const html = $(this)
      .html()
      .replace(/^\s*([QA]) /g, (matched) => `<span>${matched}</span>`)
    $(this).html(html)
  })

  return { ...item, html: $.html() }
}
