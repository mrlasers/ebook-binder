import { CheerioAPI } from 'cheerio'

/**
 * Replaces fake heading tags (`H7–H10`) with a paragraph with class set to `Hn`
 * @param $ CheerioAPI
 * @returns CheerioAPI
 */
export function convertOversetHeadings($: CheerioAPI): CheerioAPI {
  $('h7,h8,h9,h10').each(function (i, el) {
    const newAttrs = $(this).attr()
    // const { id, ...attrs } = $(this).attr()

    // const newAttrs = !!id?.match(/^p/) ? { id, ...attrs } : attrs

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

export type ConsecutiveH1Options = {
  divClass?: string
  firstClass?: string
  secondClass?: string
}

export function wrapConsecutiveH1Headings(options?: ConsecutiveH1Options) {
  return ($: CheerioAPI): CheerioAPI => {
    $('h1 + h1').each(function () {
      const id = $(this).prev().attr('id')

      $(this)
        .prev()
        .removeAttr('id')
        .addClass(options?.firstClass || '')
      $(this).addClass(options?.secondClass || '')

      $(this)
        .prev()
        .add($(this))
        .wrapAll(`<div id="${id}"/>`)
        .parent()
        .addClass(options?.divClass || '')
    })

    return $
  }
}
