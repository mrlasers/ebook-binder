import dayjs from "dayjs"
import { join, pluckFirst } from "fp-ts-std/Array"
import * as A from "fp-ts/Array"
import { flow, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import { Ord } from "fp-ts/Ord"
import produce from "immer"
import { nanoid } from "nanoid"
import Path, { basename } from "path"

import { prettyPrint } from "../../binder/processing"
import {
  getImageFilePathOut,
  getRelativeImagePath,
  getRootFilePathOut,
} from "../paths"
import { FileOutput, Image } from "../tasks"
import { GeneratedOutput, Metadata, Output } from "../types"
import { Collector } from "./"

export function getUTCTime() {
  return dayjs().toISOString().slice(0, -5) + 'Z'
}

const mrlasers = `<dc:contributor id="mrlasers">MrLasers.com</dc:contributor>
<meta refines="#mrlasers" property="file-as">MrLasers</meta>
<meta refines="#mrlasers" property="role" scheme="marc:relators">bkp</meta>`

const formatMetadata = ({ pubId, title, publisher, author }: Metadata) => {
  const [first, ...last] = author.split(' ')

  return `
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="pub-id">urn:uuid:${pubId}</dc:identifier>
  <dc:title id="title">${title}</dc:title>

  <dc:language>en-US</dc:language>

  <meta property="dcterms:modified">${getUTCTime()}</meta>

  <dc:publisher>${publisher}</dc:publisher>
  <dc:creator>${author}</dc:creator>
  <meta refines="#author" property="file-as">${last.join(' ')}, ${first}</meta>
  <meta refines="#author" property="role" scheme="marc:relators">aut</meta>


  ${mrlasers}


  <meta name="cover" content="cover-image"/>
</metadata>
`.trim()
}

const mediaType: { [key: string]: string } = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  xhtml: 'application/xhtml+xml',
  ncx: 'applicatino/x-dtbncx+xml',
}

// const formatManifestItem = (item: FileOutput): string => {
//   return `<item id="${item.id}" media-type="${item.type}" href="${item.href}"${
//     item.properties ? `properties="${item.properties}"` : ''
//   }/>`
// }

export type ManifestItem = {
  id: string
  type: string
  href: string
  properties: 'nav' | null
  linear: 'yes' | 'no' | null
  spine: boolean
}

export function makeManifestItem(path: string, idx?: number): ManifestItem {
  const ext = Path.extname(path).replace(/^\.+/, '')

  return {
    id: `item${idx}`, //!!path.match(/ncx$/) ? 'ncx' : nanoid(),
    type: mediaType[ext] || Path.extname(path),
    href: path,
    properties: Path.basename(path) === 'nav.xhtml' ? 'nav' : null,
    linear: Path.basename(path) === 'cover.xhtml' ? 'yes' : null,
    spine:
      ext === 'xhtml' && Path.basename(path) !== 'nav.xhtml' ? true : false,
  }
}

// const opfPackage = (metadata: Metadata, files: ManifestItem[]) => {
//   return `
// <package version="3.0" xmlns="http://www.idpf.org/2007/opf" xml:lang="en-US" dir="ltr" unique-identifier="pub-id">
// ${formatMetadata(metadata)}

// <manifest>
// <item id="steez" media-type="text/css" href="Styles/styles.css"/>
// ${files.map(formatManifestItem).join('\n')}
// </manifest>
// <spine toc="ncx">
// ${files
//   .map((file) => {
//     return file.spine
//       ? `<itemref idref="${file.id}"${
//           file.linear ? ` linear="${file.linear}"` : ''
//         }/>`
//       : null
//   })
//   .filter(Boolean)
//   .join('\n')}
// </spine>
// </package>`.trim()
// }

// export function collectedToOpf(collected: Collector): string {
//   const manifested = files.map((f, i) => makeManifestItem(f.destination, i))
//   return opfPackage(collected.metadata, manifested )
// }

export function temporary_getGuideCover(files: FileOutput[]): string {
  return pipe(
    files,
    A.filter((f) => f.landmark === 'cover'),
    (x) => x[0],
    O.fromNullable,
    O.fold(
      () => '',
      (f) => `<reference type="cover" title="Cover" href="${f.filename}"/>`
    )
  )
}

export function temporary_getGuideToc(files: FileOutput[]): string {
  return pipe(
    files,
    A.filter((f) => f.landmark === 'toc'),
    (x) => x[0],
    O.fromNullable,
    O.fold(
      () => '',
      (f) =>
        `<reference type="toc" title="Table of Contents" href="${f.filename}"/>`
    )
  )
}

export function temporary_getGuideStart(files: FileOutput[]): string {
  return pipe(
    files,
    A.filter((f) => f?.landmark?.split(',')?.includes('bodymatter')),
    (x) => x[0],
    O.fromNullable,
    O.fold(
      () => '',
      (f) =>
        `<reference type="text" title="Start reading" href="${f.filename}"/>`
    )
  )
}

export function temporary_spineItems(files: FileOutput[]): string[] {
  return pipe(
    files,
    A.filter(
      (f) =>
        ['HTML', 'SECTION', 'IMAGE', 'FACTORY'].includes(f._tag) &&
        f.landmark !== 'cover'
    ),
    A.mapWithIndex((i, f) => `<itemref idref="ht${i + 1}"/>`)
  )
}

export function temporary_getSpine(files: FileOutput[]): string {
  return pipe(
    files,
    A.findIndex((f) => f._tag === 'NCX'),
    O.fold(
      () => [`<spine>`],
      (f) => [`<spine toc="ncx">`]
    ),
    A.concat(
      pipe(
        files,
        A.findFirst((f) => f.landmark === 'cover'),
        O.fold(
          () => [],
          (f) => [`<itemref idref="ht-cover" linear="no"/>`]
        )
      )
    ),
    A.concat(temporary_spineItems(files)),
    A.concat([`</spine>`]),
    join('\n')
  )
}

export function temporary_manifestCover(files: FileOutput[]): string {
  return pipe(
    files,
    A.findFirst((f) => f.landmark === 'cover'),
    O.fold(
      () => '',
      (f) =>
        `<item id="ht-cover" media-type="application/xhtml+xml" href="${f.filename}"/>`
    )
  )
}
export function temporary_manifestNav(files: FileOutput[]): string {
  return pipe(
    files,
    A.findFirst((f) => f._tag === 'NAVDOC'),
    O.fold(
      () => '',
      (f) =>
        `<item id="nav" media-type="application/xhtml+xml" href="${f.filename}" properties="nav"/>`
    )
  )
}
export function temporary_manifestNcx(files: FileOutput[]): string {
  return pipe(
    files,
    A.findFirst((f) => f._tag === 'NCX'),
    O.fold(
      () => '',
      (f) =>
        `<item id="ncx" media-type="application/x-dtbncx+xml" href="${f.filename}"/>`
    )
  )
}

export function temporary_manifestContent(files: FileOutput[]): string {
  return pipe(
    files,
    A.filter(
      (f) =>
        f.landmark !== 'cover' &&
        ['HTML', 'SECTION', 'IMAGE', 'FACTORY'].includes(f._tag)
    ),
    A.mapWithIndex(
      (i, f) =>
        `<item id="ht${i + 1}" media-type="application/xhtml+xml" href="${
          f.filename
        }"/>`
    ),
    join('\n')
  )
}

const ImgOrd: Ord<Image> = {
  compare: (a, b) =>
    Path.basename(a.source.toLowerCase()) <
    Path.basename(b.source.toLowerCase())
      ? -1
      : 1,
  equals: (a, b) => Path.basename(a.source) === Path.basename(b.source),
}

export function temporary_manifestImages(files: Image[]): string {
  return pipe(
    files,
    // files.sort((a, b) =>
    //   Path.basename(a.destination) < Path.basename(b.destination) ? -1 : 1
    // ),
    A.sort(ImgOrd),
    A.uniq(ImgOrd),
    A.filter((f) => Path.basename(f.destination) !== 'cover.jpg'),
    A.mapWithIndex(
      (i, f) =>
        `<item id="img${i + 1}" media-type="image/jpeg" href="${
          f.destination
        }"/>`
    ),
    join('\n')
  )
}

export function temporary_metadataCover(files: FileOutput[]): string {
  return pipe(
    files,
    A.findFirst((f) => f.landmark === 'cover'),
    O.fold(
      () => '',
      (f) => `<meta name="cover" content="cover-image"/>`
    )
  )
}

export function temporary_manifestStyles(files: FileOutput[]): string {
  return pipe(
    files,
    A.filter((f) => f._tag === 'STYLES'),
    A.mapWithIndex(
      (i, f) =>
        `<item id="steez${i + 1}" media-type="text/css" href="${f.filename}"/>`
    ),
    join('\n')
    // A.findFirst((f) => f._tag === 'STYLES'),
    // O.fold(
    //   () => '',
    //   (f) => `<item id="steez" media-type="type/css" href="${f.filename}"/>`
    // )
  )
}

// <item id='font-id' media-type='application/vnd.ms-opentype' href='Fonts/font.ttf'/>
// <item id='font-id' media-type='application/vnd.ms-opentype' href='Fonts/font.otf'/>

export function temporary_manifestFonts(files: FileOutput[]): string {
  return pipe(
    files,
    A.filter((f) => f._tag === 'FONT'),
    A.mapWithIndex(
      (i, f) =>
        `<item id="font-${
          i + 1
        }" media-type="application/vnd.ms-opentype" href="${f.filename}"/>`
    ),
    join('\n')
  )
}

export const makeGuideXml = (files: FileOutput[]) => {
  const cover = temporary_getGuideCover(files)
  const toc = temporary_getGuideToc(files)
  const start = temporary_getGuideStart(files)

  if (!cover && !toc) {
    return ''
  }

  return `
<guide>
${cover}
${toc}
${start}
</guide>
  `
}

export function constructOpfDocument(c: Collector): string {
  return `
<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" xml:lang="en-US" dir="ltr" unique-identifier="pub-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="pub-id">urn:uuid:${c.metadata.pubId}</dc:identifier>
  <dc:title id="title">${c.metadata.title}</dc:title>
  <dc:language>en-US</dc:language>
  <meta property="dcterms:modified">${getUTCTime()}</meta>
  <dc:publisher>${c.metadata.publisher}</dc:publisher>
  <dc:creator id="author">${c.metadata.author}</dc:creator>
  <meta refines="#author" property="role" scheme="marc:relators">aut</meta>
  <meta refines="#author" property="display-seq">1</meta>
  <dc:contributor id="mrlasers">MrLasers.com</dc:contributor>
  <meta refines="#mrlasers" property="file-as">MrLasers</meta>
  <meta refines="#mrlasers" property="role" scheme="marc:relators">bkp</meta>
  ${temporary_metadataCover(c.files)}
</metadata>
<manifest>
  ${temporary_manifestStyles(c.files)}
  <item id="cover-image" media-type="image/jpeg" href="Images/cover.jpg" properties="cover-image"/>
  ${temporary_manifestFonts(c.files)}
  ${temporary_manifestNav(c.files)}
  ${temporary_manifestNcx(c.files)}
  ${temporary_manifestCover(c.files)}
  ${temporary_manifestContent(c.files)}
  ${temporary_manifestImages(c.images)}
  <!-- manifest items go here -->
</manifest>

${temporary_getSpine(c.files)}
${makeGuideXml(c.files)}
</package>
`.trim()
}

export function collectedToOpf(c: Collector): FileOutput {
  return {
    _tag: 'OPF',
    filename: 'content.opf',
    html: constructOpfDocument(c), // opfPackage(collected.metadata, manifested),
    headings: [],
    images: [],
    pages: [],
    landmark: undefined,
    toc: false,
  }
}
