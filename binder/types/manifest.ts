import { TaskEither } from 'fp-ts/TaskEither'
import { Key } from './'
import { EpubLandmark } from '../epub'
import { FootnoteItems } from './'

export type Manifest = {
  metadata: ManifestMetaData
  files: ManifestItem[]
}

export type ManifestItem = ImageItem | SectionItem | ContentItem | ErrorItem

export interface Configuration {
  rootPath: string
  metadata: any
  files: Item[]
  footnotes: FootnoteItems[]
}

export interface Item {
  _tag?: string
  filename?: string
  [key: string]: any
}

export interface ErrorItem extends Item {
  _tag: 'ERROR'
  item: Item
  message?: string
}

export function isErrorItem(item: any): item is ErrorItem {
  const $item = item as ErrorItem
  return $item._tag === 'ERROR' && $item.message !== undefined
}

export function isItem(item: any): item is Item {
  return (
    (item as Item).filename !== undefined &&
    typeof (item as Item).filename === 'string'
  )
}

export interface ImageItem extends Item {
  _tag: 'IMAGE'
  title: string
  landmark?: string
  avoidToc?: boolean
}

export interface SectionItem extends Item {
  _tag: 'SECTION'
  title: string
  level: number
  landmark?: string
  avoidToc?: boolean
}

export function isFilenameImage(filename: string): boolean {
  return !!filename.match(/\.(jpg|png|gif|svg)/)
}

export function isSectionItem(item: any): item is SectionItem {
  return (
    isItem(item) &&
    isFilenameImage(item.filename) &&
    typeof item?.level === 'number' &&
    typeof item?.title === 'string'
  )
}

export function isImageItem(item: any): item is ImageItem {
  const $item = item as ImageItem
  return isItem(item) && $item.title !== undefined
}

export interface ContentItem extends Item {
  _tag: 'CONTENT'
  headings?: FileItemHeading[]
  pages?: PageReference[]
}

export interface PageReference {
  id: string
  page: string
}

// old but still might be needed to keep things from breaking
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

export type Uuid = string

export type ManifestMetaData = {
  title: string
  pubId: Uuid
  author: string
  publisher: string
}
