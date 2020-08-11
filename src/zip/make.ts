import JSZip from 'jszip'
import * as Path from 'path'
import { promises as Fs } from 'fs'
import * as FS from 'fs'

const zip = new JSZip()

const path = 'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/Chris Patillo book/original/IAW_epub-ipad-round4'

const outpath = process.cwd()

// const map = (fun) => (obj) => obj.map(fun)

// /*
//     1. Get files in base dir
//     2. Make list of files with path
//     2. For each file
//         a. Is directory?
//             i. return to 2?
//         b. Add to zip?
// */

// const _getFile = (basePath: string) => file => {
//   return Fs.read
// }

export const pathToFileList = (basePath)  =>

// Fs.readdir(path)
//   //   .then((files) => files.map((file) => Path.join(path, file)))
//   //   .then((files) => Promise.all(files.map(Fs.stat)))
//   //   .then((files) => files.map((f) => f.isDirectory()))
//   .then(console.log)

// this is how we're going to write the zip archive
// zip
//   .file('hello.txt', 'Hello, World!')
//   .generateNodeStream()
//   .pipe(FS.createWriteStream('test.zip'))
//   .on('finish', () => console.log('zip written?'))
