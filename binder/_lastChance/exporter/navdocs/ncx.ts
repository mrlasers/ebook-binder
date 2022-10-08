import { identity } from 'fp-ts'
import { Do } from 'fp-ts-contrib/Do'
import { join } from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { v4 as Uuid } from 'uuid'

import { Collector, CollectorTOC, idNodeToFilename } from '../'
import { prettyPrint } from '../../../processing'
import * as Paths from '../../paths'
import { FileOutput, Heading, Page } from '../../tasks'
import { GeneratedOutput, HTML, Metadata } from '../../types'
import { headingToTocNode, TocNode } from './nesto'

function navPoint(
  id: string,
  playOrder: number,
  src: string,
  text: string
): HTML {
  return `<navPoint id="${id}" playOrder="${playOrder}"><navLabel><text>${text}</text></navLabel><content src="${Paths.getRelativeNavToContentPath(
    src
  )}"/></navPoint>`
}

export const navLabel = (text: string): HTML =>
  `<navLabel><text>${text}</text></navLabel>`

// export function headingsToNcx(input: {
//   metadata: Metadata
//   headings: Heading[]
//   pages: Page[]
// }): GeneratedOutput {
//   const navPoints = pipe(
//     input.headings,
//     A.map(headingToTocNode),
//     A.mapWithIndex((i, a) =>
//       navPoint(`np${i + 1}`, i, idNodeToFilename(a), a.text)
//     ),
//     join('')
//   )

//   const pageTargets = pipe(
//     input.pages,
//     A.map(
//       ({ id, num }) =>
//         `<pageTarget id="${id}" type="normal" value="${num}">${navLabel(
//           num
//         )}</pageTarget>`
//     ),
//     join('')
//   )

//   return {
//     operation: 'WRITE',
//     type: 'NCX',
//     content: prettyPrint(ncx),
//     destination: getRelativeNavPath('toc.ncx')
//   }
// }

type NcxData = {
  pubId: string
  title: string
  author: string
  navPoints: string
  pageTargets?: string
}

export function tocToNavPoint(idx: number, toc: CollectorTOC) {
  return `<navPoint id="np${idx + 1}" playOrder="${
    idx + 1
  }"><navLabel><text>${toc.text.replace(
    /<.+?>/g,
    ''
  )}</text></navLabel><content src="${Paths.relativePath(
    Paths.navPath,
    toc.filename
  )}"/></navPoint>`
}

export function pageToPageTarget(idx: number, page: Required<Page>) {
  return `<pageTarget id="p${page.num}" type="normal" value="${
    page.num
  }"><navLabel><text>${
    page.num
  }</text></navLabel><content src="${Paths.relativePath(
    Paths.navPath,
    page.filename
  )}"/></pageTarget>`
}

export function ncxFromCollector(c: Collector): FileOutput {
  return {
    _tag: 'NCX',
    filename: Paths.joinPath(Paths.navPath, 'toc.ncx'),
    headings: [],
    images: [],
    landmark: '',
    pages: [],
    toc: false,
    html: ncxDocument({
      pubId: c.metadata.pubId,
      author: c.metadata.author,
      title: c.metadata.title,
      navPoints: pipe(
        O.fromNullable(c?.toc?.linear),
        O.map(flow(A.mapWithIndex(tocToNavPoint), join('\n'))),
        O.fold(
          () => '',
          (x) => x
        )
      ),
      pageTargets: pipe(c.pages, A.mapWithIndex(pageToPageTarget), join('\n')),
    }),
  }
}

export function ncxDocument(data: NcxData) {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en-US">
<head>
<meta name="dtb:uid" content="urn:uuid:${data.pubId}"/>
<meta name="dtb:depth" content="1"/>
<meta name="dtb:totalPageCount" content="0"/>
<meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle><text>${data.title}</text></docTitle>
<docAuthor><text>${data.author}</text></docAuthor>
<navMap>
${data.navPoints}
</navMap>
${pipe(
  data.pageTargets.length ? O.of(data.pageTargets) : O.none,
  O.map((targets) => `<pageList>${targets}</pageList>`),
  O.fold(
    () => '',
    (x) => x
  )
)}
</ncx>
  `.trim()
}
