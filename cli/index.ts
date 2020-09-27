import path from 'path'
import { Command } from 'commander'
import { zipEpubFromDir } from '../lib/zip/make'
import * as Wordtract from '../lib/zip/read'
import * as Word from '../lib/word'
import * as Legacy from './legacy'
import * as IO from '../lib/fileio'
import { convertImages } from '../src/features/juryRigging/imageResize'

const program = new Command()

program
  .version('0.1.0')
  .option(
    '-r --resize <string>',
    'resize images and compress to jpeg for ebook'
  )
  .option('-l --legacy', 'enable processing of legacy tools for VBA toolchain')
  .option('-t --toc <string>', 'legacy toc heading export')
  .option('-p --process <string>', 'process Word docx (HEAD)')
  .option('-e --extract <string>', 'extract word docx and convert to html')
  .option('-b --build <string>', 'build epub from source directory')
  .option('-o --output_dir <string>', 'output directory for epub file')
  .option('-n --filename <string>', 'name for output epub file (no extension)')

program.parse(process.argv)

// if (program.build) {
//   if (program.output_dir) {
//     console.log('output dir:', program.output_dir)
//   }

// }

if (program.resize) {
  // console.log('program.resize')
  convertImages(program.resize).then(console.log).catch(console.error)
}

// ## legacy tools
if (program.legacy) {
  if (program.toc) {
    const tocFile = path.resolve(process.cwd(), program.toc)
    const outPath = path.resolve(path.dirname(tocFile), 'out')
    Legacy.toc(tocFile).then((data) => {
      console.log(data)
      // IO.writeFile(path.resolve(outPath, 'toc.html'), data.htmlToc.trim())
    })
  }
}

if (program.process) {
  const file = path.resolve(process.cwd(), program.process)
  Wordtract.read(file).then(Word.parse)
}

if (program.extract) {
  const srcPath = path.resolve(process.cwd(), program.extract)
  Wordtract.read(srcPath)
}

if (program.build) {
  const sourcePath = program.build || process.cwd()
  const filename =
    path.basename(program.filename || 'output', '.epub') + '.epub'
  const outputPath = path.resolve(
    program.output_dir || path.parse(program.build).dir,
    filename
  )

  // console.log('sourcePath:', sourcePath)
  // console.log('output_dir:', outputPath)
  // console.log('filename:', filename)

  zipEpubFromDir({ outputPath, sourcePath }).then((x) =>
    console.log('epub written')
  )
}
