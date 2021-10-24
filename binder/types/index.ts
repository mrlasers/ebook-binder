export * from './manifest'
export * from './footnotes'
export * as FilesTypes from './fileItems'

export type Key = string | number | symbol

export interface Extractor<T = {}> {
  (doc: string | { html: string; [key: Key]: any }): {
    html: string
    [key: Key]: any
  } & T
}
