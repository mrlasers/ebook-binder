import * as Ajv from 'ajv'
import Ajv2020 from 'ajv/dist/2020'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { Monad } from 'fp-ts/Monad'

import { z } from 'zod'

import { Err } from '.'
import { Manifest, Section } from './manifest'
import { isNumber } from 'fp-ts/lib/number'

const ajv = new Ajv2020()

export interface ValidateFunction<T> extends Ajv.ValidateFunction {
  _t?: T
}

export function makeValidator<T>(schema: object): ValidateFunction<T> {
  return ajv.compile(schema)
}

export const manifestValidator = makeValidator<Manifest>(
  require('./schema/manifest.schema.json')
)

export const sectionValidator = makeValidator<Section>(
  require('./schema/manifest.schema.json')
)

export function validate<T>(validator: ValidateFunction<T>) {
  return (candidate: any): TE.TaskEither<Error, T> => {
    if (validator(candidate)) {
      return TE.of(candidate as T)
    }

    return TE.left(
      Err.JsonValidationError.of(JSON.stringify(validator.errors[0]))
    )
  }
}

export const validateManifest = validate(manifestValidator)

export const isImageFilename = (filename: string): boolean =>
  !!filename.trim().match(/\.(jpg|jpeg|gif|png)$/)
export const isHtmlFilename = (filename: string): boolean =>
  !!filename.trim().match(/\.(xhtml|html|htm)$/)

// export const hasTitle = (obj: any) => typeof obj.title === 'string'
// export const hasLevel = (obj: any) =>
//   typeof obj.level === 'undefined' || isNumber(obj.level)
// export const hasPageNumber = (obj: any) => typeof obj.pageNumber === 'undefined'

// export function isSection(file: any): file is Section {
//   const $file = file as Section

//   if ($file._tag !== 'SECTION') return false
//   if (!isImageFilename($file.filename)) return false
//   if (!hasTitle($file)) return false
//   // if (typeof $file.title !== 'string') return false
//   if ($file.level && !isNumber($file.level)) return false
//   if ($file.landmark && typeof $file.landmark !== 'string') return false
//   if ($file.pageNumber && typeof $file.pageNumber !== 'string') return false

//   return true
// }
