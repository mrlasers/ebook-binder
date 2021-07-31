import { createCommand } from 'commander'
import { fileIO } from '../../../lib/fileio/io-fp'
import Path from 'path'
import { access, readFile } from 'fs/promises'
import { constants } from 'fs'
import { pipe, flow } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'

// const checkPathExists = (path: string) => () => {
//   return new Promise((resolve) => {
//     access(path, constants.F_OK, (err: unknown) =>
//       resolve({ path, exists: !err })
//     )
//   })
// }

const teReadFile = TE.tryCatchK(readFile, (err) => err)

const readUtf8 = (filename: string) =>
  teReadFile(filename, { encoding: `utf8` })

export const testio = createCommand('testio')
  .description(`Test FP IO stuff`)
  .arguments(`<srcDir>`)
  .action((srcDir, options) => {
    console.log('=== testio ===')

    console.log(srcDir)
    console.log('-'.repeat(80))

    const result = pipe(Path.resolve(srcDir, 'mimetype'), readUtf8)

    result().then(console.log)

    // console.log(`srcDir: ${result}`)
    // pipe(srcDir, fileIO, console.log)
    // A.traverse(T.ApplicativeSeq)(checkPathExists)([
    //   '/bin',
    //   '/one/two/three/fuck'
    // ])().then(console.log)
  })
