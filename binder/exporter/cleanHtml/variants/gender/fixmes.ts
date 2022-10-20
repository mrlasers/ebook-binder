import { flow } from 'fp-ts/lib/function'

import { CheerioFunc } from '../../../index'

export const falseBreaksAfterHeadings: CheerioFunc = ($) => {
  $('h3 + .break, h4 + .break').remove()

  return $
}

export const justifyPullquoteSingleChild: CheerioFunc = ($) => {
  $('div.pullquote').each(function () {
    // $(this).html(`<h1>${$(this).children('p').length}</h1>` + $(this).html())
    if ($(this).children('p').length === 0) {
      $(this).addClass('justify')
    }
  })

  return $
}

export const fixmes = flow(
  falseBreaksAfterHeadings,
  justifyPullquoteSingleChild
)
