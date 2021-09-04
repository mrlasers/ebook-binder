import Fs from 'fs/promises'
import Path from 'path'
import { Command, createCommand } from 'commander'
import { readFile, readJson, readFileIOE } from './lib'
import { normalize } from './manifest'

import * as A from 'fp-ts/Array'
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import * as IOE from 'fp-ts/IOEither'
import { pipe, flow } from 'fp-ts/function'
import { guard } from 'fp-ts-std/Function'
import { Do } from 'fp-ts-contrib/Do'

import { isManifestFileItem, ManifestFileItem } from './types'
import {
  loadManifestFileItem,
  loadManifestFileItemHtml,
  fileItem
} from './manifest'

export type ManifestJson = {
  metadata: {
    title: string
    pubId?: string
    author?: string
    publisher?: string
  }
  files: (string | ManifestFileItem)[]
}

const program = new Command()

export const liftJsonFile = guard<
  string | ManifestFileItem,
  TE.TaskEither<Error, ManifestFileItem>
>([
  [(item) => typeof item === 'string', (item) => TE.of(normalize(item))],
  [isManifestFileItem, (item: ManifestFileItem) => TE.of(item)]
])((item) => TE.left(new Error(String(item))))

export const addHtmlFromFile = (path: string) => {
  // console.log('html path:', path)

  return flow(
    liftJsonFile,
    TE.chain((item) => {
      if (!!item.filename.match(/\.(jpg|png)$/)) {
        return TE.left(new Error(`Not handling images atm: ${item.filename}`))
      }
      return loadManifestFileItemHtml(item)
    })
    // TE.chain((file) => {
    //   const filePath = Path.join(path, file.filename)
    //   console.log(filePath)
    //   return pipe(
    //     // readFileIOE(file.filename),
    //     readFile(filePath)
    //     // TE.map((html) => {
    //     //   return {
    //     //     ...file,
    //     //     html
    //     //   }
    //     // })
    //   )
    // })
  )
}

const tap = (data: any) => {
  console.log('== tap ==')
  console.log(data)
  console.log('// tap ==')
  return data
}

const tapF = (fun: Function) => {
  console.log(fun())
  return fun
}

const tapTask = (task: T.Task<any>) => {
  task().then((data) => {
    console.log('== tapTask ==')
    console.log(data)
    console.log('// tapTask ==')
  })
  return task
}

const cmdProcess = createCommand('process')
  .description('Process manifest and files')
  .arguments('<buildDirectory>')
  .action((dir, options) => {
    const manifest = Path.resolve(process.cwd(), dir, 'manifest.json')
    console.log('manifest path:', manifest)
    pipe(
      manifest,
      readJson,
      TE.map((json: ManifestJson) => {
        const srcPath = Path.resolve(dir, 'source')
        return pipe(
          json.files,
          A.map(
            flow(
              fileItem,
              O.map(flow(loadManifestFileItem(srcPath))), // O<{ filename }>
              TE.fromOption(() => new Error('not doing it')),
              tap
              // TE.fromOption(() => new Error('not doing this'))
              // TE.fromOption(() => TE.left(new Error('did not find something')))
            )
          ),
          A.map(TE.map(console.log)),
          // A.filter(O.isSome),
          // A.filter(E.isRight),
          // A.map(tapTask)
          tap
          // A.map(flow(
          //   liftJsonFile,
          //   loadManifestFileItem(Path.resolve(dir, 'source', 'xhtml'))
          // )),
          // // tap,
          // A.filter(E.isRight),
          // tap
          // A.sequence(TE.Monad),
          // tapTask
          // TE.of
        )
      })
      // ,TE.map((json: ManifestJson) => {
      //   return {
      //     metadata: json.metadata,
      //     files: pipe(json.files.map(addHtmlFromFile), A.sequence(T.Monad))
      //   }
      // })
    )() //.then((x) => console.log(JSON.stringify(x, null, 2)))
  })

program.version('0.0.1')
program.addCommand(cmdProcess)

program.parse(process.argv)
