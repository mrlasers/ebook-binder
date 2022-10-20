import Cheerio, {
  BasicAcceptedElems,
  CheerioAPI,
  CheerioOptions,
  Document,
  Node,
} from "cheerio"

type CheerioToCheerio = (fn: CheerioAPI) => CheerioAPI

export function load(html: string | Buffer) {
  return Cheerio.load(html, { xmlMode: true, decodeEntities: false })
}

export function cheerioRunner(fn: CheerioToCheerio): (html: string) => string {
  return (html) => fn(load(html)).html()
}
