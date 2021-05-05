import * as Path from 'path'
import { promises as Fs } from 'fs'
import { createCommand } from 'commander'
import { v4 as Uuid } from 'uuid'
import { format, addMinutes, formatISO } from 'date-fns'
import { getTimezoneOffset } from 'date-fns-tz'
import Chalk from 'chalk'
import Inquirer from 'inquirer'
import * as IO from '../../../lib/fileio'
import * as Fp from '../../../lib/fp'

enum ExistingDirectory {
  CANCEL = 0,
  LEAVE = 1,
  DELETE = 2
}

const defaultPackage = {
  pubId: '',
  date: {
    modified: ''
  },
  title: '',
  publisher: '',
  language: 'en-US',
  author: {
    fname: '',
    lname: '',
    fileAs: ''
  }
}

type BookBinding = typeof defaultPackage

const makePackage = (defaults: BookBinding) => (
  data: Partial<BookBinding> = {}
): BookBinding => {
  return {
    ...defaultPackage,
    ...data,
    pubId: Uuid(),
    date: {
      modified: formatDate(new Date())
    }
  }
}

function formatDate(date: Date): string {
  return format(
    addMinutes(date, date.getTimezoneOffset()),
    `yyyy-MM-dd'T'HH:mm:ss'Z'`
  )
}

export const init = createCommand('init')
  .option('-y --yes', 'use default options')
  .arguments('<dir>')
  .description('Initializes ebook project directory')
  .action((dir, options) => {
    const projectPath = Path.resolve(process.cwd(), dir)

    IO.doesDirectoryExist(projectPath)
      .catch((err) => {
        if (err && err.code === 'ENOENT') {
          console.log('directory does not exist')
        }
      })
      .then((stats) => {
        if (stats) {
          if (stats.isDirectory()) {
            return Fs.readdir(projectPath)
          }

          if (stats.isFile()) {
            console.log(
              Chalk.red('ERROR:'),
              `Non-directory file exists at destination`
            )
            process.exit()
          }

          // console.error(
          //   Chalk.red('ERROR'),
          //   'Provided directory conflicts with non-directory file'
          // )
          // return Inquirer.prompt([
          //   {
          //     type: 'confirm',
          //     name: 'newDestination',
          //     message: 'Would you like to enter a new destination directory?',
          //     default: false
          //   }
          // ])
          //   .then((answers) => {
          //     console.log(answers)
          //     return answers
          //   })
          //   .catch(console.error)
        }
      })
      .then(() => {
        return options.yes
          ? makePackage(defaultPackage)()
          : askNondefaultOptions(options)
      })
      // .then(askNondefaultOptions(options))
      .then((packageData) => {
        Fs.mkdir(Path.resolve(projectPath, 'Content')).catch(
          (err) => err.code === 'EEXIST' || console.error(err)
        )
        Fs.mkdir(Path.resolve(projectPath, 'Images')).catch(
          (err) => err.code === 'EEXIST' || console.error(err)
        )
        Fs.mkdir(Path.resolve(projectPath, 'Styles')).catch(
          (err) => err.code === 'EEXIST' || console.error(err)
        )
        return IO.writeFile(
          Path.resolve(projectPath, `binding.json`),
          JSON.stringify(packageData, null, 2)
        )
      })

    console.log(
      `Initialize project with options(${JSON.stringify(
        options
      )}) in directory ${projectPath}`
    )
  })

const requiredField = (x: any) => (!!x ? true : Chalk.red('REQUIRED'))

function askNondefaultOptions(options) {
  return (): Promise<Partial<BookBinding>> => {
    return Inquirer.prompt([
      {
        name: 'title',
        message: 'Full book title',
        type: 'input',
        validate: requiredField
      },
      {
        name: 'author',
        message: 'Author name',
        type: 'input',
        validate: requiredField,
        filter: (name) => {
          const names = name.split(/\s/)
          const fname = Fp.dropLast(names).join(' ')
          const lname = Fp.last(names)
          return {
            fname,
            lname,
            fileAs: `${lname}, ${fname}`
          }
        }
      },
      {
        name: 'publisher',
        message: 'Publisher name',
        type: 'input',
        validate: requiredField
      }
    ]).then(makePackage(defaultPackage))
  }
}

function filesExistInDir(files: string[]) {
  if (files.length) {
    return Inquirer.prompt([
      {
        name: 'existingFiles',
        message: 'Directory already contains files, continue anyway?',
        type: 'rawlist',
        choices: [
          {
            name: 'leave',
            value: ExistingDirectory.LEAVE
          },
          {
            name: 'delete',
            value: ExistingDirectory.DELETE
          },
          {
            name: 'cancel',
            value: ExistingDirectory.CANCEL
          }
        ]
      }
    ])
  }
}
