import { Cheerio, Element } from "cheerio"
import { flow, pipe } from "fp-ts/lib/function"

import { CheerioFunc } from "../../../index"

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
    const className = $(this).attr('class')
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

    // if (caption.match(/Figure 6\.1/)) {
    //   throw new Error(caption)
    // }

    const hack_caption = caption.match(/Figure 6\.1/)
      ? 'Figure 6.1. <em>The Great Wall of Vagina</em> by Jamie McCartney.'
      : null

    // if (hack_caption) {
    //   throw new Error(hack_caption)
    // }

    $(this).replaceWith(`
      <figure ${attr} ${className?.length ? `class="${className}"` : ''}>
        <div class="illus">${image}|${caption}</div>
        <figcaption>${hack_caption || caption}</figcaption>
      </figure>
    `)
  })

  return $
}

export const figures: CheerioFunc = flow(noop, makeFigure)
