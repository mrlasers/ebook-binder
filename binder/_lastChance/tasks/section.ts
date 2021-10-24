import { isBoolean } from 'fp-ts/lib/boolean'
import { isNumber } from 'fp-ts/lib/number'
import { isString } from 'fp-ts/lib/string'
import * as TE from 'fp-ts/TaskEither'

import { srcFilenameToImage } from '../exporter'
import * as Paths from '../paths'
import { InputSection } from '../types'
import { basename, FileOutput, Image, isImageFilename } from './'
import { fullpageImageHtml } from './image'

export type InputType = {
  filename: string // filename of the image for this section page
  title: string // can't be empty
  level?: number // default: 0
  toc?: boolean // show in tables of contents; default: true
  page?: string | number
  images: Image[]
  landmark?: string
}

export function isInput(value: any): value is InputType {
  const section = value as InputType

  if (
    typeof section.filename !== 'string' ||
    !section.filename.length ||
    !isImageFilename(section.filename)
  )
    return false
  if (typeof section.title !== 'string' || !section.title.length) return false
  if (isNumber(section.level) && section.level < 0) return false
  if (section.toc && !isBoolean(section.toc)) return false
  if (section.page && !(isNumber(section.page) || isString(section.page)))
    return false
  if (!section.landmark || isString(section.landmark)) return true
}

export function of(
  input: InputSection,
  options?: { path?: string }
): TE.TaskEither<never, FileOutput> {
  return TE.of({
    _tag: 'SECTION',
    filename:
      Paths.safeJoinPath(options?.path, basename(input.filename) + '.xhtml') ||
      basename(input.filename) + '.xhtml',
    headings: [
      {
        id: null,
        text: input.title.replace(/^.+?\|/, (str) => str.toUpperCase()),
        html: input.title.replace(/^.+?\|/, (str) => str.toUpperCase()),
        level: input.level,
        toc: input.toc,
        landmark: input.landmark
      }
    ],
    pages: !!input.pageNumber ? [{ id: null, num: input.pageNumber }] : [],
    images: [srcFilenameToImage(input.filename)],
    html: fullpageImageHtml(input.filename.trim(), input.title.trim()),
    // html: `<div class="cover"><img src="${input.filename.trim()}" alt="${input.title.trim()}"/></div>`,
    level: input.level || 0,
    toc: input.toc,
    landmark: input.landmark || undefined
  })
}
