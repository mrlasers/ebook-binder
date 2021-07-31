import Path from 'path'
import { access, constants } from 'fs'
import { pipe, flow } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'

export const fileIO = (path: string) => {
  return pipe(
    E.right({ path: Path.resolve(process.cwd(), path) })
    // E.map(path => access())
  )
}
