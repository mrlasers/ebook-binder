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
import { Config, Metadata, NormalizedConfig } from '../../types'
import { reduceToNestedHeadings } from '../navdocs/nesto'
import { resolveFactories } from './factories'

export const collectOutput =
  (metadata: Metadata, config: NormalizedConfig) =>
  (files: FileOutput[]): Collector =>
    pipe(
      files,
      A.map(decorateFileOutput),
      collectFileOutput(metadata, config),
      (collected): Collector => ({
        ...collected,
        images: collected.images
          .reduce<Image[]>(reduceFilterImages, [])
          .sort(sortImages)
      }),
      // (x) => {
      //   console.log(x.toc.linear)
      //   return x
      // },
      resolveFactories(config)
    )

const emptyCollector = (metadata: Metadata) => {
  return {
    metadata: metadata,
    headings: [],
    pages: [],
    files: [],
    missingFootnotes: [],
    images: [],
    figures: [],
    tables: []
  }
}

export function collectFileOutput(
  metadata: Metadata,
  config: NormalizedConfig
) {
  // console.log(`collectFileOutput(what the order?)`)

  return flow(
    A.reduce<FileOutput, Collector>(
      emptyCollector(metadata),
      (collector: Collector, file: FileOutput): Collector => {
        const footnotes = getFootnotesFromHtml(file.html)

        const figures: TextLink[] = pipe(
          getFiguresFromHtml(file.html),
          A.map((link) => ({
            text: link.text,
            filename: file.filename + '#' + link.filename
          }))
        )

        const collectedHeadings = [
          ...collector.headings,
          ...fileToHeadings(file)
        ]

        return {
          ...collector,
          headings: collectedHeadings,
          pages: [...collector.pages, ...fileToPages(file)],
          missingFootnotes: [
            ...(collector.missingFootnotes || []),
            ...footnotes
          ],
          images: [...(collector.images || []), ...file.images],
          files: [...collector.files, file],
          figures: [...collector.figures, ...figures]
        }
      }
    ),
    collectedToTOC(config)
  )
}

export function fileToHeadings(file: FileOutput) {
  return file.headings.map((heading): Heading => {
    if (!!heading?.landmark?.match(/toc/)) {
      console.log(`fileToHeadings():: ${JSON.stringify(file)}`)
    }
    return {
      ...heading,
      filename: file.filename,
      toc: file.toc || false,
      landmark: heading.landmark // file.landmark
    }
  })
}

export function fileToPages(file: FileOutput) {
  return pipe(
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
}

export function collectedToTOC(config: NormalizedConfig) {
  return (collected: Collector) => {
    console.log(
      `collectedToTOC(toc?) :: ${collected.headings.filter((h) =>
        h?.landmark?.match(/toc/)
      )}`
    )
    return {
      ...collected,

      toc: {
        inline: pipe(
          collected.headings,
          A.filter((h) => h.toc === true),
          A.filter((h) => !config.toc || config.toc.includes(h.level)),
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
        linear: pipe(
          collected.headings,
          A.filter((h) => h.toc === true),
          A.filter((h) => !config.toc || config.toc.includes(h.level)),
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
        nested: pipe(
          collected.headings,
          // (headings) => {
          //   console.log(
          //     `+~+~+~+~collectedToTOC() :: ${JSON.stringify(
          //       headings.slice(0, 20),
          //       null,
          //       2
          //     )}`
          //   )

          //   return headings
          // },
          // A.map((h) => {
          //   if (!!h?.landmark?.match(/toc/)) {
          //     console.log(`+~+~+~+~collectedToTOC() :: ${JSON.stringify(h)}`)
          //   }
          //   return h
          // }),
          A.filter((h) => h.toc === true),
          A.filter((h) => !config.toc || config.toc.includes(h.level)),
          // gender hack
          A.map((t) => {
            // gender hack
            // gender hack

            const hacks = []
            //  [
            //   'Conclusion',
            //   'Epilogue to the Dedication',
            //   'Glossary from the Transgender Language Primer by Greyson Simon',
            //   'List of Figures and Tables',
            //   'Bibliography',
            //   'Photo and Illustration Credits',
            //   'Acknowledgments',
            //   'About the Author',
            //   'About Artist Jacqui Beck'
            // ]

            if (hacks.includes(t.text)) {
              console.log(`collectedToTOC() :: ${t.level} : ${t.text}`)

              return {
                ...t,
                navlevel: 0
              }
            }

            return t
          }),
          // A.map((h) => {
          //   if (!!h.filename.match(/Introduction.xhtml$/)) {
          //     console.log(
          //       `||| collectedToTOC(nested) :: ${h.text} : ${h.landmark}`
          //     )
          //   }
          //   return h
          // }),
          reduceToNestedHeadings
        )
      }
    }
  }
}
