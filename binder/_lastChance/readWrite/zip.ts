import { flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import Fs from 'fs'
import JSZip from 'jszip'

import { Err } from '../types'

export type WriteZipOptions = {
  compression?: 'DEFLATE' | 'STORE'
  compressionOptions?: { level: number }
}

export function writeZip(path: string, options?: WriteZipOptions) {
  return (zip: JSZip) =>
    TE.tryCatch(
      () =>
        new Promise((res, rej) => {
          zip
            .generateNodeStream(options)
            .pipe(Fs.createWriteStream(path))
            .on('finish', () => res(`Zip file written to ${path}`))
            .on('error', flow(Err.MyError.of, rej))
        }),
      Err.MyError.of
    )
}
