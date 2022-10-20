import { flow, pipe } from 'fp-ts/lib/function'

import { CheerioFunc } from '../../../index'

export const frontmatterHeadings1: CheerioFunc = ($) => {
  $('h1 > span').each(function () {
    $(this).parent().addClass('frontmatter')
  })

  return $
}

export const headings = flow(frontmatterHeadings1)
