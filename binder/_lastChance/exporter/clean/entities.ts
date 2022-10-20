import { CheerioAPI } from "cheerio"

import { load } from "../../lib/cheerio"

export const conformHtmlEntities = ($: CheerioAPI): CheerioAPI => {
  const html = $.html().replace('&nbsp;', '&#xa0;')

  return $.load(html)
}
