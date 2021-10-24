export type HTML = string
export type EpubLandmark = string

export interface FileOutput {
  _tag: 'HTML'
  filename: string
  title: string
  body: HTML
  landmark?: EpubLandmark
  toc?: boolean
  level?: number
}

export type Heading = {
  id: string | null
  text: string
  html: HTML
  level: number
  toc?: boolean
  landmark?: string
}
