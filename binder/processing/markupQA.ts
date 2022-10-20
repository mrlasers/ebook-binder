import {
  AcceptedElems,
  BasicAcceptedElems,
  Cheerio,
  Element,
  Node,
} from "cheerio"
import beautify from "js-beautify"
import Path from "path"

import { cheerio, CheerioAPI } from "../lib"
import { Extractor, FileItem } from "../types"

export function markupQA($html: string | FileItem): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html)

  $('div.pullquote.qa p').each(function (i, el) {
    const html = $(this)
      .html()
      .replace(/^\s*([QA])(?=\s)/g, (matched) => `<span>${matched}</span>`)
    $(this).html(html)
  })

  return { ...item, html: $.html() }
}
