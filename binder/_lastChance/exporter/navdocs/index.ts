import { join } from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'

import { CollectorTOC } from '../'
import * as Paths from '../../paths'
import { FileOutput } from '../../tasks'

export * from './ncx'
export * from './navdoc'

// type TocOptions = {
//   maxDepth: number
// }

// export function htmlFromLinearToc(options: TocOptions = { maxDepth: 7 }) {
//   return (toc: CollectorTOC[]) => {
//     return pipe(
//       toc,
//       A.filter((t) => t.level <= options.maxDepth),
//       A.map((t) => {
//         const filename = Paths.relativePath(Paths.htmlPath, t.filename)
//         return `<p class="toc${t.level + 1}"><a href="${filename}">${
//           t.html
//         }</a></p>`
//       }),
//       join('\n')
//       // ,(html): FileOutput => ({
//       //   _tag: 'NAVIGATION',
//       //   filename: Paths.joinPath(Paths.htmlPath, '')
//       // }
//     )
//   }
// }
