import { pipe } from 'fp-ts/function'
import { isNumber } from 'fp-ts/lib/number'
import { isString } from 'fp-ts/lib/string'
import * as TE from 'fp-ts/TaskEither'
import Fs from 'fs/promises'
import { nanoid } from 'nanoid'
import Path from 'path'

import { MyError } from '../../hardcodejs/errors'
import { srcFilenameToImage } from '../exporter'
import * as Paths from '../paths'
import { InputImage } from '../types'
import { basename, FileOutput, isImageFilename } from './'

export type InputType = {
  filename: string
  caption?: string
  page?: string | number
  landmark?: string
}

export function isInput(value: any): value is InputType {
  const image = value as InputType

  if (
    typeof image.filename !== 'string' ||
    !image.filename.length ||
    !isImageFilename(image.filename)
  )
    return false
  if (typeof image.caption !== 'string') return false
  if (image.page && !(isNumber(image.page) || isString(image.page)))
    return false
  if (!image.landmark || isString(image.landmark)) return true

  return true
}

export const fullpageImageHtml = (filename: string, alt: string) =>
  `<div class="cover"><p class="cover"><img id="cover" src="${filename}" alt="${
    alt || ''
  }"/></p></div>`

// not using this because captions are included in image now
export const _fullpageImageHtmlCaption = (filename: string, caption: string) =>
  `<div class="cover-caption">
      <div><img id="cover" src="${filename}" alt="${caption}"/></div>
      <p class="caption">${caption}</p>
    </div>`

export const fullpageImageHtmlCaption = (filename: string, caption: string) =>
  `<div class="cover-caption">
        <div><img id="cover" src="${filename}" alt="${caption}"/></div>
      </div>`

export function of(
  input: InputImage,
  options?: { path?: string }
): TE.TaskEither<never, FileOutput> {
  return TE.of({
    _tag: 'IMAGE',
    filename:
      Paths.safeJoinPath(options?.path, basename(input.filename) + '.xhtml') ||
      basename(input.filename) + '.xhtml',
    headings: [],
    pages: !!input.pageNumber ? [{ id: null, num: input.pageNumber }] : [],
    images: [srcFilenameToImage(input.filename)],
    html: fullpageImageHtmlCaption(input.filename, input.caption || ''),
    // html: `<div class="cover"><img src="${input.filename}" alt="${(
    //   input.caption || ''
    // ).trim()}"/></div>`,
    toc: input.toc,
    landmark: input.landmark
  })
}
