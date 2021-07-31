import Path from 'path'
import { format } from 'date-fns'
import { createCommand } from 'commander'
import * as IO from '../../../lib/fileio'
import { zipEpubFromDir } from '../../../lib/zip/make'
import { fromOptions } from 'fp-ts/lib/These'
import { symmetricDifference } from 'ramda'

export const build = createCommand('build')
  .description('Build epub file from unzipped directory')
  .arguments('<srcDir>')
  .option('-n --name <filename>', 'Output basename')
  .option('--nodate', `Don't append date (-yyyyMMdd) to end of file`)
  .action((sourcePath, options) => {
    const filename = [
      !options.name ? 'output' : options.name.trim().replaceAll(/\s+/g, '-'),
      options.nodate ? '' : format(new Date(), `yyyyMMdd`)
    ].join('-')
    const outputPath = Path.resolve(sourcePath, '../', `${filename}.epub`)
    zipEpubFromDir({
      sourcePath,
      outputPath
    })
      .then(() => console.log('やった❕'))
      .catch(console.error)
  })
