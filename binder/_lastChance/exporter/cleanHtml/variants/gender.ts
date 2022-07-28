import { flow, pipe } from 'fp-ts/lib/function'

import { CheerioFunc } from '../../index'

// const cleanSquareListItems: CheerioFunc = ($) => {
//   $('ul.square li').each(function () {
//     // $(this).children().first().html($(this).html().trimLeft().replace(/T /, ''))
//     $(this).text('FUCK IT!!')
//   })

//   return $
// }

const wrapUlSquare: CheerioFunc = ($) => {
  $('ul-square').each(function () {
    $(this)
      .find('p')
      .each(function () {
        $(this).replaceWith(
          `<li>${$(this).html().toString().replace(/T /, '')}</li>`
        )
      })

    $(this).replaceWith(`<ul class="square">${$(this).html()}</ul>`)
  })

  return $
}

export const gender: CheerioFunc = flow(wrapUlSquare)
