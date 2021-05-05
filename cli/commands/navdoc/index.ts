import * as Path from 'path'
import { createCommand } from 'commander'
import Chalk from 'chalk'
import * as IO from '../../../lib/fileio'
import { map, reduce, prop, compose, split } from '../../../lib/fp'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as _A from 'fp-ts-std/Array'
import Prettify from 'html-format'
import { html as Beautify, HTMLBeautifyOptions } from 'js-beautify'

const beautify = (options: HTMLBeautifyOptions) => (html: string) =>
  Beautify(html, options)

import { levelsToTree } from './levelToTree'

type FileData = {
  file: string
  fragment: string
  level: number
  title: string
  order?: number
  sectionId?: number
  children: FileData[]
}

type FinalData = [manifest: string, spine: string, ncx: string, navdoc: string]

const textToData = flow(
  (s: string) => s.split(/[\r\n]+/).filter((x) => !!x.trim().length),
  A.mapWithIndex((idx, line) =>
    pipe(
      line,
      (line: string) => line.split(/\t/),
      ([file, level, fragment, title]): FileData => ({
        file,
        fragment,
        level: parseInt(level, 0),
        title: title.trim(),
        order: idx + 2,
        children: []
      })
    )
  )
)

const reduceItems = (acc, file) => {
  const id = `sec${acc.count}`
  return acc.items[file.file]
    ? acc
    : {
        count: acc.count + 1,
        items: {
          ...acc.items,
          [file.file]: id
        }
      }
}

const itemsToManifestSpine = (acc, file) => {
  return {
    manifest: [
      ...acc.manifest,
      `<item id="${file.id}" media-type="application/xhtml+xml" href="Content/${file.file}"/>`
    ],
    spine: [...acc.spine, `<itemref idref="${file.id}"/>`]
  }
}

const makeManifest = compose(
  reduce(itemsToManifestSpine, { manifest: [], spine: [] }),
  (items) =>
    Object.keys(items).map((key) => ({
      id: items[key],
      file: key
    })),
  prop('items'),
  reduce(reduceItems, { count: 1, items: {} })
)

const makeNcx = (data: FileData[]) =>
  pipe(
    data,
    A.map(
      (file) =>
        `<navPoint id="sec${file.order}" playOrder="${file.order}"><navLabel><text>${file.title}</text></navLabel><content src="../Content/${file.file}"/></navPoint>`
    ),
    _A.join('\n'),
    beautify({ indent_size: 2 })
  )

const nodeToNavDoc = () => (node: FileData) => {
  const children = node.children.map(nodeToNavDoc()).join('')

  return `<li><a href="../Content/${node.file}${
    node.fragment ? `#${node.fragment}` : ''
  }">${node.title}</a>${children ? `<ol>${children}</ol>` : ``}</li>`
}

const makeNavDoc = flow(
  (data: FileData[]): string =>
    `<nav epub:type="toc"><h1>Table of Contents</h1><ol>` +
    data.reduce(levelsToTree, []).map(nodeToNavDoc()).join('') +
    `</ol></nav>`,
  beautify({
    indent_size: 2,
    indent_inner_html: false,
    indent_body_inner_html: false
  })
)

export const nav = createCommand('nav')
  .description('Converts legacy tools "headings.txt" file into epub XML')
  .arguments('<headings>')
  .option('--ncx', 'only output epub2 ncx')
  .option('--navdoc', 'only output epub3 navdoc')
  .option('--opf', 'only output manifest & spine for opf')
  .action((headings, options) => {
    IO.readFile(Path.resolve(process.cwd(), headings))
      .then(textToData)
      .then(
        (data): FinalData => {
          // we have the data here and need to fork into opf (manifest/spine), ncx, and navdoc
          const { manifest, spine } = makeManifest(data)
          const ncx = makeNcx(data)
          const navdoc = makeNavDoc(data)
          return [manifest, spine, ncx, navdoc]
        }
      )
      // .then(({ manifest, spine }) => {
      //   const manifestFile = Path.resolve(
      //     Path.dirname(headings),
      //     'manifest.xml'
      //   )
      //   const spineFile = Path.resolve(Path.dirname(headings), 'spine.xml')
      //   return Promise.all([
      //     IO.writeFile(manifestFile, manifest.join('\n')).then(
      //       () => `manifest written to ${manifestFile}`
      //     ),
      //     IO.writeFile(spineFile, spine.join('\n')).then(
      //       () => `spine written to ${spineFile}`
      //     )
      //   ])
      // })
      .then(([manifest, spine, ncx, navdoc]) => {
        Promise.all([
          IO.writeFile(Path.resolve(Path.dirname(headings), 'ncx.xml'), ncx),
          IO.writeFile(
            Path.resolve(Path.dirname(headings), 'navdoc.xml'),
            navdoc
          )
        ])
      })
      .catch((err) => {
        console.error(Chalk.red('ERROR:', err))
      })
  })
