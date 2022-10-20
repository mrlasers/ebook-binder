import { CheerioAPI } from 'cheerio'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { CheerioFunc, CheerioFuncString, CheerioFuncVoid, load } from '../../..'

export * from './toc'

export function cheerioFunc(
  f: CheerioFunc | CheerioFuncVoid | CheerioFuncString
) {
  return ($: CheerioAPI) => {
    const result = f($)

    return typeof result === 'string' ? load(result) : result || $
  }
}

export const subtitlePoems = cheerioFunc(($) => {
  $('h1').each(function addSubtitle() {
    const next = $(this).next()
    const first = next.children().first()

    // hack because it's easier to assign a heading in word than to clear a heading and add bold
    if (next.html() && next.prop('tagName').toLowerCase() === 'h6') {
      // if (next.text().trim() === 'Ignorance is a Primary Cause of Suffering')
      //   console.log(`@@@ fucking h6 ${next.text()}`)
      next.prop('tagName', 'p').addClass('subtitle')
      return addSubtitle.call(next)
    }

    if (
      (next.html() && next.prop('tagName').toLowerCase() === 'h6') ||
      (first.html() && first.prop('tagName').toLowerCase() === 'strong')
    ) {
      $(next).addClass('subtitle')
      $(first).contents().unwrap()
      // $(first)
      //   .children('strong')
      //   .each(function () {
      //     $(this).replaceWith($(this).html())
      //   })

      return addSubtitle.call(next)
    }
  })

  return $
})

export const removeCenterClass: CheerioFunc = ($) => {
  $('p.center').each(function () {
    $(this).removeClass('center')
  })

  return $
}

export const formatBiographyIds = (text: string) => {
  const hacks = {
    'victor-hugo': 'p584',
    'stephen-covey': 'p578',
    'william-e-gladstone': 'p582',
    'the-talmud': 'p598'
  }

  const hack_bail = ['a-course-in-miracles']

  const id = text
    .toLowerCase()
    // .trim()
    // .replace(/[“"“].+?[”"”]/g, '') // “Jimmy”
    .replace(/&amp;.+?$/, '')
    .replace(/[^a-z]/g, ' ')
    .trim()

    .split(/\s+/)
    .join('-')
    .replace(/^(us-)*senator-/, '')
    .replace(/^the-honorable-/, '')
    .replace(/^swami-/, '')
    .replace(/^sir-/, '')
    .replace(/^prayer-of-/, '')
    .replace(/^the-reverend-/, '')
    .replace(/^reverend-/, '')
    .replace(/^rabbi-/, '')
    .replace(/^general-/, '')
    .replace(/^dr-/, '')
    .replace(/^sathya-/, '')
    .replace(/-the-great$/, '')
    .replace(/-md$/, '')
  // .replace(/^the-/, '')

  if (!hack_bail.includes(id)) return hacks[id] || id
}

export const hyperlinkBiographyReference: CheerioFunc = ($) => {
  $('p.author').each(function () {
    const text = $(this).text().trim()
    if (!!text.match(/^—.+?—$/) && $(this).next().hasClass('author')) {
      const html = $(this).html().replace(/—/g, '').trim()

      pipe(
        O.fromNullable(formatBiographyIds(text)),
        O.map((id) =>
          $(this).html(`– <a href="biographies.xhtml#${id}">` + html + `</a> –`)
        )
      )

      // $(this).html(
      //   `– <a href="biographies.xhtml#${formatBiographyIds(text)}">` +
      //     html +
      //     `</a> –`,
      // )
    }
  })

  return $
}

export const removeBiographyReference: CheerioFunc = ($) => {
  $('p.author').each(function () {
    const text = $(this).text().trim()
    if (!!text.match(/^\(Bio.+?\)$/)) {
      $(this).remove()
    }
  })

  return $
}

export const addIdToBiographyTitles: CheerioFunc = ($) => {
  $('p.source').each(function () {
    if ($(this).attr('id')) {
      return
    }

    const text = formatBiographyIds(
      $(this)
        .text()
        .replace(/\(.+?\)/g, ' ')
        .replace(/\[.+?\]/g, ' ')
    )

    $(this).attr('id', text)
  })

  return $
}

export const insertNbsp: CheerioFunc = ($) => {
  const html = $.html().replace(/–\s+\)/g, `–&#xa0;)`)

  return $.load(html, { xmlMode: true, decodeEntities: false })
}

export const pushPageNumToHeading: CheerioFunc = ($) => {
  // this takes page number from first line of file and puts it in `id` of following element
  const first = $('*').first()
  const tagName = first.prop('name')
  const tag = first.prop('nodeName') as string
  const text = first.text().trim()

  if (!!text.match(/^\[(p(age)*[0-9ivxlc]+)\]$/)) {
    first.next().attr('id', `p${text.replace(/[^0-9ivxlc]/g, '')}`)

    first.remove()
  }

  if (!!text.match(/^\[.+?\]$/)) first.remove()

  return $
}

export const convertPageNumPlaceholder = ($) => {
  const html = $.html().replace(/\[(p[0-9ivxlc]+)\]/g, (match, page) => {
    return `<a id="${page}"/>`
  })

  return $.load(html, { xmlMode: true, decodeEntities: false })
}

export const replaceSpacesInIdentifiers: CheerioFunc = ($) => {
  $('*[id]').each(function () {
    // if (!$(this).hasClass('source')) return

    const id = $(this).attr('id').replace(/ /g, '-').toLowerCase()

    $(this).attr('id', id)
  })

  return $
}

export const replaceUnderscoreParagraphsWithHorizontalRule: CheerioFunc = (
  $
) => {
  // replace <p>________</p> with <hr/>
  $('p,div,h1').each(function () {
    if (!!$(this).text().trim().match(/_+?/)) {
      $(this).replaceWith('<hr/>')
    }
  })

  return $
}

export const combineEndingBr: CheerioFunc = ($) => {
  $('p br:last-child').each(function () {
    const parent = $(this).parent()
    const next = $(this).parent().next()

    const combineWithNext = !!parent.html().match(/<br *\/>[\s\r\n]*$/)

    if (!combineWithNext) return

    if (!next.attr('class') || parent.attr('class') === next.attr('class')) {
      parent.append(next.contents())
      next.remove()
    }
  })

  return $
}

export const articleCleanup: CheerioFunc = ($) => {
  // article cleanups
  $('article p, article h5').each(function () {
    $(this).attr('class', '')
  })

  $('article p em').each(function () {
    $(this).contents().unwrap()
  })

  return $
}

export const wrapLists: CheerioFunc = ($) => {
  return $
}

export const addSpacingToIndexByAuthor = cheerioFunc(($) => {
  $('p.index')
    .not('.byauthor')
    .each(function () {
      const firstLetter = $(this).text().slice(0, 1).toLowerCase()
      const prevFirstLetter = $(this).prev().text().slice(0, 1).toLowerCase()

      if (firstLetter !== prevFirstLetter) {
        $(this).addClass('segment')
      }
    })

  return $
})

export const addFixmeParasToFlowerDivs = cheerioFunc(($) => {
  $('ol,ul').each(function () {
    $(this).wrap('<div class="list-wrap">').wrap('<div>')
  })
})
;($) => {
  $('[data-original-name]').each(function () {
    $(this).append(
      `<p class="fixme">original: ${$(this).attr('data-original-name')}</p>`
    )
  })
  $('[data-raw-name]').each(function () {
    $(this).append(`<p class="fixme">raw: ${$(this).attr('data-raw-name')}</p>`)
  })

  return $
}

export const paradise: CheerioFunc = flow(
  flow(pushPageNumToHeading, subtitlePoems, removeCenterClass),
  flow(
    hyperlinkBiographyReference,
    removeBiographyReference,
    addIdToBiographyTitles
  ),
  flow(
    replaceSpacesInIdentifiers,
    replaceUnderscoreParagraphsWithHorizontalRule
  ),
  flow(convertPageNumPlaceholder, combineEndingBr, insertNbsp, articleCleanup),
  cheerioFunc(($) => {
    $('h1').each(function () {
      const text = $(this).text()
      if (text.toUpperCase() !== text) return

      $(this).prepend(`<span class="fixme">Title case:</span> `)
    })
  }),
  addSpacingToIndexByAuthor,
  cheerioFunc(($) => {
    // $('ul, ol, .with-list').each(function () {
    //   $(this).wrap('<div class="center-children"><div/></div>')
    // })

    $('ul,ol,.with-list')
      .nextAll('ul, ol, .with-list')
      .addBack()
      .wrapAll('<div class="center-children"><div/></div>')
      .removeClass('with-list')

    // $('div.center-children').each(function f() {
    //   $(this).nextAll('ul, ol, .with-list')
    // })
  }),
  cheerioFunc(($) => {
    // data-original-name="part5-image95" data-raw-name="part5-image95"
    return $.html().replace(
      /data-(original|raw)-name=\"part[0-9a]+-image[0-9a]+\"/g,
      ''
    )
  })
  // cheerioFunc(($) => {
  //   $('img').each(function () {
  //     if ($(this).attr('src') === 'image-115.jpg') {
  //       $(this).attr('src', 'image-8.jpg')
  //     }
  //   })
  // }),
  // debug stuff that we don't really need
  // flow(addFixmeParasToFlowerDivs),
)
