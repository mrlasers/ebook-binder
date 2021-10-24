import { flow, pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import Fs from 'fs/promises'
import { nanoid } from 'nanoid'

import { stripExt } from '../helpers'
import { Err, FileOutput, Image, Input, isImageInput } from '../types'

export function makeImageTaskFromInput(
  input: Image
): TE.TaskEither<Error, FileOutput> {
  return pipe(TE.tryCatch(() => Fs.stat()))

  // if (!isImageInput(input)) {
  //   return TE.left(
  //     Err.InputTypeError.of(
  //       `Cannot create Image Task from non-image input: ${JSON.stringify(
  //         input
  //       )}`
  //     )
  //   )
  // }

  // return TE.of<never, FileOutput>({
  //   _tag: 'HTML',

  // })
}

export function imageToHtmlBody(image: Image) {
  return `<div${
    image.illustration ? ` id="illus-${nanoid()}"` : ''
  } class="cover"><img src="${image.filename}" alt="${
    image.caption || ''
  }"/></div>`
}

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
