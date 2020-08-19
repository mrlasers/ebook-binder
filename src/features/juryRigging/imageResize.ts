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
): Promise<OutputInfo> {
  const image = sharp(path.join(indir, filename))
  return image.metadata().then((meta) => {
    return image
      .rotate(exifOrientationDegrees[meta.orientation] ?? 0)
      .resize({ width: 900, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toFile(path.join(outdir, filename.replace(/\.([a-z]+)$/, '.jpg')))
  })
}

function convertImages(dir: string) {
  return getFilesInDir(dir).then(([dir, files]) =>
    files.map((file) => formatImageAndSave(file, dir, path.join(dir, 'out')))
  )
}

convertImages(dir).then(console.log)

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
