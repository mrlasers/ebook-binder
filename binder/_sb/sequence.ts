import Fs from 'fs/promises'
import Path from 'path'
import { pipe, flow } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { parse } from 'fp-ts-std/JSON'

let result: any = null

const tasks: T.Task<string>[] = [T.of('Hello, World!'), T.of('The End')]

const seqTasks = T.sequenceArray(tasks)

// seqTasks().then(console.log)

const taskeithers: TE.TaskEither<number, string>[] = [
  TE.right('Hello, World!'),
  TE.left(666),
  TE.right('The End.')
]

const seqTaskEithers = TE.sequenceArray(taskeithers)

// seqTaskEithers().then(console.log)

const aseqTaskEither = pipe(
  A.sequence(T.Monad)(taskeithers),
  T.map(A.filter(E.isRight))
)

// aseqTaskEither().then(console.log)

const opts = [O.of('Hello, World!'), O.none, O.some('The End.')]
const filterOpts = pipe(
  opts,
  A.map(
    flow(
      TE.fromOption<string>(() => 'none'),
      TE.map((s: string) => s.toUpperCase())
    )
  ),
  A.sequence(T.Monad),
  T.map(A.filter(E.isRight))
)
// const seqOpts = pipe(A.sequence(O.Monad)(opts), A.map(O.filter(O.isSome)))
// console.log(opts)
filterOpts().then(console.log)
