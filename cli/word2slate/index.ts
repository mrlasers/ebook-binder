import JSZip from 'jszip'
import Path from 'path'
import { promises as Fs } from 'fs'

import { parse } from './xmlParser'
import { Children } from 'react'

export const readDocx = (filename: string): Promise<any> => {
  return Fs.readFile(filename)
    .then(loadZipAsync)
    .then(understandTypeOfDocument)
    .then(console.log)
}

const loadZipAsync = (file) => new JSZip().loadAsync(file)
const getFileFromZip = (zip: JSZip) => (file: string) =>
  zip.file(file).async('string')

// input: <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
// output: {
//   id: 'rId1',
//   type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
//   target: 'word/document.xml'
// }
/**
 * @returns {
 *   id: string,
 *   type: string,
 *   target: string
 * }[]
 *
 * @param file
 */
const parseRelationships = (obj = {}) => (file: string) => {
  return parse(file).then((rels) => {
    return rels.children.reduce((acc, child) => {
      const { attributes } = child
      if (child.name !== 'Relationship' || !attributes.Type) {
        return acc
      }

      return {
        ...acc,
        [Path.basename(attributes.Type.value)]: attributes?.Target.value
      }
    }, {})
  })
}

const getRelationshipOfficeDocument = (file: string) => {
  return parse(file).then((rels) => {
    return rels.children.find((child) => {
      if (child.name !== 'Relationship' || !child?.attributes?.Type) {
        return false
      }

      if (
        child.attributes.Type &&
        Path.basename(child.attributes.Type) === 'officeDocument'
      ) {
        return true
      }

      return false
    })
  })
}

// OfficeOpenXML Part 1, page 4510 (pdf 4521)
const understandTypeOfDocument = async (zip: JSZip) => {
  const getFile = getFileFromZip(zip)
  // 1. get `Target` of 'officeDocument' from '_rels/.rels'
  const rels = getFile('_rels/.rels').then(getRelationshipOfficeDocument)
  // 2. get `ContentType` of `PartName` that matches `Target` from '/[Content_Types].xml'
  const contentTypes = getFile('[Content_Types].xml').then(parse)

  return rels
  // return {
  //   relationships: await rels,
  //   contentTypes: await contentTypes
  // }
}
