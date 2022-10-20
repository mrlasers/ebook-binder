import { Do } from "fp-ts-contrib/Do"
import { join } from "fp-ts-std/Array"
import * as A from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import * as IO from "fp-ts/IO"
import * as O from "fp-ts/Option"

import { Collector, CollectorTOC, idNodeToFilename } from "../"
import * as Paths from "../../paths"
import { FileOutput, Heading, Page, TextLink } from "../../tasks"
import { GeneratedOutput, Html, Metadata } from "../../types"
import { prettyPrint } from "../finalize"
import { headingToTocNode, reduceToNestedHeadings, TocNode } from "./nesto"

export function navdocFromCollector(c: Collector): FileOutput {
  return {
    _tag: 'NAVDOC',
    filename: Paths.joinPath(Paths.navPath, 'nav.xhtml'),
    headings: [],
    images: [],
    pages: [],
    landmark: null,
    toc: false,
    html: navdocDocument({
      title: c.metadata.title,
      headings: c.headings,
      pages: c.pages,
      toc: c.toc,
    }),
  }
}

export function guideFromHeadings(ignoreLandmarks?: string[]) {
  return (headings: Heading[]): string => {
    console.log('====guideFromHeadings====')
    console.log(
      headings.filter((h) => !!h.text.trim().match(/Acknowledgments/))
    )
    return pipe(
      headings,
      A.filter((h) => !!h.landmark && !ignoreLandmarks.includes(h.landmark)),
      O.fromPredicate((x) => !!x.length),
      O.map(
        flow(
          A.filter((h) => {
            if (!!h.landmark.match(/bodymatter/) || !!h.landmark.match(/toc/)) {
              console.log(`~~~ guideFromheadings :: ${h.text} : ${h.landmark}`)
            }

            return true
          }),
          A.map(
            (h) =>
              `<li><a epub:type="${h.landmark}" href="${Paths.relativePath(
                Paths.navPath,
                h.filename
              )}">${h.text}</a></li>`
          ),
          join('\n')
        )
      ),
      O.fold(
        () => '',
        (lis) =>
          `<nav epub:type="landmarks"><h1>Guide</h1><ol>${lis}</ol></nav>`
      )
    )
  }
}

export function tocFromTocNodes(toc: TocNode[]): O.Option<string> {
  return pipe(
    toc,
    O.fromPredicate((toc) => !!toc.length),
    O.map(
      flow(
        A.map((t) => {
          if (t.level === 0) {
            console.log(`tocFromTocNodes():: ${t.text}`)
          }

          return `<li><a href="${Paths.relativePath(
            Paths.navPath,
            t.filename
          )}">${t.text.replace(/<a.+?a>/, '')}</a>${pipe(
            tocFromTocNodes(t.children),
            O.fold(
              () => '',
              (x) => x
            )
          )}</li>`
        }),
        join('\n'),
        (body) => `\n<ol>\n${body}\n</ol>\n`
      )
    )
  )
}

export function pagelistFromPages(pages: Page[]): string {
  return pipe(
    pages,
    O.fromPredicate((ps) => !!ps.length),
    O.map(
      flow(
        A.map(
          (page) =>
            `<li><a href="${Paths.relativePath(
              Paths.navPath,
              page.filename
            )}">${page.num}</a></li>`
        ),
        join('\n')
      )
    ),
    O.fold(
      () => '',
      (list) =>
        `<nav epub:type="page-list" hidden="">\n<ol>\n${list}\n</ol>\n</nav>`
    )
  )
}

type NavdocOptions = {
  title: string
  headings: Heading[]
  pages: Page[]
  toc: {
    linear: CollectorTOC[]
    nested: TocNode[]
  }
}

export function navdocDocument(data: NavdocOptions) {
  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" epub:prefix="ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0">
<head>
<meta http-equiv="default-style" content="text/html;charset=utf-8"/>
<title>${data.title}</title>
</head>
<body>
${guideFromHeadings(['part'])(data.headings)}
${pipe(
  tocFromTocNodes(data.toc.nested),
  O.fold(
    () => '',
    (toc) => `<nav epub:type="toc">\n<h1>Table of Contents</h1>\n${toc}\n</nav>`
  )
)}
${pagelistFromPages(data.pages)}
</body></html>
  `.trim()
}

// function navPoint(heading: Heading): HTML {
//   if (heading.landmark) {
//     console.log(`navdoc.navPoint( ${heading.landmark} )`)

//     return `<li><a href="${Paths.getRelativeNavToContentPath(
//       heading.filename
//     )}">${heading.text}</a></li>`
//   }

//   return ''
//   return `<li><a href="${Paths.getRelativeNavToContentPath(
//     heading.filename
//   )}">${heading.text}</a></li>`
// }

// function nestedNavPoint(node: TocNode): HTML {
//   const { filename, text } = node
//   const children = node.children.map(nestedNavPoint).join('')

//   // if (children.length) console.log(children)

//   return `<li><a href="${Paths.getRelativeNavToContentPath(
//     idNodeToFilename(node)
//   )}">${text}</a>${children ? `<ol>${children}</ol>` : ''}</li>`
// }

// function guidePoint(heading: Heading): HTML {
//   if (!heading?.landmark?.trim().length) return ''

//   return `<li><a epub:type="${
//     heading.landmark
//   }" href="${Paths.getRelativeNavToContentPath(
//     idNodeToFilename(heading)
//   )}">${heading.text.trim()}</a></li>`
// }

// export function headingsToNavDoc(ignoreLandmarks?: string[]) {
//   return (input: {
//     metadata: Metadata
//     headings: Heading[]
//     pages: Page[]
//   }): GeneratedOutput => {
//     // stop closing this gap, you bitch!

//     const guide = (headings: Heading[]) => {
//       console.log(`=========guide():: ${headings}`)
//       return pipe(
//         headings,
//         A.filter((h) => !!h?.landmark),
//         (hs) => {
//           console.log(`--------headingsToNavDoc(hs):: ${hs}`)
//           return hs
//         },
//         (hs) => (hs.length ? O.of(hs) : O.none),
//         O.map(flow(A.map(guidePoint), A.filter(Boolean), join('\n'))),
//         O.fold(
//           () => '',
//           (landmarks) =>
//             `<nav epub:type="landmarks"><h1>Guide</h1><ol>${landmarks}</ol></nav>`.trim()
//         )
//       )
//     }

//     const toc = `
// <nav epub:type="toc">
// <h1>Table of Contents</h1>
// <ol>
// ${pipe(
//   input.headings,
//   A.filter((h) => !h.landmark),
//   reduceToNestedHeadings,
//   A.map(nestedNavPoint),
//   join('\n')
// )}
// </ol></nav>
// `.trim()

//     const pageList = !input.pages.length
//       ? ''
//       : `
// <nav epub:type="page-list" hidden="">
// <ol>
// ${pipe(
//   input.pages,
//   A.map(
//     (page) => `<li><a href="${idNodeToFilename(page)}">${page.num}</a></li>`
//   ),
//   join('\n')
// )}
// </ol>
// </nav>
// `

//     const content = `
// <!DOCTYPE html>
// <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" epub:prefix="ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0">
// <head>
// <meta http-equiv="default-style" content="text/html;charset=utf-8"/>
// <title>${input.metadata.title}</title>
// </head>
// <body>
// ${guide(input.headings)}
// ${toc}
// ${pageList}
// </body></html>`.trim()

//     return {
//       operation: 'WRITE',
//       type: 'NAVDOC',
//       content: prettyPrint(content),
//       destination: Paths.getRelativeNavPath('nav.xhtml')
//     }
//   }
// }
