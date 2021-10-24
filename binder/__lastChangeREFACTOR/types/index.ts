export * as Err from './error'
export * from './footnotes'
// export * from './manifest'
export * from './validate'
export * from './exporter'

import { Section, Content, Image, Factory } from './manifest'
export { Section, Content, Image, Factory } from './manifest'

export type Input = Section | Content | Image | Factory

export const isImageInput = (input: Input): input is Image =>
  input._tag === 'IMAGE'

export const isContentInput = (input: Input): input is Content =>
  input._tag === 'CONTENT'

export const isSectionInput = (input: Input): input is Section =>
  input._tag === 'SECTION'

export const isFactoryInput = (input: Input): input is Factory =>
  input._tag === 'FACTORY'
