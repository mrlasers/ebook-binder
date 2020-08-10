/*
    We want to create a document object format that we'll use for storing
    and editing our content. What do we want to be able to do? Do we want
    to stick to a fairly "word processory" structure?

    How would that look like?

    Document
    > Section
      > Paragraph
        > Run
          > Content

    {
      properties: {},
      sections: [{
        paragraphs: [{
          runs: [{
            content: []
          }]
        }]
      }]
    }

    # cribbing from SlateJS

    types of Nodes: Editor | Element | Text
*/

export interface styleProps {
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export interface TextValue {
  type: 'text'
  properties: styleProps
  text: string
}

export class Text {
  #value: {
    type: 'text'
    properties: styleProps
    text: string
  }

  constructor(text: string, props: styleProps = {}) {
    this.#value = {
      type: 'text',
      properties: props,
      text
    }
  }

  static of(text: string, props?: styleProps) {
    return new Text(text, props)
  }

  getText() {
    return this.#value.text
  }

  getHtml() {
    const propTags = {
      bold: 'b',
      italic: 'i',
      underline: 'u'
    }

    return Object.keys(this.#value.properties)
      .sort()
      .reduce(
        (acc, prop) => (!this.#value.properties[prop] ? acc : `<${propTags[prop]}>${acc}</${propTags[prop]}>`),
        this.#value.text
      )

    return ''
  }
}

export class Linebreak {
  #value: linebreak

  constructor(props: linebreakProps = {}) {
    this.#value = {
      type: 'break',
      properties: props
    }
  }

  static of(props?: linebreakProps) {
    return new Linebreak(props)
  }

  getText() {
    return ''
  }

  getHtml() {
    return '<br/>'
  }
}

export interface linebreakProps {
  clear?: 'all' | 'left' | 'right' | 'none'
  type?: 'column' | 'page' | 'textWrapping'
}

export interface linebreak {
  type: 'break'
  properties: linebreakProps
}

export type content = TextValue | linebreak

export interface run {
  type: 'run'
  properties: styleProps
  contents: content[]
}

export interface paragraph {
  type: 'paragraph'
  properties: styleProps
  contents: run[]
}

export interface section {
  type: 'section'
  properties: {}
  contents: paragraph[]
}

class Element {
  #value: object

  constructor() {
    this.#value = {}
  }

  getText() {
    return ''
  }

  getHtml() {
    return '<span></span>'
  }
}
