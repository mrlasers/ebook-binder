import sharp, {
  Sharp,
  FlattenOptions,
  RotateOptions,
  ResizeOptions,
  JpegOptions,
  OutputInfo
} from 'sharp'

export const flatten = (flatten?: boolean | FlattenOptions) => (sharp: Sharp) =>
  sharp.flatten(flatten)

export const trim = (threshold?: number) => (sharp: Sharp) =>
  sharp.trim(threshold)

export const resize = (
  // width?: number | null,
  // height?: number | null,
  options: ResizeOptions
) => (sharp: Sharp) => sharp.resize(options)

export const rotate = (angle?: number, options?: RotateOptions) => (
  sharp: Sharp
) => sharp.rotate(angle, options)

export const toColorspace = (colorspace: string) => (sharp: Sharp) =>
  sharp.toColorspace(colorspace)

export const jpeg = (options?: JpegOptions) => (sharp: Sharp) =>
  sharp.jpeg(options)

export const toFile = (
  fileOut: string
) => (sharp: Sharp): Promise<OutputInfo> => sharp.toFile(fileOut)
