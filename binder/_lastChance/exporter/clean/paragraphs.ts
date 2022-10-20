import { CheerioAPI } from "cheerio"

import { load } from "../../lib/cheerio"

export function removeEmptyParagraphs($: CheerioAPI): CheerioAPI {
  $('p').each(function () {
    const trimmed = $(this).text().trim()
    if (
      $(this).children().length === 0 &&
      (!trimmed.length || trimmed === '/')
    ) {
      $(this).remove()
    }
  })

  return $
}
