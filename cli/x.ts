import Path from 'path'
import { promises as Fs } from 'fs'

const promiseAll = (proms) => Promise.all(proms)

type ReadDirOptions = {
  extension?: string
  recurse?: false
}

export const readFilesInDir = (path: string, options?: ReadDirOptions) => {
  return Fs.readdir(path)
    .then((filenames) => {
      return filenames
        .filter((filename) => {
          return options?.extension
            ? filename.match(new RegExp(`.${options?.extension}$`))
            : true
        })
        .map((filename) => Path.resolve(path, filename))
        .map((file) => {
          return Fs.stat(file).then((f) =>
            f.isDirectory()
              ? ''
              : Fs.readFile(file, { encoding: 'utf8' }).catch(console.error)
          )
        })
    })
    .then(promiseAll)
    .then((texts) => texts.join('\n\n'))
    .then((text) => {
      return Fs.writeFile(Path.resolve(path, '__output.txt'), text, 'utf8')
    })
}

// test stuff
const p =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\K\\Katherine Kirkpatrick\\Escape Across the Wide Sea\\working\\ocr-cleanup'

readFilesInDir(p).then(console.log).catch(console.error)
