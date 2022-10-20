import { Cheerio, Element } from 'cheerio'
import { flow, pipe } from 'fp-ts/lib/function'

import { CheerioFunc } from '../../../index'
import { figures } from './figures'
import { fixmes } from './fixmes'
import { headings } from './headings'
import { makeAcknowledgmentsTable } from './tables'

// const cleanSquareListItems: CheerioFunc = ($) => {
//   $('ul.square li').each(function () {
//     // $(this).children().first().html($(this).html().trimLeft().replace(/T /, ''))
//     $(this).text('FUCK IT!!')
//   })

//   return $
// }

const elevateHeadingParagraphs: CheerioFunc = ($) => {
  $('p.h2').each(function () {
    const children: Cheerio<Element> = $(this).children()
    $(this).replaceWith(`<h2>${children.html()}</h2>`)
  })

  return $
}

const wrapUlSquare: CheerioFunc = ($) => {
  $('ul-square').each(function () {
    $(this)
      .find('p')
      .each(function () {
        if ($(this).hasClass('keep-with-previous')) {
          $(this).removeClass('keep-with-previous')
          $(this).prev().append($(this))
        } else {
          $(this).replaceWith(
            `<li>${$(this).html().toString().replace(/T /, '')}</li>`
          )
        }
      })

    $(this).replaceWith(`<ul class="square">${$(this).html()}</ul>`)
  })

  return $
}

const ensureBoxCallout: CheerioFunc = ($) => {
  $('div.gender.box').each(function () {
    if ($(this).attr('class').split(' ').length === 2) {
      $(this).addClass('callout')
    }
  })

  return $
}

const cleanupBoxes: CheerioFunc = ($) => {
  /* clean up box start/end elements */
  $('div.box').each(function (i, el) {
    if ($(this).text().trim().toLowerCase() === 'start') {
      const selection = $(this).nextUntil('div.box')

      const wrapper = selection.wrapAll(
        $('<div>').addClass($(this).attr('class'))
      )

      $(this).remove()
      // $(wrapper)
      //   .find('.break')
      //   .each(function () {
      //     $(this).remove()
      //   })
    } else if ($(this).text().trim().toLowerCase() === 'end') {
      $(this).remove()
    }
  })

  return $
}

const removeBreaksBeforeAfterInsidePullquotes: CheerioFunc = ($) => {
  $(
    '.break + .pullquote, .pullquote + .break, h1 + .break, .pullquote > .break, .box > .break'
  ).each(function () {
    const el = $(this).hasClass('break') ? $(this) : $(this).prev()

    el.remove()
  })

  // $('p.break').remove()

  return $
}

export const gender: CheerioFunc = flow(
  fixmes,
  removeBreaksBeforeAfterInsidePullquotes,
  wrapUlSquare,
  cleanupBoxes,
  ensureBoxCallout,
  // elevateHeadingParagraphs,
  figures,
  makeAcknowledgmentsTable,
  headings
)
