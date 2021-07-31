import * as E from 'fp-ts/Either'

it('compares some Eithers', () => {
  expect(E.of('abc')).toEqual(E.right('abc'))
})
