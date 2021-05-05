import path from 'path'
import { promises as fs } from 'fs'
import sharp, { Sharp, OutputInfo } from 'sharp'
import * as R from 'ramda'
import * as Fsharp from './functionalSharp'

const dir = path.join(process.cwd(), '_sandbox/data/images')

const file = path.join(dir, 'image1.jpg')
const outpath = path.join(dir, 'out')

// Fs.readdir(Path.join(basepath, ...relpath))

const exifOrientationDegrees = {
  3: 180,
  6: 90,
  8: -90
}

function getFilesInDir(dir: string): Promise<[string, string[]]> {
  return fs
    .readdir(dir, { withFileTypes: true })
    .then((files) =>
      files.filter((file) => file.isFile()).map((file) => file.name)
    )
    .then((files) => [dir, files])
}

type Process = (image: Sharp, meta: sharp.Metadata) => Sharp
type Processor<Options = {}> = (options?: Options) => Process

const resizeSquare: Processor<{ width: number; padding?: number }> = (
  options
) => (image, meta) => {
  const padding = (options?.padding ?? 0) * 2

  return (
    image
      .flatten({ background: 'white' })
      .trim(25)
      .resize({
        width: options.width - padding,
        height: options.width - padding,
        fit: 'contain',
        background: 'white'
        // withoutEnlargement: false
      })
      .extend({
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
        background: 'white'
      })
      // .extend(padding)
      .toColorspace('srgb')
      .jpeg({ quality: 85 })
  )
}

const resizeForEbook: Processor<{}> = (options) => (image, meta) => {
  const maxsize = 900

  return image
    .flatten({ background: 'white' })
    .trim(25)
    .resize({
      width: maxsize,
      height: maxsize,
      fit: 'inside',
      withoutEnlargement: true
    })
    .rotate(exifOrientationDegrees[meta.orientation] ?? 0)
    .toColorspace('srgb')
    .jpeg({ quality: 65 })
}

const processImageAndSave = (process: Process) => async (
  file: string,
  outFile: string
): Promise<OutputInfo> => {
  const image = sharp(file)
  const meta = await image.metadata()

  return process(image, meta).toFile(outFile)
}

const processResizeForEbook = processImageAndSave(resizeForEbook())
const processResizeSquare = processImageAndSave(
  resizeSquare({ width: 200, padding: 5 })
)

// function formatImageAndSave(
//   filename: string,
//   indir: string,
//   outdir: string
// ): Promise<OutputInfo> | any {
//   console.log('formatImageAndSave:', filename, indir, outdir)
//   const image = sharp(path.join(indir, filename))
//   return image.metadata().then((meta) => {
//     // console.log(meta)
//     const maxwidth = 800
//     // if (meta.width <= maxwidth && meta.height <= maxwidth && meta) {
//     //   return image
//     //     .flatten({ background: 'white' })
//     //     .toColorspace('srgb')
//     //     .jpeg({ quality: 80 })
//     //     .toFile(path.join(outdir, filename.replace(/\.([a-z]+)$/, '.jpg')))
//     // }

//     const quality = (meta.width + meta.height) / 2

//     return resizeMaxForEbook(image, meta.orientation)
//       .toFile(path.join(outdir, filename.replace(/\.([a-z]+)$/, '.jpg')))
//       .then((info) => {
//         console.log(info)
//         return
//       })

//     return image
//       .flatten({ background: 'white' })
//       .trim(25)
//       .resize({
//         width: maxwidth,
//         height: maxwidth,
//         fit: 'inside',
//         withoutEnlargement: true
//       })
//       .rotate(exifOrientationDegrees[meta.orientation] ?? 0)
//       .toColorspace('srgb')
//       .jpeg({ quality: 65 })
//       .toFile(path.join(outdir, filename.replace(/\.([a-z]+)$/, '.jpg')))
//       .then((info) => {
//         console.log(info)
//         return
//       })
//   })
// }

type ImageConversionType = 'maxSize' | 'square'

export function convertImages(dir: string, type?: ImageConversionType) {
  // return Promise.resolve('nothing')
  return getFilesInDir(dir).then(([dir, files]) =>
    files.map((filename) => {
      const file = path.join(dir, filename)
      const outFile = path.join(dir, 'out', filename)
      switch (type) {
        default:
          return processResizeSquare(file, outFile)
      }
      // // formatImageAndSave(file, dir, path.join(dir, 'out'))
    })
  )
}
