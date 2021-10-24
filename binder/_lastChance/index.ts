import { CheerioAPI } from 'cheerio'
import { Do } from 'fp-ts-contrib/Do'
import { join } from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import JSZip from 'jszip'
import Path from 'path'

import {
    addDocumentWrapHtml,
    Collector,
    collectOutput,
    finalClean,
    htmlBodyToCombinedHtml,
    load,
    outputExploded,
    unwrapDocumentBody,
    writeCombinedHtml,
} from './exporter'
import { AppleIbooksDisplayXML, ContainerXML } from './exporter/epub'
import { navdocFromCollector, ncxFromCollector } from './exporter/navdocs'
import { collectedToOpf } from './exporter/opf'
import { collectedToOutputTuples } from './exporter/output'
import * as Paths from './paths'
import { readAndCompressImage, readFootnotes, writeZip } from './readWrite'
import { assignToFileTaskEither, Image } from './tasks'
import { Err, FilePaths, OutputTuple, OutputTupleTypes } from './types'
import { loadManifest } from './types/manifestValidate'

export function reduceFilterImages(images: Image[], image: Image) {
  return !!images.find((i) => i.source === image.source)
    ? images
    : [...images, image]
}

export function sortImages(a: Image, b: Image) {
  return a.source.toUpperCase() < b.source.toUpperCase() ? -1 : 1
}

export const addNavDocsToCollected = (collected: Collector) => ({
  ...collected,
  files: [
    ncxFromCollector(collected),
    navdocFromCollector(collected),
    ...collected.files
  ]
})

export type WriteEpubOptions = {
  outputPath: string
  filename?: string
  clean?: boolean
}

const writeEpubFromTuples =
  ({ filename, outputPath }: WriteEpubOptions) =>
  (tuples: OutputTuple[]) =>
    pipe(
      tuples,
      (tuples) => {
        const zip = new JSZip()

        zip
          .file('mimetype', 'application/epub+zip', {
            compression: 'STORE'
          })
          .file('META-INF/container.xml', ContainerXML())
          .file(
            'META-INF/com.apple.ibooks.display-options.xml',
            AppleIbooksDisplayXML()
          )

        pipe(
          tuples,
          A.map((f) => {
            return pipe(
              f[0] === 'image' ? readAndCompressImage(f[2]) : f[2],
              (data: string | Promise<Buffer>) =>
                zip.file(Paths.joinPath('OEBPS', f[1]), data)
            )

            // =========== this is a little broken below so commented out

            // return pipe(
            //   f[0] === 'image'
            //     ? readAndCompressImage(f[2])
            //     : TE.left(Err.MyError.of(f[2])),
            //   TE.map((result) => {
            //     console.log(`===epub writer shit===:: ${result}`)
            //     return result
            //   }),
            //   TE.map((data) => zip.file(Paths.joinPath('OEBPS', f[1]), data))
            // )
          })
          // A.sequence(TE.Monad)
        )

        return zip
      },
      writeZip(Path.resolve(outputPath, filename || 'ebook.epub'), {
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      })
    )
export function epubFilenameFromTitle(title?: string) {
  if (typeof title !== 'string') return 'ebook.epub'

  const d = new Date()

  const filenameDate = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map((x) => x.toString().padStart(2, '0'))
    .join('.')

  // console.log(
  //   `epubFilenameFromTitle() :: ${d.getHours()} ; ${d.getHours().toString()}`
  // )

  return (
    title
      .toLowerCase()
      .replace(/[^a-z -]/g, '')
      .split(/\s/)
      .filter((x) => x.length > 3)
      .slice(0, 3)
      .map((word) => word.replace(/^./, (match) => match.toUpperCase()))
      .join('-') +
    '_' +
    filenameDate +
    '-' +
    d.getHours().toString(10) +
    '.epub'
  )
}

// console.log(`process.args: ${process.argv.slice(-1)}`)

const manifestArgument = process.argv.slice(-1)[0]

const manifestPath = Path.resolve(manifestArgument)

const buildPath = Path.dirname(manifestPath)

const outputPath = Path.resolve(buildPath, 'workshop')

export const resolveFilePath = (dir: string) => (path: string) =>
  Path.resolve(dir, path)

export const resolveFilePaths = (dir: string) => (paths: FilePaths) =>
  Object.keys(paths).reduce<Required<FilePaths>>(
    (acc, key) => {
      return {
        ...acc,
        [key]: resolveFilePath(dir)(paths[key])
      }
    },
    {
      htmlPath: dir,
      imagePath: dir,
      stylePath: dir,
      fontPath: dir,
      navPath: dir
    }
  )

const loadManifestAndFootnotes = (manifestPath: string) =>
  Do(TE.Monad)
    // .bind(
    //   'footnotes',
    //   readFootnotes(Path.resolve(Path.dirname(manifestPath), `footnotes.json`))
    // )
    .bind('manifest', loadManifest(manifestPath))
    .bindL('footnotes', (context) => {
      // console.log(`bindL(footnotes): ${context.manifest.paths.footnotes}`)
      if (context.manifest.paths?.footnotes) {
        return readFootnotes(
          Path.resolve(
            Path.dirname(manifestPath),
            context.manifest.paths.footnotes
          )
        )
      }

      return TE.of({})
    })
    .return(({ footnotes, manifest }) => ({
      metadata: manifest.metadata,
      paths: {
        ...manifest.paths,
        // epub: resolveFilePaths(Path.dirname(manifestPath))(
        //   manifest?.paths?.epub
        // ),
        source: resolveFilePaths(Path.dirname(manifestPath))(
          manifest?.paths?.source
        )
      },
      files: manifest.files,
      footnotes
    }))

// hardcoded variables that should be replaced with configuration in manifest.json
const classesToRemove = ['gender']

export type WriteExplodedTEOptions = {
  path: string
  exclude?: OutputTupleTypes[]
}
export const writeExplodedTE = ({
  path,
  exclude = []
}: WriteExplodedTEOptions) =>
  flow(
    outputExploded({
      explodedEpubBasePath: path,
      exclude: exclude // ['style'] // ['xml', 'style']
    }),
    TE.map(() => `Exploded files written to ${path}`)
  )

const program = pipe(
  loadManifestAndFootnotes(manifestArgument),
  TE.chain(({ footnotes, paths, metadata, files }) =>
    pipe(
      files,
      flow(
        A.map(
          assignToFileTaskEither({
            footnotes,
            removeClasses: classesToRemove,
            // NOTE: these paths are fine to hard code atm (2021-10-21)
            paths: {
              buildPath: buildPath,
              epub: Paths.combineDefaultEpubPaths(paths?.epub),
              source: Paths.combineDefaultEpubPaths(paths?.source)
              // epub: Paths.combineDefaultEpubPaths({
              //   htmlPath: paths?.epub?.htmlPath, //|| Paths.htmlPath,
              //   // Paths.htmlPath used here because "image" refers to html file
              //   // generated from an image (aka, "cover" html)
              //   imagePath: paths?.epub?.htmlPath, //|| Paths.htmlPath,
              //   stylePath: paths?.epub?.stylePath, //|| Paths.stylePath,
              //   fontPath: paths?.epub?.fontPath //|| Paths.fontPath
              // })
            }
          })
        ),
        A.sequence(TE.Monad)
      ),

      TE.map(
        flow(
          collectOutput(metadata),
          addNavDocsToCollected,
          (collected) => {
            return {
              ...collected,
              files: [collectedToOpf(collected), ...collected.files]
            }
          },
          collectedToOutputTuples({
            sourceImagePath: paths.source.imagePath,
            sourceFontPath: paths.source.fontPath,
            epub: false
          })
        )
      ),
      // this is where the output happens
      TE.chain((tuples) => {
        return pipe(
          tuples,
          (tuples) => [
            // write exploded
            pipe(
              tuples,
              // (x) => {
              //   console.log(`tuples:: ${x.map((y) => y[1])}`)
              //   return x
              // },
              writeExplodedTE({
                path: Path.join(buildPath, paths.output.explodedEpubPath),
                exclude: []
              })
            ),
            // write epub
            pipe(
              tuples,
              writeEpubFromTuples({
                filename: epubFilenameFromTitle(metadata.title),
                outputPath: Path.join(
                  buildPath,
                  paths.output.epubPath || 'workshop'
                )
              })
            )
            // following is big hack for single html output
            // writeCombinedHtml(
            //   Path.resolve(outputPath, 'Content', 'combined.xhtml')
            // )(tuples)
          ],
          A.sequence(TE.Monad)
        )
      })
    )
  )
)

program().then(console.log)
