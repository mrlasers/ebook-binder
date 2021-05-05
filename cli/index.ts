import path from 'path'
import { Command } from 'commander'
import { zipEpubFromDir } from '../lib/zip/make'
import * as Wordtract from '../lib/zip/read'
import * as Word from '../lib/word'
import * as Legacy from './legacy'
import * as Text from './text'
import * as IO from '../lib/fileio'
import * as Docx from './word2slate'
import { convertImages } from '../src/features/juryRigging/imageResize'
import Hello from '@mrlasers/github-demo-package'
import { parseIncopy } from './incopy'

import * as Commands from './commands'

const program = new Command()

program
  .version('0.1.0')
  .option(
    '-r --resize <string>',
    'resize images and compress to jpeg for ebook'
  )
  .option('-rs --square <width>', 'resize images as squares')
  .option('-l --legacy', 'enable processing of legacy tools for VBA toolchain')
  .option('-t --toc <string>', 'legacy toc heading export')
  .option('-c --combine <string>', 'combine text documents [not implemented]')
  .option('--process <string>', 'process Word docx (HEAD)')
  .option('-e --extract <string>', 'extract word docx and convert to html')
  .option('-b --build <string>', 'build epub from source directory')
  .option('-o --output_dir <string>', 'output directory for epub file')
  .option('-n --filename <string>', 'name for output epub file (no extension)')
  .option('-z --word2slate <string>', 'full path to word docx file')
  .option('-h --hello', 'says hella from my github npm package')
  .option(
    '-ic --incopy <string>',
    'processes incopy xml into slatejs-style document object'
  )

// program
//   .command('init')
//   .option('-d --dir <string', 'project root directory')
//   .option('-y --yes')
//   .action((options) => {
//     console.log(`initializing project in ${JSON.stringify(options)}`)
//   })

program.addCommand(Commands.init)
program.addCommand(Commands.nav)

// program
//   .command('serve', { isDefault: true })
//   .description('launch web server')
//   .option('-p,--port <port_number>', 'web port')
//   .action((options) => {
//     console.log(`server on port ${options.port}`)
//   })

program.parse(process.argv)

if (program.command)
  if (program.opts().init) {
    console.log('initializing project')
  }

if (program.opts().incopy) {
  // console.log(`program.incopy: ${path.resolve(process.cwd(), program.incopy)}`)
  IO.readFile(path.resolve(process.cwd(), program.opts().incopy)).then(
    parseIncopy
  )
  // parseIncopy('<hello>World!</hello>')
}

if (program.opts().hello) {
  Hello()
}

if (program.opts().word2slate) {
  console.error('turned off word2slate')
  // Docx.readDocx(program.word2slate)
}

if (program.opts().resize) {
  // console.log('program.resize')
  if (program.opts().square) {
    console.log('square:', program.opts().square, program.opts().resize)
    convertImages(program.opts().resize).then(console.log).catch(console.error)
  } else {
    convertImages(program.opts().resize).then(console.log).catch(console.error)
  }
}

// ## text combination
if (program.opts().combine) {
  console.log(`combining text files in "${program.opts().combine}"`)

  const p = path.resolve(process.cwd(), program.opts().combine)
  // IO.filesInDir(path.resolve(process.cwd(), program.combine))
  IO.filesInDir(p)
    .then((names) => {
      return names.map(IO.readFile).then(Promise.all)
    })
    .then((result) => {
      console.log(`combined text: ${result}`)
      process.exit()
    })
    .catch(console.error)
}

// ## legacy tools
if (program.opts().legacy) {
  if (program.opts().toc) {
    const tocFile = path.resolve(process.cwd(), program.opts().toc)
    const outPath = path.resolve(path.dirname(tocFile), 'out')
    Legacy.toc(tocFile).then((data) => {
      console.log(data)
      // IO.writeFile(path.resolve(outPath, 'toc.html'), data.htmlToc.trim())
    })
  }
}

if (program.opts().process) {
  const file = path.resolve(process.cwd(), program.opts().process)
  Wordtract.read(file).then(Word.parse)
}

if (program.opts().extract) {
  const srcPath = path.resolve(process.cwd(), program.opts().extract)
  Wordtract.read(srcPath)
}

if (program.opts().build) {
  const sourcePath = program.opts().build || process.cwd()
  const filename =
    path.basename(program.opts().filename || 'output', '.epub') + '.epub'
  const outputPath = path.resolve(
    program.opts().output_dir || path.parse(program.opts().build).dir,
    filename
  )

  // console.log('sourcePath:', sourcePath)
  // console.log('output_dir:', outputPath)
  // console.log('filename:', filename)

  zipEpubFromDir({ outputPath, sourcePath }).then((x) =>
    console.log('epub written')
  )
}
