import { flow, pipe } from 'fp-ts/lib/function'

import { CheerioFunc } from '../../../index'

const isEven = (x) => x % 2 === 0

export const makeAcknowledgmentsTable: CheerioFunc = ($) => {
  $('makeAcknowledgments').each(function () {
    const tableHtml = $(this)
      .children('p')
      .map(function (idx) {
        return pipe(`<td>${$(this).html().trim()}</td>`, (html) =>
          isEven(idx) ? '<tr>' + html : html + '</tr>'
        )
      })
      .get()
      // .reduce(
      //   (acc, val, idx) =>
      //     isEven(idx) ? acc + val + '</tr>' : acc + '<tr>' + val,
      //   ''
      // )
      .join('')

    $(this).replaceWith(`<table class="list-of loose">${tableHtml}</table>`)
  })

  return $
}
