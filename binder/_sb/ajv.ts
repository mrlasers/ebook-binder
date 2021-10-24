import Fs from 'fs/promises'
import Path from 'path'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'

import { compile, compileFromFile } from 'json-schema-to-typescript'
import * as Ajv from 'ajv'
import Ajv2020 from 'ajv/dist/2020'

import { BigBoySchema } from './test'
import { pipe, flow } from 'fp-ts/function'

const ajv = new Ajv2020()

const bigBoySchemaObj = require('./test.schema.json')

const bigBoySchema = ajv.compile(require('./test.schema.json'))

// const isValidBigBoy = isValid(makeValidator<BigBoySchema>(bigBoySchema))

// function isValidBigBoy(candidate: any): candidate is BigBoySchema {
//   return bigBoySchema(candidate) === true
// }

function _validateBigBoy(candidate: any): E.Either<string, BigBoySchema> {
  if (isValidBigBoy(candidate)) {
    return E.of(candidate)
  }

  return E.left('oops, not a big boy')
}

//===== trying to figure out how this is supposed to work
export interface ValidateFunction<T> extends Ajv.ValidateFunction {
  _t?: T
}

export function makeValidator<T>(schema: object): ValidateFunction<T> {
  return ajv.compile(schema)
}

export function isValid<T>(validator: ValidateFunction<T>) {
  return (candidate: any): candidate is T => {
    return validator(candidate) === true
  }
}

const validateBigBoy = makeValidator<BigBoySchema>(bigBoySchemaObj)
//====================================================================

// compileFromFile('./binder/_sb/test.schema.json', {}).then((ts) =>
//   Fs.writeFile('./binder/_sb/test.d.ts', ts, { encoding: 'utf-8' }).then((_) =>
//     console.log('test.d.ts writting to disk')
//   )
// )

const isValidBigBoy = isValid(validateBigBoy)

const butt = JSON.parse(`{ "boo": "strawberry" }`)

function validBigBoy(boi: any): E.Either<string, BigBoySchema> {
  if (isValidBigBoy(boi)) return E.of(boi)
  return E.left(`wasn't a big boy`)
}

const result = isValidBigBoy(butt)

console.log('result:', result)
