import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { toTitleCase } from '@artsy/to-title-case'

import {
    Collector,
    CollectorTOC,
    decorateFileOutput,
    getFiguresFromHtml,
    getFootnotesFromHtml,
} from '../'
import { reduceFilterImages, sortImages } from '../..'
import { FileOutput, Heading, Image, Page, TextLink } from '../../tasks'
import { Metadata } from '../../types'
import { reduceToNestedHeadings } from '../navdocs/nesto'
import { resolveFactories } from './factories'

export const collectOutput =
  (metadata: Metadata) =>
  (files: FileOutput[]): Collector =>
    pipe(
      files,
      A.map(decorateFileOutput),
      collectFileOutput(metadata),
      (collected): Collector => ({
        ...collected,
        images: collected.images
          .reduce<Image[]>(reduceFilterImages, [])
          .sort(sortImages)
      }),
      resolveFactories
    )

export function collectFileOutput(metadata: Metadata) {
  return flow(
    A.reduce<FileOutput, Collector>(
      {
        metadata: metadata,
        headings: [],
        pages: [],
        files: [],
        missingFootnotes: [],
        images: [],
        figures: [],
        tables: []
      },
      (collector: Collector, file: FileOutput): Collector => {
        const headings = file.headings.map(
          (heading): Heading => ({
            ...heading,
            filename: file.filename,
            toc: file.toc || false,
            landmark: file.landmark
          })
        )
        const footnotes = getFootnotesFromHtml(file.html)

        const figures: TextLink[] = pipe(
          getFiguresFromHtml(file.html),
          A.map((link) => ({
            text: link.text,
            filename: file.filename + '#' + link.filename
          }))
        )

        const pages = pipe(
          file.pages,
          A.map(
            (page): Required<Page> => ({
              ...page,
              filename: pipe(
                O.fromNullable(page.id),
                O.fold(
                  () => file.filename,
                  (id) => file.filename + '#' + id
                )
              )
            })
          )
        )

        const collectedHeadings = [...collector.headings, ...headings]

        return {
          ...collector,
          headings: collectedHeadings,
          pages: [...collector.pages, ...pages],
          missingFootnotes: [
            ...(collector.missingFootnotes || []),
            ...footnotes
          ],
          images: [...(collector.images || []), ...file.images],
          files: [...collector.files, file],
          toc: {
            linear: pipe(
              collectedHeadings,
              A.filter((h) => h.toc === true),
              A.map(
                (h): CollectorTOC => ({
                  filename: h.filename + (h.id ? `#${h.id}` : ''),
                  level: h.level,
                  text: h.text,
                  html: h.html
                })
              )
            ),
            nested: reduceToNestedHeadings(collectedHeadings)
          },
          figures: [...collector.figures, ...figures]
        }
      }
    ),
    (collected) => {
      return {
        ...collected,

        toc: {
          linear: pipe(
            collected.headings,
            A.filter((h) => h.toc === true),
            A.map((h): CollectorTOC => {
              return {
                filename: h.filename + (h.id ? `#${h.id}` : ''),
                level: h.level,
                text: h.text,
                html: h.html,
                landmark: h.landmark
              }
            })
          ),
          nested: reduceToNestedHeadings(collected.headings)
        }
      }
    }
  )
}
