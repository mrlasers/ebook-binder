import { TaskEither } from 'fp-ts/TaskEither'
import { Key } from './'
import { EpubLandmark } from '../epub'

export type FileItem = {
  html: string
  headings?: any[]
  pages?: any[]
}

export type ManifestFileItem = {
  filename: string
  title?: string
  landmark?: string
  avoidToc?: boolean
}

export type ManifestFileItemTask = TaskEither<Error, ManifestFileItem>

export function isManifestFileItem(item: any): item is ManifestFileItem {
  return typeof (item as ManifestFileItem).filename === 'string'
}

/* kinda old stuff that's probably not good */

export type ManifestFileHeading = {
  level: number
  text: string
  html: string
  id: string
}

export type ManifestFilePage = {
  id: string
  page: string
}

export type ManifestFileContent = {
  filename: string
  title?: string
  landmark?: EpubLandmark
  [key: Key]: any
}

export type ManifestFileImage = {
  filename: string
  title: string
  landmark?: EpubLandmark
  illustration?: boolean
  avoidToc?: boolean
}

export type ManifestItem = {
  filename: string
  [key: Key]: any
}

export type Uuid = string

export type ManifestMetaData = {
  title: string
  pubId: Uuid
  author: string
  publisher: string
}

export type Manifest = {
  metadata: ManifestMetaData
  files: ManifestItem
}
