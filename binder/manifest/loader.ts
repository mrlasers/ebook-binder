import { pipe, flow } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'

import {
  ManifestFileItem,
  FileItem,
  isManifestFileItem,
  ManifestFileItemTask
} from '../types'
import { readFile as _readFile } from '../lib'

export function normalize(item: string | ManifestFileItem): ManifestFileItem {
  return isManifestFileItem(item) ? item : { filename: item }
}

export function loadManifestFileItemHtml(
  item: ManifestFileItem,
  readFile = _readFile
): ManifestFileItemTask {
  return pipe(
    item.filename,
    readFile,
    TE.map((html) => {
      return { ...item, html }
    })
  )
}

export function loadManifestFileItem(path: string) {
  return (item: ManifestFileItem): ManifestFileItemTask => {
    if (!!item.filename.match(/\.(jpg|png)/)) {
      return TE.left(new Error(`Not handling images atm: ${item.filename}`))
    }

    return loadManifestFileItemHtml(item)
  }
}

export function fileItem(
  item: string | ManifestFileItem
): O.Option<ManifestFileItem> {
  if (typeof item === 'string') {
    return O.of({ filename: item })
  }

  if (isManifestFileItem(item)) {
    return O.of(item)
  }

  return O.none
}
