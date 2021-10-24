import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

type Options = {
  name: string
  age: number
}

pipe(
  ({ name }: Options) => `Hello, ${name}!`,
  O.of,
  O.ap(O.of({ name: 'World', age: 13 })),
  console.log
)
