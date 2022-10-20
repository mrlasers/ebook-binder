import * as Ajv from "ajv"
import Ajv2020 from "ajv/dist/2020"
import * as A from "fp-ts/Array"
import * as E from "fp-ts/Either"
import { flow, pipe } from "fp-ts/function"
import { isBoolean } from "fp-ts/lib/boolean"
import * as TE from "fp-ts/TaskEither"
import Fs from "fs/promises"
import { compile, compileFromFile } from "json-schema-to-typescript"
import Path from "path"

import { manifestPath } from "../paths"
import { readJson } from "../readWrite"
import { Config, Err, NormalizedConfig, TOCLimit } from "./"
import {
  Content,
  Factory,
  Font,
  Image,
  Manifest,
  Section,
  Styles,
} from "./manifest"

const ajv = new Ajv2020()

export interface ValidateFunction<T> extends Ajv.ValidateFunction {
  _t?: T
}

export function makeValidator<T>(schema: object): ValidateFunction<T> {
  return ajv.compile(schema)
}

export function isValid<T>(
  validator: ValidateFunction<T>,
  candidate: any
): candidate is T {
  if (validator(candidate)) {
    return true
  }

  console.log(validator.errors)

  return false
}

export function isValidTE<T>(validator: ValidateFunction<T>) {
  return (candidate: any): TE.TaskEither<Err.MyError, T> => {
    if (validator(candidate)) {
      return TE.of(candidate as T)
    }

    return TE.left(Err.MyError.of(JSON.stringify(validator.errors[0])))
  }
}

const validateManifestFiles = makeValidator<Manifest>(
  require('./schemas/manifest.schema.json')
)

export const validManifest = isValidTE(validateManifestFiles)

const isValidManifestFilesTE = (
  json: any
): TE.TaskEither<Err.MyError, Manifest> => {
  return isValid(validateManifestFiles, json)
    ? TE.of(json)
    : TE.left(Err.MyError.of(`Error in JSON manifest`))
}

console.log(manifestPath)
const result = pipe(
  readJson(manifestPath),
  TE.chain(isValidTE(validateManifestFiles)),
  TE.map((manifest) => {
    const meta = manifest.metadata
    return {
      ...manifest,
      files: manifest.files
        .map((file) => {
          if (typeof file === 'string') {
            if (!!file.trim().match(/\.(xhtml|html|htm)$/)) {
              return {
                filename: file,
              } as Content
            }

            if (!!file.trim().match(/\.(jpeg|jpg|png|gif)$/)) {
              return {
                filename: file,
              } as Image
            }

            return null
          }
          return file
        })
        .filter(Boolean),
    }
  }),
  TE.map((manifest) => {})
)

export const normalizeConfigTOC = (toc: TOCLimit): number[] => {
  //   console.log(`
  // ======================================================
  // normalizeConfigTOC(incoming toc) :: ${toc}
  // ======================================================
  // `)
  if (typeof toc === 'number') {
    return new Array(toc + 1).fill(0).map((_, i) => i)
  }

  if (Array.isArray(toc)) {
    return toc.sort((a, b) => (a > b ? 1 : -1))
  }

  if (!!toc?.minimum) {
    const minimum = toc.minimum < toc.maximum ? toc.minimum : toc.maximum
    const maximum = toc.maximum > toc.minimum ? toc.maximum : toc.minimum

    return new Array(Math.abs(minimum - maximum))
      .fill(0)
      .map((_, i) => minimum + i)
  }

  const tocLevels = new Array(11).fill(0).map((_, i) => i)

  //   console.log(`
  // ======================================================
  // normalizeConfigTOC(tocLevels) :: ${tocLevels}
  // ======================================================
  // `)

  return tocLevels
}

export const normalizeConfig = (config: Config = {}): NormalizedConfig => {
  return {
    ...config,
    toc: normalizeConfigTOC(config.toc),
  }
}

export const loadManifest = (manifestPath: string) =>
  pipe(
    readJson(manifestPath),
    TE.chain(isValidTE(validateManifestFiles)),
    TE.map((manifest) => {
      return {
        metadata: manifest.metadata,
        paths: manifest.paths || {},
        config: normalizeConfig(manifest.config),
        files: manifest.files
          .map(
            (
              file
            ): Required<
              Image | Content | Section | Factory | Styles | Font
            > => {
              if (typeof file === 'string') {
                if (!!file.trim().match(/\.(xhtml|html|htm)$/)) {
                  return {
                    _tag: 'CONTENT',
                    filename: file.trim(),
                    bodyClass: null,
                    landmark: null,
                    title: null,
                    toc: true,
                  }
                }

                if (!!file.trim().match(/\.(jpeg|jpg|png|gif)$/)) {
                  return {
                    _tag: 'IMAGE',
                    filename: file.trim(),
                    caption: null,
                    illustration: false,
                    landmark: null,
                    level: 0,
                    toc: false,
                    pageNumber: null,
                  }
                }

                if (!!file.trim().match(/\.css$/)) {
                  return {
                    _tag: 'STYLES',
                    filename: file.trim(),
                  }
                }

                if (!!file.trim().match(/\.(otf|ttf|woff)$/)) {
                  return {
                    _tag: 'FONT',
                    filename: file.trim(),
                  }
                }

                return null
              }

              switch (file._tag) {
                default:
                  return null
                case 'IMAGE':
                  return {
                    _tag: 'IMAGE',
                    caption: file.caption || '',
                    filename: file.filename.trim(),
                    illustration: file.illustration || null,
                    landmark: file.landmark || null,
                    level: file.level || 0,
                    toc: file.toc || false,
                    pageNumber: file.pageNumber || null,
                  }
                case 'CONTENT':
                  return {
                    _tag: 'CONTENT',
                    bodyClass: file.bodyClass || null,
                    filename: file.filename.trim(),
                    landmark: file.landmark || null,
                    title: file.title || null,
                    toc: isBoolean(file.toc) ? file.toc : true,
                  }
                case 'SECTION':
                  return {
                    _tag: 'SECTION',
                    filename: file.filename.trim(),
                    landmark: file.landmark || null,
                    level: file.level || 0,
                    navlevel: file.navlevel || 0,
                    title: file.title || '',
                    toc: isBoolean(file.toc) ? file.toc : true,
                    pageNumber: file.pageNumber || null,
                  }
                case 'FACTORY':
                  return {
                    _tag: 'FACTORY',
                    bodyClass: file.bodyClass || null,
                    factory: file.factory,
                    filename: file.filename.trim(),
                    landmark: file.landmark || null,
                    title: file.title || '',
                    toc: file.toc || false,
                    pageNumber: file.pageNumber || null,
                  }
              }
            }
          )
          .filter(Boolean),
      }
    })
  )

// result().then(console.log)
