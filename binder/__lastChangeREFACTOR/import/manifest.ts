import Path from 'path'
import { pipe, flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as A from 'fp-ts/Array'

import { readJson } from '../io'

import { validateManifest, isImageFilename, isHtmlFilename } from '../types'
import { Content, Image } from '../types/manifest'

export function liftFilenameString(filename: string): Content | Image {
  if (isImageFilename(filename)) {
    return {
      _tag: 'IMAGE',
      caption: Path.basename(filename, `.${filename.split('.').pop()}`),
      filename: filename
    }
  }

  if (isHtmlFilename(filename)) {
    return {
      _tag: 'CONTENT',
      filename: filename
    }
  }

  return null
}

export function readManifest(projectPath: string) {
  return pipe(
    readJson(Path.join(projectPath, 'manifest.json')),
    TE.chain(validateManifest),
    TE.map(({ metadata, files }) => ({
      metadata,
      files: files.map((f) =>
        typeof f === 'string' ? liftFilenameString(f.trim()) : f
      )
    }))
  )
}

export function something() {
  return ''
}
