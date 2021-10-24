import { string } from 'fp-ts'
import * as t from 'io-ts'

const str = new t.Type<string, string, unknown>(
  'string',
  (input: unknown): input is string => typeof input === 'string',
  (input, context) =>
    typeof input === 'string' ? t.success(input) : t.failure(input, context),
  t.identity
)

console.log(str.decode('a string'))
console.log(str.decode(null))


const html = new t.Type<string, string, unknown>(
  'html',
  input => typeof input === 'string' && !!input.match(/\.(xhtml))
)