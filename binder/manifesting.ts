import Path from 'path'
import { EpubLandmark } from './epub'

export type ManifestFile = {
  filename: string
  hash?: string
  type?: 'content'
  title?: string
  headings?: ManifestFileHeading[]
  pages?: ManifestFilePage[]
  landmark?: EpubLandmark
  avoidToc?: boolean
}

export type ManifestFileFullPageImage = {
  filename: string
  type: 'image'
  title: string
  avoidToc: boolean
  pages?: ManifestFilePage[]
}

export type ManifestFileHeading = {
  level: number
  title: string
  htmlTitle: string
}

export type ManifestFilePage = {
  id: string
  page: string
}

function prepManifestFile(
  file: ManifestFile | string
): ManifestFile | ManifestFileFullPageImage {
  const item = typeof file === 'string' ? { filename: file } : file
  const ext = Path.extname(item.filename)

  if (ext.match(/(jpg|png)/)) {
    return {
      filename: item.filename,
      title: Path.basename(item.filename),
      type: 'image',
      avoidToc: true,
      pages: []
    }
  }
}
