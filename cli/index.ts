import path from 'path'
import { Command } from 'commander'
import { zipEpubFromDir } from '../lib/zip/make'

const program = new Command()

program
  .version('0.0.1')
  .option('-b --build <string>', 'build epub from source directory')
  .option('-o --output_dir <string>', 'output directory for epub file')
  .option('-n --filename <string>', 'name for output epub file (no extension)')

program.parse(process.argv)

// if (program.build) {
//   if (program.output_dir) {
//     console.log('output dir:', program.output_dir)
//   }

// }

const sourcePath = program.build || process.cwd()
const filename = path.basename(program.filename || 'output', '.epub') + '.epub'
const outputPath = path.resolve(
  program.output_dir || path.parse(program.build).dir,
  filename
)

// console.log('sourcePath:', sourcePath)
// console.log('output_dir:', outputPath)
// console.log('filename:', filename)

zipEpubFromDir({ outputPath, sourcePath }).then(console.log)
