import Path from 'path'
import { format } from 'date-fns'
import { createCommand } from 'commander'
import * as IO from '../../../lib/fileio'
import { zipEpubFromDir } from '../../../lib/zip/make'
import { fromOptions } from 'fp-ts/lib/These'
import { symmetricDifference } from 'ramda'

import * as Fs from 'fs/promises'

export type BuildOptions = {
  date: boolean
}

export type SourceOutput = {
  sourcePath: string
  outputPath: string
}

export const buildEpub = (
  src: string,
  dst: string,
  name: string,
  options?: BuildOptions
): Promise<any> => {
  return zipEpubFromDir({
    sourcePath: src,
    outputPath: dst
  })
}

export const manifestToObj =
  (outputPath: string, options?: BuildOptions) =>
  (manifest: string): SourceOutput[] => {
    return manifest
      .split('\n')
      .map((line) => line.split('\t'))
      .map(([name, sourcePath]) => ({
        sourcePath,
        outputPath: Path.join(
          Path.dirname(outputPath),
          name +
            (options.date ? `-${format(new Date(), 'yyyyMMdd')}` : '') +
            '.epub'
        )
      }))
  }

export const build = createCommand('build')
  .description('Build epub file from unzipped directory')
  .arguments('<srcDir>')
  .option('-n --name <filename>', 'Output basename')
  .option('--nodate', `Don't append date (-yyyyMMdd) to end of file`)
  .action((sourcePath, options) => {
    return Fs.lstat(sourcePath)
      .then((stats): SourceOutput[] | Promise<SourceOutput[]> => {
        if (stats.isFile()) {
          return IO.readFile(sourcePath).then(
            manifestToObj(sourcePath, { date: options.nodate })
          )
        }

        const filename = [
          !options.name
            ? 'output'
            : options.name.trim().replaceAll(/\s+/g, '-'),
          options.nodate ? '' : format(new Date(), `yyyyMMdd`)
        ].join('-')
        const outputPath = Path.resolve(sourcePath, '../', `${filename}.epub`)

        return [{ sourcePath, outputPath }]
      })
      .then((builds) => {
        // console.log(builds)
        // return builds
        return builds.map(zipEpubFromDir)
      })
      .then(() => console.log('やった❕'))
      .catch(console.error)
  })
