import * as A from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import JSZip from "jszip"
import Path from "path"

import {
  Collector,
  collectOutput,
  outputExploded,
  writeCombinedHtml,
} from "./exporter"
import {
  AppleIbooksDisplayXML,
  ContainerXML,
  epubFilenameFromTitle,
} from "./exporter/epub"
import { navdocFromCollector, ncxFromCollector } from "./exporter/navdocs"
import { collectedToOpf } from "./exporter/opf"
import { collectedToOutputTuples } from "./exporter/output"
import { loadManifestAndFootnotes } from "./ingestion/manifest"
//** < mark for delete */
// import { loadManifestAndFootnotes } from "./features/manifest"
import * as Paths from "./paths"
import { readAndCompressImage, writeZip } from "./readWrite"
import { assignToFileTaskEither, Image } from "./tasks"
import { OutputTuple, OutputTupleTypes } from "./types"

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
    ...collected.files,
  ],
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
            compression: 'STORE',
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
              (data: string | Promise<Buffer>) => {
                return zip.file(Paths.joinPath('OEBPS', f[1]), data)
              }
            )
          })
        )

        return zip
      },
      writeZip(Path.resolve(outputPath, filename || 'ebook.epub'), {
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      })
    )

const manifestArgument = process.argv.slice(-1)[0]

const manifestPath = Path.resolve(process.cwd(), manifestArgument)

const buildPath = Path.dirname(manifestPath)

// hardcoded variables that should be replaced with configuration in manifest.json
const classesToRemove = ['gender']

export type WriteExplodedTEOptions = {
  path: string
  exclude?: OutputTupleTypes[]
}
export const writeExplodedTE = ({
  path,
  exclude = [],
}: WriteExplodedTEOptions) =>
  flow(
    outputExploded({
      explodedEpubBasePath: path,
      exclude: exclude,
    }),
    TE.map(() => `Exploded files written to ${path}`)
  )

export const program = pipe(
  loadManifestAndFootnotes(manifestPath),
  TE.chain(({ footnotes, paths, config, metadata, files }) => {
    return pipe(
      files,
      flow(
        A.map(
          assignToFileTaskEither({
            footnotes,
            removeClasses: classesToRemove,
            paths: {
              buildPath: buildPath,
              epub: Paths.combineDefaultEpubPaths(paths?.epub),
              source: Paths.combineDefaultEpubPaths(paths?.source),
            },
          })
        ),
        A.sequence(TE.Monad)
      ),

      TE.map(
        flow(
          collectOutput(metadata, config),
          (collected) => {
            return collected
          },
          addNavDocsToCollected,
          (collected) => {
            return {
              ...collected,
              files: [collectedToOpf(collected), ...collected.files],
            }
          },
          collectedToOutputTuples({
            sourceImagePath: paths.source.imagePath,
            sourceFontPath: paths.source.fontPath,
            epub: false,
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
              writeExplodedTE({
                path: Path.join(buildPath, paths.output.explodedEpubPath),
                exclude: [],
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
                ),
              })
            ),
            // following is big hack for single html output
            writeCombinedHtml(
              Path.resolve(
                buildPath,
                paths?.output?.combinedHtmlPath,
                'combined.xhtml'
              ),
              {
                stylePath: Path.relative(
                  Path.resolve(
                    Path.dirname(manifestArgument),
                    paths?.output?.combinedHtmlPath
                  ),
                  paths?.source?.stylePath
                ),
                imagePath: Path.relative(
                  Path.resolve(
                    Path.dirname(manifestArgument),
                    paths?.output?.combinedHtmlPath
                  ),
                  Path.resolve(
                    buildPath,
                    paths?.output?.explodedEpubPath,
                    paths?.epub?.imagePath
                  )
                ),
              }
            )(tuples),
          ],
          A.sequence(TE.Monad)
        )
      })
    )
  })
)
