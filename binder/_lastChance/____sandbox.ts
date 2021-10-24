import { join } from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import Path from 'path'

import { joinPath } from './paths'

const path: string = undefined

function safePaths(...segments: string[]) {
  return pipe(
    segments,
    A.map(O.fromNullable),
    A.sequence(O.Monad),
    O.getOrElse(() => []),
    (xs) => Path.join(...xs)
  )
}

const result = 'hello | world'.replace(/^.+?\|/, (str) => str.toUpperCase())

console.log(result)
