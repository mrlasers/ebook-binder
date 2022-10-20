import * as Manifest from "./manifest"

export * as Err from './errors'
export * from './footnotes'
export * from './outputTuples'

export { FilePaths, Config, TOCLimit } from './manifest'

export type Html = string
export type FilePath = string

export type GeneratedOutputTypes = 'CONTENT' | 'NCX' | 'NAVDOC' | 'OPF'

export type GeneratedOutput<
  Type extends GeneratedOutputTypes = GeneratedOutputTypes
> = {
  operation: 'WRITE'
  type: Type
  title?: string
  content: Html | string
  destination: FilePath
}

export type NormalizedConfig = {
  toc: number[]
  variant?: string
}

export function isGeneratedOutput(output: Output): output is GeneratedOutput {
  return (
    output.operation === 'WRITE' &&
    ['CONTENT', 'NCX', 'NAVDOC', 'OPF'].includes(output.type)
  )
}

export function isGeneratedContent(
  output: Output
): output is GeneratedOutput<'CONTENT'> {
  return output.operation === 'WRITE' && output.type === 'CONTENT'
}

export type CopiedOutput = {
  operation: 'COPY'
  type: 'IMAGE'
  title?: string
  source: FilePath
  destination: FilePath
}

export type Output = GeneratedOutput | CopiedOutput

export type Metadata = Manifest.Metadata

export type InputImage = Required<Manifest.Image>
export type InputContent = Required<Manifest.Content>
export type InputSection = Required<Manifest.Section>
export type InputFactory = Required<Manifest.Factory>
export type InputStyles = Required<Manifest.Styles>
export type InputFont = Required<Manifest.Font>

export type FileInput =
  | Manifest.Image
  | Manifest.Content
  | Manifest.Section
  | Manifest.Factory
  | Manifest.Styles
  | Manifest.Font
