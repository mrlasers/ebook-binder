import JSZip from 'jszip'
import * as Path from 'path'
import { promises as Fs } from 'fs'
import * as FS from 'fs'
import { spawn } from 'child_process'

const zip = new JSZip()

const path =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\G\\Girl Friday Productions\\The Other Side of Success\\build\\epub'

const outpath = Path.join(
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\G\\Girl Friday Productions\\The Other Side of Success\\build',
  'the-other-side-of-success.epub'
)

// # gets the files in give basepath, recursively adding
//   files found in subdirectories
const getFilesInDir = async (basepath, relpath: string[]) => {
  // gets all the files in the directory 'basepath'
  const files = await Fs.readdir(Path.join(basepath, ...relpath))

  // maps those files to either relpath+file or to another pass of directory
  const mappedFiles = await Promise.all(
    files.map(async (file) => {
      const isFile = !(
        await Fs.stat(Path.join(basepath, ...relpath, file))
      ).isDirectory()

      return isFile
        ? [...relpath, file].join('/')
        : getFilesInDir(basepath, [...relpath, file])
    })
  )

  // flatten the map
  return mappedFiles
    .reduce((acc, file) => {
      if (typeof file === 'string') {
        return [...acc, file]
      }
      return [...acc, ...file]
    }, [])
    .filter((f) => f !== 'mimetype')
}

// # retrieves file data and returns tuple of [filename: string, data: unknown]
async function getFileData(path: string, file: string) {
  const data = await Fs.readFile(Path.join(path, file))

  return [file, data]
}

// # runs the file zipping process
export async function zipEpubFromDir({ outputPath, sourcePath }) {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', {
    compression: 'STORE'
  })

  const pFilesInDir = await getFilesInDir(sourcePath, [])

  const filesAndData = await Promise.all(
    pFilesInDir.map((file) => getFileData(sourcePath, file))
  )

  // map :: string -> [string, buffer?]
  filesAndData.forEach(([file, data]) => zip.file(file, data))

  return zip
    .generateNodeStream({
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    })
    .pipe(FS.createWriteStream(outputPath))

  // spawn('java', ['-jar', '../_sandbox/epubcheck-4.2.4', zippath]).stdin.on(
  //   'data',
  //   (data) => {
  //     console.log(data)
  //   }
  // )
}

// ### temporary production calls that we needed to make
// const isbnpath =
//   'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/Chris Patillo book/original/IAW_epub-ipad-round4'

// const noisbnpath =
//   'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/Chris Patillo book/original/IAW_epub-ipad-round4 - no isbn'

// zipEpub('I Am We - Christine Pattillo.epub', isbnpath).then((_) => console.log('done!'))
// zipEpub('I Am We - Christine Pattillo (no ISBN).epub', noisbnpath).then((_) => console.log('done!'))

// zipEpubFromDir(outpath, path).then((_) => console.log('done!'))
