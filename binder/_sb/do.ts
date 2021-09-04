import { Do } from 'fp-ts-contrib/Do'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'

const result = Do(TE.Monad)
  .bind('file', TE.right('section01.xhtml'))
  .bindL('files', ({ file }) => {
    return TE.right(file)
  })
  .bind('bam', TE.right('stringer'))
  .done()()
// .return((s) => s.file)()

console.log('result:', result)

result.then(console.log)
