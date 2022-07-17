import { flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import Fs from 'fs'
import JSZip from 'jszip'

import { Err } from '../types'

export type WriteZipOptions = {
  compression?: 'DEFLATE' | 'STORE'
  compressionOptions?: { level: number }
}

export function writeZip(
  fullZipFileOutputFilePath: string,
  options?: WriteZipOptions
) {
  // console.log('writeZip ::', fullZipFileOutputFilePath)
  return (zip: JSZip) =>
    TE.tryCatch(
      () =>
        new Promise((res, rej) => {
          zip
            .generateNodeStream(options)
            .pipe(Fs.createWriteStream(fullZipFileOutputFilePath))
            .on('finish', () =>
              res(`Zip file written to ${fullZipFileOutputFilePath}`)
            )
            .on('error', flow(Err.MyError.of, rej))
        }),
      Err.MyError.of
    )
}
