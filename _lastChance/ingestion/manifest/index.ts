import { flow, pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"
import * as Path from "path"

import { readFootnotes } from "../../readWrite"
import { FilePaths } from "../../types"
import { loadManifest } from "../../types/manifestValidate"

export const resolveFilePaths = (dir: string) => (paths: FilePaths) =>
  Object.keys(paths).reduce<Required<FilePaths>>(
    (acc, key) => ({
      ...acc,
      [key]: Path.resolve(dir, paths[key]),
    }),
    {
      htmlPath: dir,
      imagePath: dir,
      stylePath: dir,
      fontPath: dir,
      navPath: dir,
    }
  )

export const loadManifestAndFootnotes = (manifestPath: string) =>
  pipe(
    loadManifest(manifestPath),
    TE.bindTo('manifest'),
    TE.bind('footnotes', ({ manifest }) =>
      manifest.paths?.footnotes
        ? readFootnotes(
            Path.resolve(Path.dirname(manifestPath), manifest.paths.footnotes)
          )
        : TE.of({})
    ),
    TE.map(({ footnotes, manifest }) => ({
      metadata: manifest.metadata,
      paths: {
        ...manifest.paths,
        source: resolveFilePaths(Path.dirname(manifestPath))(
          manifest?.paths?.source
        ),
      },
      config: manifest.config,
      files: manifest.files,
      footnotes,
    }))
  )
