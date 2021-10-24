import Fs from 'fs/promises'
import Path from 'path'
import * as TE from 'fp-ts/TaskEither'
import * as TA from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as IO from 'fp-ts/IO'
import * as IOE from 'fp-ts/IOEither'
import { pipe, flow } from 'fp-ts/function'
import { guard } from 'fp-ts-std/Function'
import { parse, stringify, stringifyO, unJSONString } from 'fp-ts-std/JSON'

import { MyError, UnhandleManifestNode, WriteError } from './errors'
import { is } from '@reduxjs/toolkit/node_modules/immer/dist/internal'
import { isNumber } from 'fp-ts/lib/number'
import { isString } from 'fp-ts/lib/string'
import { isBoolean } from 'fp-ts/lib/boolean'
import { Json } from 'fp-ts/lib/Json'
import { T } from 'ramda'
import { cleanHtml } from './process/clean'
import { FootnoteItems } from '../types'

// export class MyError extends Error {
//   _tag: string
//   _msg: string

//   private constructor(tag: string, msg: string) {
//     super()
//     this._tag = tag
//     this._msg = msg
//   }

//   static of(tag: string, msg: any = '') {
//     return new MyError(tag, String(msg))
//   }
// }

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

const manifest = Path.resolve(buildPath, 'files-manifest.json')

export const readJson = flow(
  readFile,
  TE.chain(flow(parse(MyError.of), TE.fromEither))
)

export function readFile(path: string) {
  return TE.tryCatch(() => Fs.readFile(path, { encoding: 'utf-8' }), MyError.of)
}

export const writeJson = (path: string) =>
  flow(
    stringifyO,
    O.map((json) => {
      TE.tryCatch(
        () => Fs.writeFile(path, unJSONString(json), { encoding: 'utf-8' }),
        WriteError.of
      )()
    })
  )

//===================================================//

export type Heading = {
  id: string
  level: number
  text: string
  html: string
}

export type Page = {
  id: string
  page: string
}

export abstract class Node {
  protected _tag: string

  constructor(tag: string) {
    this._tag = tag
  }
}

export class ErrorNode extends Node {
  error?: string

  constructor(msg: any) {
    super('ERROR')
    this.error = String(msg)
  }

  static of(msg: any) {
    return new ErrorNode(msg)
  }
}

export abstract class FileNode extends Node {
  protected _tag: string
  protected filename?: string
  msg?: string

  constructor(tag: string, filename: string) {
    super(tag)
    this.filename = filename
  }
}

export class Content extends FileNode {
  protected _tag: 'CONTENT'
  protected filename: string
  private landmark?: string
  private headings?: Heading[]
  private pages?: Page[]
  private value: string
  private images: Image[]

  protected constructor(value: { filename: string; landmark?: string }) {
    super('CONTENT', value.filename)
    // this._tag = 'CONTENT'
    // this.filename = value.filename
    this.landmark = value?.landmark ?? null
    this.headings = []
    this.pages = []
    this.value = ''
    this.images = []
  }

  static of(value: { filename: string; landmark?: string }) {
    return new Content(value)
  }

  html(): string
  html(html: string): this
  html(value?: string) {
    if (value) {
      this.value = value
      return this
    }

    return this.value
  }
}

export class Image extends FileNode {
  protected _tag: 'IMAGE'
  protected filename: string
  private caption: string
  private landmark?: string
  private pages?: Page[]

  protected constructor(value: {
    filename: string
    landmark?: string
    caption: string
  }) {
    super('IMAGE', value.filename)
    // this._tag = 'CONTENT'
    // this.filename = value.filename
    this.landmark = value?.landmark ?? null
    // this.headings = []
    this.pages = []
    this.caption = value.caption || value.filename.replace(/\..+$/, '')
  }

  static of(value: { filename: string; landmark?: string; caption: string }) {
    return new Image(value)
  }
}

const content = Content.of({ filename: 'hello.world.xhtml' })
// content.filename = 'oops.jpg'

// console.log(content)

// export interface ContentNode extends Node_ {
//   _tag: 'CONTENT'
//   headings?: Heading[]
//   pages?: Page[]
// }

// export interface ImageNode extends Node_ {
//   _tag: 'IMAGE'
//   headings?: Heading[]
//   pages?: Page[]
// }

// export interface SectionNode extends Node_ {
//   _tag: 'SECTION'
//   headings?: Heading[]
//   pages?: Page[]
// }

//===============( CURRENT WORKING )===================||
const liftToMinimalFileItemArray = (arr: any): any[] =>
  (Array.isArray(arr) ? arr : []).map((filename) =>
    typeof filename === 'string' ? { filename } : filename
  )

const assignToNode = guard<any, TE.TaskEither<MyError, FileNode>>([
  [(a) => !!a?.filename?.match(/\.(xhtml|html|htm)/), flow(Content.of, TE.of)],
  [(a) => !!a?.filename?.match(/\.(jpeg|jpg|gif|png)/), flow(Image.of, TE.of)]
])(flow(UnhandleManifestNode.of, TE.left))

const loadFootnotes = pipe(
  readJson(Path.join(buildPath, 'footnotes.json')),
  TE.map((json): FootnoteItems => json as FootnoteItems),
  TE.map((footnotes) => {
    return Object.keys(footnotes).reduce((acc, key) => {
      if (!Number(key)) return acc

      return {
        ...acc,
        [key]: footnotes[key].map((s) => s.trim()).filter(Boolean)
      }
    }, {})
  })
)

const loadFilesManifest = pipe(
  readJson(Path.join(buildPath, 'files-manifest.json')),
  TE.map(flow(liftToMinimalFileItemArray, A.map(assignToNode))),
  TE.chain(
    flow(
      A.map(
        flow(
          TE.fold(
            (e): TA.Task<null> => {
              // console.error(e)
              return TA.of(null)
            },
            (node) => TA.of(node)
          ),
          TE.fromTask
        )
      ),
      A.sequence(TE.Monad),
      TE.map(A.filter(Boolean))
    )
  ),
  TE.map(
    A.map((node) => {
      if (node instanceof Content) {
        return node.html(cleanHtml(node.html())())
      }
    })
  )
  // TE.fold(() => TA.of([]), TA.of)
)

const loadFootnotesAndFilesManifest = pipe(
  loadFootnotes,
  TE.chain((footnotes) => {
    return pipe(
      loadFilesManifest,
      TE.map((content) => {
        return {
          footnotes,
          content
        }
      })
    )
    // return {
    //   footnotes,
    //   files: program1()
    // }
  })
)

// const program = pipe(loadFilesManifest)

// program().then(console.log)
//======================================================||

// export class ContentNode extends ManifestNode {
//   protected constructor(props: { filename: string }) {
//     super('CONTENT', props)
//   }

//   static of(props: { filename: string }) {
//     return new ContentNode(props)
//   }

//   static is(node: any): node is ContentNode {
//     return node instanceof ContentNode
//   }
// }

// export class ImageNode extends ManifestNode<{
//   filename: string
//   caption: string
// }> {
//   caption?: string

//   protected constructor(value: any) {
//     super('IMAGE', value)
//   }
//   static of(props: { filename: string }) {
//     return new ImageNode(props)
//   }
//   static is(node: any): node is ImageNode {
//     return node instanceof ImageNode
//   }
// }
//====================================================

export interface ManifestNoder {
  _tag: string
  filename: string
  [key: string]: any
}

export function isManifestNode(node: any): node is ManifestNoder {
  const $node = node as ManifestNoder
  return typeof $node.filename !== 'undefined'
}

export function liftToManifestNode(
  node: any
): E.Either<MyError, ManifestNoder> {
  const $node = typeof node === 'string' ? { filename: node } : node
  return isManifestNode($node)
    ? E.of($node)
    : E.left(UnhandleManifestNode.of($node))
}

export interface UnknownNode extends ManifestNoder {
  _tag: 'UNKNOWN'
}
export function unknownNode(node: ManifestNoder): UnknownNode {
  return {
    ...node,
    _tag: 'UNKNOWN'
  }
}

export interface ContentNoder extends ManifestNoder {
  _tag: 'CONTENT'
}
export function isContentNode(node: ManifestNoder): node is ContentNoder {
  return isManifestNode(node) && !!node.filename.match(/\.(xhtml|html|htm)/)
}
// export function contentNode(node: ManifestNoder): ContentNoder {
//   return {
//     ...node,
//     _tag: 'CONTENT'
//   }
// }

export interface ImageNode extends ManifestNoder {
  _tag: 'IMAGE'
  caption?: string
  toc?: boolean
}
export function isImageNode(node: ManifestNoder): node is ImageNode {
  // return isManifestNode(node) && !!node.filename.match(/\.(jpg|jpeg|png|gif)/)
  const $img = node as ImageNode
  return (
    !!$img.filename.match(/\.(jpg|jpeg|png|gif)/) &&
    (typeof $img.caption === 'undefined' || isString($img.caption)) &&
    (typeof $img.toc === 'undefined' || isBoolean($img.toc))
  )
}
// export function imageNode(node: ManifestNoder): Required<ImageNode> {
//   return {
//     _tag: 'IMAGE',
//     filename: node.filename,
//     caption: node.caption || '',
//     toc: node.toc || false
//   }
// }

export interface SectionNode extends ManifestNoder {
  _tag: 'SECTION'
  level: number
  title: string
  toc?: boolean
}
export function isSectionNode(node: ManifestNoder): node is SectionNode {
  const $section = node as SectionNode

  return (
    isNumber($section.level) &&
    isString($section.title) &&
    (typeof $section.toc === 'undefined' || isBoolean($section.toc))
  )
}
// export function sectionNode(node: ManifestNoder): Required<SectionNode> {
//   const $node = node as SectionNode
//   return {
//     _tag: 'SECTION',
//     filename: node.filename,
//     title: $node.title || '',
//     level: $node.level || 0,
//     toc: $node.toc || true
//   }
// }

export type AssignedNode = ContentNoder | ImageNode | SectionNode | UnknownNode

function dropLeftsWithLog<E, T>(es: E.Either<E, T>[]): T[] {
  const { right, left } = A.separate(es)
  writeJson(Path.resolve(buildPath, 'log-unknown_nodes.json'))(left)
  return right
}

// const assignNode = guard<ManifestNoder, AssignedNode>([
//   [isSectionNode, sectionNode],
//   [isContentNode, contentNode],
//   [isImageNode, imageNode]
// ])(unknownNode)

// const assignAndLogUnknownNodes = flow(
//   A.map(flow(liftToManifestNode, E.map(assignNode))),
//   dropLeftsWithLog
// )

// const jsonToAssignedNodeArray = (
//   json: Json
// ): E.Either<MyError, AssignedNode>[] => {
//   if (!Array.isArray(json)) {
//     return []
//   }

//   return json.map(liftToManifestNode).map(E.map(assignNode))
// }

// const result = pipe(
//   readJson(manifest),
//   TE.map(jsonToAssignedNodeArray),
//   TE.chain(A.sequence(TE.Monad)),
//   TE.chain(
//     flow(
//       A.map((node) => {
//         const tag = node._tag
//         switch (tag) {
//           default:
//             return TE.left(new Error(String(node)))
//           case 'IMAGE':
//             return TE.of({
//               ...node,
//               html: `<html>${node.filename}</html>`
//             })
//         }

//         // return TE.left(new Error('oopsy'))
//       }),
//       A.sequence(TE.Monad)
//     )
//   )
// )

// result() //.then(console.log)

// nothing here

export class MyObject {
  _tag: string
  msg?: string

  protected constructor(tag: string, msg: string) {
    this._tag = tag
    this.msg = msg
  }

  static of(msg: string) {
    return new MyObject('whatever', msg)
  }
}

export class MyErrorObject extends MyObject {
  private constructor(msg: string) {
    super('ERROR', msg)
  }

  static of(msg: string) {
    return new MyErrorObject(msg)
  }
}
