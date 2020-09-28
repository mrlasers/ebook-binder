import path from 'path'
import { promises as fs } from 'fs'
import sharp, { Sharp, OutputInfo } from 'sharp'

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

function formatImageAndSave(
  filename: string,
  indir: string,
  outdir: string
): Promise<OutputInfo> | any {
  console.log('formatImageAndSave:', filename, indir, outdir)
  const image = sharp(path.join(indir, filename))
  return image.metadata().then((meta) => {
    // console.log(meta)
    const maxwidth = 800
    // if (meta.width <= maxwidth && meta.height <= maxwidth && meta) {
    //   return image
    //     .flatten({ background: 'white' })
    //     .toColorspace('srgb')
    //     .jpeg({ quality: 80 })
    //     .toFile(path.join(outdir, filename.replace(/\.([a-z]+)$/, '.jpg')))
    // }

    const quality = (meta.width + meta.height) / 2

    return image
      .flatten({ background: 'white' })
      .trim(25)
      .resize({
        width: maxwidth,
        height: maxwidth,
        fit: 'inside',
        withoutEnlargement: true
      })
      .rotate(exifOrientationDegrees[meta.orientation] ?? 0)
      .toColorspace('srgb')
      .jpeg({ quality: 65 })
      .toFile(path.join(outdir, filename.replace(/\.([a-z]+)$/, '.jpg')))
      .then((info) => {
        console.log(info)
        return
      })
  })
}

export function convertImages(dir: string) {
  return getFilesInDir(dir).then(([dir, files]) =>
    files.map((file) => formatImageAndSave(file, dir, path.join(dir, 'out')))
  )
}

// convertImages(dir).then(console.log)

// fs.readFile(file)
//   .then((buff) => sharp(buff))
//   .then((image) =>
//     image.metadata().then((meta) =>
//       image
//         .rotate(exifOrientationDegrees[meta.orientation] ?? 0)
//         .resize({ width: 900, fit: 'inside', withoutEnlargement: true })
//         .jpeg({ quality: 70 })
//         // .toBuffer()
//         .toFile(path.join(outpath, 'image1.jpg'))
//     )
//   )
//   // .then((imgData) => {
//   //   return fs.writeFile(ofile, imgData, { encoding: 'binary' })
//   // })
//   .then(() => console.log('Done!'))
