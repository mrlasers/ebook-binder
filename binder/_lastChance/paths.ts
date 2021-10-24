import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import Path from 'path'

import { FilePaths } from './types'

export function joinPath(...segments: string[]) {
  return Path.join(...segments).replace(/\\/g, '/')
}

export function relativePath(from: string, to: string) {
  return Path.relative(from, to).replace(/\\/g, '/')
}

export const safeJoinPath = (...segments: string[]) =>
  pipe(
    segments,
    A.map(O.fromNullable),
    A.sequence(O.Monad),
    O.map((segments) => joinPath(...segments)),
    O.getOrElse(() => null)
  )

export const buildPath = `C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\_\\evock\\test1\\BadSpot`
// 'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

export const htmlPath = 'Content'
export const imagePath = 'Images'
export const navPath = 'Navigation'
export const stylePath = 'Styles'
export const fontPath = 'Fonts'

export const oebpsPath = 'OEBPS'

export const outputPath = Path.resolve(buildPath, 'workshop')
export const outputNavPath = Path.resolve(outputPath, 'Navigation')
export const outputHtmlPath = Path.resolve(outputPath, 'Content')
export const outputImagePath = Path.resolve(outputPath, 'Images')

export const sourcePath = Path.resolve(buildPath, 'source')
export const sourceHtmlPath = Path.resolve(sourcePath, 'xhtml')
export const sourceImagePath = Path.resolve(sourcePath, 'images')
export const sourceStylesPath = Path.resolve(outputPath, 'Styles')
export const sourceFontPath = Path.resolve(sourcePath, 'fonts')

export const combineDefaultPaths =
  (defaultPaths: FilePaths) =>
  (paths: FilePaths): FilePaths => {
    return {
      ...defaultPaths,
      ...paths
    }
  }

export const combineDefaultEpubPaths = combineDefaultPaths({
  htmlPath,
  imagePath,
  stylePath,
  fontPath,
  navPath
})

export const combineDefaultSourcePaths = combineDefaultPaths({
  htmlPath: sourceHtmlPath,
  imagePath: sourceImagePath,
  stylePath: sourceStylesPath,
  fontPath: sourceFontPath
})

export const sourcePaths: FilePaths = {
  htmlPath: sourceHtmlPath,
  imagePath: sourceImagePath,
  stylePath: sourceStylesPath,
  fontPath: sourceFontPath
}

export const getOutputNavPath = (...segments: string[]): string =>
  joinPath(outputNavPath, ...segments)
export const getRelativeNavToContentPath = (contentFilename: string): string =>
  joinPath(relativePathNavToContent, contentFilename)

export const relativePathRootToContent = relativePath(
  outputPath,
  outputHtmlPath
)

export const relativePathRootToImages = relativePath(
  outputPath,
  outputImagePath
)

export const relativePathNavToContent = relativePath(
  outputNavPath,
  outputHtmlPath
)

export const relativePathContentToImages = relativePath(
  outputHtmlPath,
  outputImagePath
)

export const relativePathImagesToContent = relativePath(
  outputImagePath,
  outputHtmlPath
)

export const getFilePath =
  (path: string) =>
  (filename: string): string =>
    Path.join(path, filename)

export const getContentFilePathIn = getFilePath(sourceHtmlPath)
export const getImageFilePathIn = getFilePath(outputImagePath)

export const getContentFilePathOut = getFilePath(outputHtmlPath)
export const getImageFilePathOut = getFilePath(outputImagePath)
export const getNavFilePathOut = getFilePath(outputNavPath)

export const getRootFilePathOut = getFilePath(outputPath)
export const getRelativeContentPath = (file: string) =>
  relativePath(outputPath, getContentFilePathOut(file))
export const getRelativeImagePath = (img: string) =>
  relativePath(outputPath, getImageFilePathOut(img))
export const getRelativeNavPath = (img: string) =>
  relativePath(outputPath, getNavFilePathOut(img))

export const manifestPath = Path.resolve(buildPath, 'manifest.json')
export const footnotesPath = Path.resolve(buildPath, 'footnotes.json')
