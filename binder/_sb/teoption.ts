import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import { pipe, flow } from 'fp-ts/function'
import { parse, parseO } from 'fp-ts-std/JSON'

// const result = pipe(
//   `{ "hello": "world }`,
//   TE.of,
//   TE.chain(
//     flow(
//       parse((e) => e),
//       TE.fromEither
//     )
//   )
// )

// result().then(console.log)

const fakeLoad = (path: string): TE.TaskEither<Error, string> =>
  path.length > 5 ? TE.right(path) : TE.left(new Error(String(path)))

const arr = ['Hello, World!', 'nope', 'The End.']
// console.log(arr)
const arrTE = arr.map(fakeLoad)
// console.log(arrTE)

const seq = TE.sequenceArray(arrTE)
// seq().then(console.log)

const aseq = A.sequence(T.Monad)(arrTE)
aseq().then((x) => console.log('aseq:', x))

// const tmapAfilter = T.map(A.filter(E.isRight))(aseq)
// tmapAfilter().then(console.log)

// const aTraverse = pipe(
//   aseq,
//   T.chain(A.traverse(T.Monad)())
// )

// const mapleft = pipe(
//   aseq,
//   T.map(files => pipe(files,(file) => E.mapLeft()))
// )

// console.log(files)

// const seq = TE.sequenceArray(files)
// seq().then(console.log)

// const aseq = pipe(A.sequence(T.Monad)(files), T.map(A.filter(E.isRight)))
// aseq().then(console.log)
