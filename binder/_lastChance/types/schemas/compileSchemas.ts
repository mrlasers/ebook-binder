import * as A from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import Fs from "fs/promises"
import { compile, compileFromFile } from "json-schema-to-typescript"
import Path from "path"

const schemaDir = __dirname
const typesDir = Path.resolve(__dirname, '../')

const schemaFiles: string[] = ['manifest.schema.json']

const result = pipe(
  schemaFiles,
  // read files
  A.map((filename) =>
    TE.tryCatch(
      () =>
        compileFromFile(Path.resolve(schemaDir, filename)).then((content) => ({
          filename: filename.split('.')[0] + '.d.ts',
          content,
        })),
      (err) => new Error(String(err))
    )
  ),
  A.map(
    TE.chain(({ filename, content }) =>
      TE.tryCatch(
        () =>
          Fs.writeFile(Path.resolve(typesDir, filename), content, {
            encoding: 'utf-8',
          }).then((_) => filename),
        () => new Error(`Error writing types to ${filename}`)
      )
    )
  ),
  A.sequence(TE.Monad)
  // write files
)

result().then(console.log)

// console.log(schemaDir)
// console.log('types:', typesDir)
