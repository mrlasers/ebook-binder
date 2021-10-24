import { nanoid } from 'nanoid'
import * as TE from 'fp-ts/TaskEither'
import { pipe, flow } from 'fp-ts/function'
import { doesFileExist } from '../../io'
import { Image, FileOutput, Err } from '../../types'
import { stripExt } from '../../helpers'

export const imageToHtmlBody = (image: Image) =>
  `<div${
    image.illustration ? ` id="illus-${nanoid()}"` : ''
  } class="cover"><img src="${image.filename}" alt="${
    image.caption || ''
  }"/></div>`

// export function imageToFileOutput(
//   image: Image
// ): TE.TaskEither<Error, FileOutput> {
//   return pipe(
//     doesFileExist,
//     TE.map((stats: any) => {
//       return {
//         _tag: 'HTML',
//         body: '',
//         filename: '',
//         title: ''
//       }
//     })
//   )
// }
