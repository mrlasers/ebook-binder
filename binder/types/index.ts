export * from './manifest'

export type Key = string | number | symbol

export interface Extractor<T = {}> {
  (doc: string | { html: string; [key: Key]: any }): {
    html: string
    [key: Key]: any
  } & T
}

export type FootnoteItems = {
  [key: string]: string[]
}
