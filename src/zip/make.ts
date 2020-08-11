import JSZip from 'jszip'
import * as Path from 'path'
import { promises as Fs } from 'fs'
import * as FS from 'fs'

const zip = new JSZip()

const path = 'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/Chris Patillo book/original/IAW_epub-ipad-round4'

const outpath = Path.join(process.cwd(), '_sandbox', 'data', 'testepub')

// # gets the files in give basepath, recursively adding
//   files found in subdirectories
const getFilesInDir = async (basepath, relpath: string[]) => {
  // gets all the files in the directory 'basepath'
  const files = await Fs.readdir(Path.join(basepath, ...relpath))

  // maps those files to either relpath+file or to another pass of directory
  const mappedFiles = await Promise.all(
    files.map(async (file) => {
      const isFile = !(await Fs.stat(Path.join(basepath, ...relpath, file))).isDirectory()

      return isFile ? [...relpath, file].join('/') : getFilesInDir(basepath, [...relpath, file])
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
async function zipEpub(zippath, path, relpath = []) {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', {
    compression: 'STORE'
  })

  const pFilesInDir = await getFilesInDir(path, relpath)

  const filesAndData = await Promise.all(pFilesInDir.map((file) => getFileData(path, file)))

  // map :: string -> [string, buffer?]
  filesAndData.forEach(([file, data]) => zip.file(file, data))

  return zip
    .generateNodeStream({
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    })
    .pipe(FS.createWriteStream(zippath))
}

// ### temporary production calls that we needed to make
// const isbnpath =
//   'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/Chris Patillo book/original/IAW_epub-ipad-round4'

// const noisbnpath =
//   'C:/Users/timot/OneDrive/MrLasers/Projects/M/Mi Ae Lipe/Chris Patillo book/original/IAW_epub-ipad-round4 - no isbn'

// zipEpub('I Am We - Christine Pattillo.epub', isbnpath).then((_) => console.log('done!'))
// zipEpub('I Am We - Christine Pattillo (no ISBN).epub', noisbnpath).then((_) => console.log('done!'))
