import Path from 'path'
import { promises as Fs } from 'fs'

export const doesDirectoryExist = (directory: string) => Fs.stat(directory)

export const readFile = (filename: string) => {
  return Fs.readFile(filename, { encoding: 'utf8' })
}

export const writeFile = (filename: string, content: string) => {
  return Fs.writeFile(filename, content, { encoding: 'utf8' })
}

export const filesInDir = async (
  path: string,
  relpath: string[] = [],
  recursive: boolean = false
) => {
  const files = await Fs.readdir(Path.join(path, ...relpath))

  const mappedFiles = await Promise.all(
    files
      .map(async (file) => {
        const isFile = !(
          await Fs.stat(Path.join(path, ...relpath, file))
        ).isDirectory()

        return isFile
          ? Path.join(...relpath, file) //[...relpath, file].join('/')
          : recursive
          ? filesInDir(path, [...relpath, file], recursive)
          : null
      })
      .filter(Boolean)
  )

  return mappedFiles
}
