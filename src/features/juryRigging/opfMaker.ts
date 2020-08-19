import { promises as fs } from 'fs'
import { v4 as Uuid } from 'uuid'

// const marcRelators = require('./marcRelators.json')

type PubId = { type: 'uuid' | 'isbn'; value: string }
type PublicationId = null | string | PubId

export interface Metadata {
  publicationId?: PublicationId
  sourceId?: PublicationId
  title?: string
  creators: Person[]
  contributors: Person[]
}

export interface PublicationConfig {
  metadata: Metadata
}

export interface Person {
  name: string
  fileAs?: string
  role?:
    | 'aut'
    | 'bkd'
    | 'ctb'
    | 'cov'
    | 'edt'
    | 'ill'
    | 'pfr'
    | 'pbl'
    | 'win'
    | 'wpr'
}

const config =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\J\\Jonathan Ellis\\Speaking with Impact\\build\\epub\\publication.json'

function makeTag(data: {
  name: string
  text: string
  attributes: {
    [key: string]: string
  }
}) {
  const { name, text } = data
  const attributes = !data.attributes
    ? ''
    : Object.keys(data.attributes)
        .map((key) => {
          return ` ${key}="${data.attributes[key]}"`
        })
        .join('')
  return `<${name + attributes}>${text}</${name}>`
}

export const tag = (name: string) => (
  text?: string,
  attr?: { [key: string]: string }
) => {
  return `<${name} />`
}

function formatCreator(creator: Person, num?: number) {
  const id = 'author' + (num || '')
  return [
    makeTag({ name: 'dc:creator', text: creator.name, attributes: { id } }),
    creator.fileAs
      ? makeTag({
          name: 'meta',
          text: creator.fileAs,
          attributes: { refines: '#' + id, property: 'file-as' }
        })
      : '',
    creator.role
      ? `<meta refines="#${id}" property="role">${creator.role}</meta>`
      : ''
  ].filter(Boolean)
}

function formatMetadata(config: Metadata) {
  return [
    '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">',
    `<dc:identifier id="pub-id">urn:uuid:${Uuid()}</dc:identifier>`,
    config.creators.map(formatCreator).flat()
  ]
    .filter(Boolean)
    .flat()
}

function tap(value) {
  console.log(value)
  return value
}

fs.readFile(config, { encoding: 'utf-8' })
  .then(JSON.parse)
  .then(tap)
  .then((json) => {
    return [
      '<package version="3.0" xmlns="http://www.idpf.org/2007/opf" xml:lang="en-US" dir="ltr" unique-identifier="pub-id">',
      formatMetadata(json.metadata)
    ].flat()
    // .join('\n')
  })
  .then(console.log)
