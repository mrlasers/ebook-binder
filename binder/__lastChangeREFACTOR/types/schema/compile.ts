import Fs from 'fs/promises'
import Path from 'path'
import { compile, compileFromFile } from 'json-schema-to-typescript'
import { pipe, flow } from 'fp-ts/function'
import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'

const schemaDir = __dirname
const typesDir = Path.resolve(__dirname, '../')

const schemaFiles: string[] = ['manifest.schema.json']

// compileFromFile('./binder/_sb/test.schema.json', {}).then((ts) =>
//   Fs.writeFile('./binder/_sb/test.d.ts', ts, { encoding: 'utf-8' }).then((_) =>
//     console.log('test.d.ts writting to disk')
//   )
// )

const result = pipe(
  schemaFiles,
  // read files
  A.map((filename) =>
    TE.tryCatch(
      () =>
        compileFromFile(Path.resolve(schemaDir, filename)).then((content) => ({
          filename: filename.split('.')[0] + '.d.ts',
          content
        })),
      (err) => new Error(String(err))
    )
  ),
  A.map(
    TE.chain(({ filename, content }) =>
      TE.tryCatch(
        () =>
          Fs.writeFile(Path.resolve(typesDir, filename), content, {
            encoding: 'utf-8'
          }).then((_) => filename),
        () => new Error(`Error writing types to ${filename}`)
      )
    )
  ),
  A.sequence(TE.Monad)
)

result().then(console.log)
