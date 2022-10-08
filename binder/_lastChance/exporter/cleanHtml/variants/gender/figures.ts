import { Cheerio, Element } from 'cheerio'
import { flow, pipe } from 'fp-ts/lib/function'

import { CheerioFunc } from '../../../index'

const noop: CheerioFunc = ($) => $

const convertFigurePlaceholder: CheerioFunc = ($) => {
  $('figure').each(function () {
    if ($(this).attr('figure')) {
      const [img_name, caption_text] = $(this)
        .text()
        .split('|')
        .map((text) => text.trim())

      const img = `<div class="illus"><img src="${img_name}" alt="${caption_text}" /></div>`
      const caption = `<figcaption>${caption_text}</figcaption>`

      $(this).html(img + caption)
    }
  })

  return $
}

const makeFigure: CheerioFunc = ($) => {
  /*

    <makeFigure>
      { "attributes": {
        "figure": "Figure 2.6. Vaginoplasty 1 of 4"
      },
      "image": "Figure116",
      "caption": "Figure 2.6. Vaginoplasty 1 of 4 The starting point." }
    </makeFigure>


  */
  $('makeFigure').each(function () {
    const json = $(this)
      .text()
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    // .replace(/(?<=[:{])\s+/g, '')
    // .replace(/\s+(?=[:{])/g, '')

    $(this).html(`
      <p>${'|' + json + '|'}</p>
      <p>${JSON.stringify({ attributes: ['hi'] })}</p>
    `)

    const { attributes, image, caption } = JSON.parse(json)

    const attr = Object.keys(attributes).reduce((acc, key) => {
      return acc + `${key}="${attributes[key]}"`
    }, '')

    $(this).replaceWith(`
      <figure ${attr}>
        <div class="illus">${image}|${caption}</div>
        <figcaption>${caption}</figcaption>
      </figure>
    `)
  })

  return $
}

export const figures: CheerioFunc = flow(noop, makeFigure)
