import path from 'path'
import * as XML from '../xml'
import * as Doc from './nodeReducers'

type Relationships = {
  [key: string]: {
    type: string
    target: string
  }
}

export const convert = (node: XML.Node): Relationships => {
  const { children } = Doc.convert(null, node) as Doc.WordElement

  return children.reduce((acc, rel) => {
    if (!Doc.isWordElement(rel) || typeof rel.properties.id !== 'string') {
      return acc
    }

    return {
      ...acc,
      [rel.properties.id]: {
        type: path.basename(rel.properties.type as string),
        target: {
          path: path.dirname(rel.properties.target as string),
          file: path.basename(rel.properties.target as string)
        }
      }
    }
  }, {})
}
