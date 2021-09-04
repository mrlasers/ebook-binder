import Fs from 'fs/promises'
import Path from 'path'
import { pipe, flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'

const path =
  'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/A Practical Reference/build/source/xhtml'

const files = ['Chapter1.xhtml', 'Chapter2.xhtml']

const result = files.map((file) => {
  // return TE.tryCatch(
  //   () => Fs.readFile(Path.join(path, file), { encoding: 'utf-8' }),
  //   (err) => new Error(`${err}`)
  // )()
  return pipe(
    TE.tryCatch(
      () => Fs.readFile(Path.join(path, file), { encoding: 'utf-8' }),
      (err) => new Error(`${err}`)
    ),
    TE.map((html) => html.slice(0, 10)),
    TE.fold(
      () => T.of('nothing to see here'),
      (a) => T.of(a.toUpperCase())
    )
  )()
})

// const result = TE.tryCatch(
//   () => Fs.readFile(manifestPath, { encoding: 'utf-8' }),
//   (err) => new Error(`${err}`)
// )

Promise.all(result)
  // .then((x: Function[]) => x.map((f) => f()))
  // .then((proms) => Promise.all(proms))
  .then(console.log)
