import { promises as fs } from 'fs'

export const readFile = (filename: string) => {
  return fs.readFile(filename, { encoding: 'utf8' })
}

export const writeFile = (filename: string, content: string) => {
  return fs.writeFile(filename, content, { encoding: 'utf8' })
}
