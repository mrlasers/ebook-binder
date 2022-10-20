import { CheerioAPI } from "cheerio"

export function mergeSameConsecutiveLink($: CheerioAPI): CheerioAPI {
  $('a').each(function () {
    const next = $(this).next('a')
    if ($(this).attr('href') === $(next).attr('href')) {
      const thisHtml = $(this).html() ?? ''
      const nextHtml = $(next).html() ?? ''

      $(this).html(thisHtml.trim() + nextHtml.trim())
      $(next).remove()
    }
  })

  return $
}
