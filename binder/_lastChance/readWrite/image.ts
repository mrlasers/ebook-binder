import { flow, pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import sharp from 'sharp'

import { Err } from '../types'

export const readAndCompressImage = (path: string, options?: any) => {
  // console.log(`readAndCompressImage():: ${path}`)

  // return pipe(
  //   TE.tryCatch(
  //     () =>
  //       sharp(path)
  //         .resize({
  //           withoutEnlargement: true,
  //           width: 900
  //         })
  //         .jpeg()
  //         .toBuffer(),
  //     Err.MyError.of
  //   )
  // )

  return sharp(path)
    .resize({
      withoutEnlargement: true,
      width: 900
    })
    .jpeg()
    .toBuffer()
    .catch((err) => Err.MyError.of(err))
}
