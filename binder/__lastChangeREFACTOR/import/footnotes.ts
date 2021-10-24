import Path from 'path'
import { pipe, flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as A from 'fp-ts/Array'

import { readJson } from '../io'
import { Err, Footnote } from '../types'

export const readFootnotes = (path: string) =>
  pipe(
    readJson(Path.resolve(path, 'footnotes.json')),
    TE.map(inputJsonToFootnote),
    TE.chain(A.sequence(TE.Monad)),
    TE.chain((notes) => {
      const lastNote = notes[notes.length - 1]

      // console.log(lastNote)

      if (lastNote.num !== notes.length) {
        return TE.left(
          Err.JsonParseError.of(
            `Length of footnotes does not match last note (there should be ${notes.length} notes but last note is numbered ${lastNote.num})`
          )
        )
      }

      return TE.of(notes)
    })
  )

function inputJsonToFootnote(json: any) {
  return Object.keys(json).reduce<
    TE.TaskEither<Err.JsonParseError, Footnote>[]
  >((acc, key, idx) => {
    if (!Number(key)) {
      return [
        ...acc,
        TE.left(
          Err.JsonParseError.of(
            `Footnote key must be a number ("${key}" is not numeric)`
          )
        )
      ]
    }

    if (Number(key) !== idx + 1) {
      return [
        ...acc,
        TE.left(Err.JsonParseError.of(`Footnote missing (${key} !== ${idx})`))
      ]
    }

    return [...acc, TE.of({ num: Number(key), text: json[key] })]
  }, [])
}
