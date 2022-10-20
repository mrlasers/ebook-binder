import * as A from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import Path from "path"

import { copyFile, deleteFile, mkDir, writeFile } from "../../readWrite"
import { Err, OutputTuple, OutputTupleTypes } from "../../types"

export type EpubOutputOptions = {
  explodedEpubBasePath: string
  clean?: boolean
}

type OutputExplodedOptions = {
  explodedEpubBasePath: string
  exclude?: OutputTupleTypes[]
  clean?: boolean
}

const makeExplodedFileStructure = (options: EpubOutputOptions) =>
  flow(
    (tups: OutputTuple[]) => {
      return tups.reduce<string[]>(
        (acc, tup) =>
          acc.includes(Path.dirname(tup[1]))
            ? acc
            : [...acc, Path.dirname(tup[1])],
        []
      )
    },
    A.map((x) => Path.resolve(options.explodedEpubBasePath, x)),
    (paths) =>
      pipe(
        options.clean === true
          ? deleteFile(Path.join(options.explodedEpubBasePath, '*'))
          : TE.of(''),
        TE.chain((args: any) => pipe(paths, A.map(mkDir), A.sequence(TE.Monad)))
      )
  )

export function outputExplodedEpub(options?: EpubOutputOptions) {
  return (tups: OutputTuple[]) => {
    // console.log(`outputExplodedEpub() :: ${JSON.stringify(options, null, 2)}`)

    return pipe(
      tups,
      makeExplodedFileStructure(options),
      TE.chain(() => {
        return pipe(
          tups,
          A.map(([type, filename, data]) => {
            const path = Path.resolve(options.explodedEpubBasePath, filename)

            // console.log(`## filename:: ${filename}`)
            // console.log(
            //   `outputExplodedEpub(explodedEpubBasePath) :: ${options.explodedEpubBasePath}`
            // )
            // console.log(`outputExplodedEpub(A.map) :: ${path}`)

            switch (type) {
              default:
                return TE.left(
                  Err.MyError.of(
                    `outputExplodedEpub(): handling of type "${type}" not yet supported`
                  )
                )
              case 'style':
              case 'xml':
              case 'content':
                // if (type === 'style') {
                //   console.log(`outputExplodedEpub(style): ${path}`)
                // }
                return writeFile(path, data)
              case 'style':
              case 'image':
                // console.log(`outputExplodedEpub(style): ${path}`)
                return copyFile(data, path)
              case 'font':
                // console.log(`::: Skipping fonts for exploded epub output :::`)
                return TE.of(undefined)
            }
          }),
          A.sequence(TE.Monad)
        )
      })
    )
  }
}

export const outputExploded =
  (options: OutputExplodedOptions) => (files: OutputTuple[]) =>
    pipe(
      files,
      A.filter((f) => !options.exclude.includes(f[0])),
      outputExplodedEpub(options)
    )
