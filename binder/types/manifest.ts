import { TaskEither } from 'fp-ts/TaskEither'
import { Key } from './'
import { EpubLandmark } from '../epub'

export interface Item {
  filename: string
}

export function isItem(item: any): item is Item {
  return (
    (item as Item).filename !== undefined &&
    typeof (item as Item).filename === 'string'
  )
}

export type FileItem = {
  html?: string
  filename?: string
  headings?: FileItemHeading[]
  pages?: any[]
  footnotes?: any[]
}

export type FileItemHeading = {
  id: string
  level: number
  text: string
  html: string
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
  files: ManifestItem[]
}
