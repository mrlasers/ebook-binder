import { CheerioAPI } from "cheerio"

import { load } from "../../lib/cheerio"

export const unwrapDocumentBody = ($: CheerioAPI): CheerioAPI => {
  const body = $('body').html()

  return body ? load(body) : $
}
