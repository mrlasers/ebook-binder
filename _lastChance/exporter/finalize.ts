import Cheerio, {
  BasicAcceptedElems,
  CheerioAPI,
  CheerioOptions,
  Document,
  Node,
} from "cheerio"
import { id } from "date-fns/locale"
import * as E from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import * as IO from "fp-ts/IO"
import * as O from "fp-ts/Option"
import Path from "path"

import { prettyPrint } from "../../binder/processing"
import * as Paths from "../paths"
import { GeneratedOutput, Html } from "../types"
import { load } from "./"
import { removeClasses } from "./cleanHtml"

export type FinalCleanOptions = {
  imagePath: string
}

export function finalClean(html: Html, options?: FinalCleanOptions) {
  const $ = load(html)

  const tempAttributes = ['level', 'new', 'figure', 'table']

  const customDataToRemove = [
    'toc',
    'level',
    'navlevel',
    'navLevel',
    'nolandmark',
  ]

  $('[remove]').each(function () {
    $(this).remove()
  })

  tempAttributes.forEach((attr) => $(`*[${attr}]`).removeAttr(attr))

  $('*[href]').each(function () {
    const href = $(this).attr('href').trim().replace(' ', '%20')
    $(this).attr('href', href)
  })
  customDataToRemove.forEach((prop) => $(`*[${prop}]`).removeAttr(prop))
  $('del').contents().unwrap()
  $('ins').remove()
  removeClasses('gender')($)
  addImagePath(options?.imagePath ?? Paths.relativePathContentToImages)($)

  const $html = $.html().replace('’ ”', '’&#xa0;”').replace('“ ‘', '“&#xa0;‘')

  return prettyPrint($html)
}

export const addImagePath =
  (contentToImagePath: string) =>
  ($: CheerioAPI): CheerioAPI => {
    $('img').each(function () {
      $(this).attr(
        'src',
        Paths.joinPath(contentToImagePath, $(this).attr('src'))
      )
    })

    return $
  }
