import { Monad } from 'fp-ts/Monad'
import * as E from 'fp-ts/Either'

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

  html(): Node
  html(newHtml: string): string
  html(newHtml?: string): Node | string {
    return newHtml ? this : ''
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
  filename: string
  msg?: string

  constructor(tag: string, filename: string) {
    super(tag)
    this.filename = filename
  }
}

export class Content extends FileNode {
  protected _tag: 'CONTENT'
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
}

export class Image extends FileNode {
  protected _tag: 'IMAGE'
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

export interface MyFile {
  filename: string
  [key: string]: any
}

export interface MyContentFile extends MyFile {
  headings: Heading[]
  pages: Page[]
}
