import { createCommand, InvalidOptionArgumentError } from 'commander'
import Path from 'path'
import Fs from 'fs/promises'
import { map, filter } from '../../../lib/fp'

function cwdPath(path: string) {
  return Path.resolve(process.cwd(), path)
}

function trace(msg: string = '') {
  return (obj: any) => {
    console.log(msg.length ? `${msg.trim()}: ${obj}` : obj)
    return obj
  }
}

const onlyJPEGs = filter((x) => x.isFile() && x.name.match(/\.jpg$/))

const newName = (name: string, num: number) =>
  `${num.toString().padStart(3, '0')}-${name.replace(/ /g, '_')}`

function myParseInt(value, dummyPrevious) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new InvalidOptionArgumentError('Not a number.')
  }
  return parsedValue
}

export const rename = createCommand('rename')
  .description('Rename files in directory')
  .arguments('<directory>')
  .option('--start <number>', `First number for number`, myParseInt, `1`)
  .action((directory, options) => {
    let count = options.start

    console.log(`OPTIONS: ${JSON.stringify(options)}`)

    Promise.resolve(directory)
      .then(cwdPath)
      // .then(trace(`Renaming files in `))
      .then((dir) => {
        return Fs.readdir(dir, { withFileTypes: true })
          .then(onlyJPEGs)
          .then(map((x) => x.name))
          .then(
            map((file) => {
              return {
                old: Path.resolve(dir, file),
                new: Path.resolve(dir, `renamed`, newName(file, count++))
              }
            })
          )
          .then(
            map((file) => {
              return Fs.readFile(file.old).then((data) => {
                return Fs.writeFile(file.new, data)
              })
            })
          )
      })
    // .then(trace())
  })
