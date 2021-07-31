import { flow, pipe } from 'fp-ts/function'
import * as A from 'fp-ts/Array'
import { FileData } from './'

export const lineToData = flow(
  (s: string) => s.split('\t'),
  ([file, level, fragment, title]) => {
    return {
      file,
      fragment,
      level: parseInt(level, 0) || null,
      title,
      children: []
    }
  }
)

export const _lineToData = (line: string): FileData => {
  // flow<string[], FileData>(() => ({
  //   file: '',
  //   level: 0,
  //   fragment: '',
  //   title: 'Hello, World!',
  //   children: []
  // }))
  return pipe(
    line,
    (s: string) => s.split('\t'),
    ([file, level, fragment, title]) => {
      return {
        file,
        fragment,
        level: parseInt(level, 0),
        title,
        children: []
      }
    }
  )

  //   ({
  //   file: '',
  //   fragment: '',
  //   level: 0,
  //   title: '',
  //   order: 0,
  //   children: []
  // })
}

export const headingTextToData = flow(
  (s: string) => s.split(/[\r\n]+/).filter((x) => !!x.trim().length),
  A.mapWithIndex((idx, line) =>
    pipe(
      line,
      (line: string) => line.split(/\t/),
      ([file, level, fragment, title]): FileData => ({
        file,
        fragment,
        level: parseInt(level, 0),
        title: title.trim(),
        order: idx + 1,
        children: []
      })
    )
  )
)
