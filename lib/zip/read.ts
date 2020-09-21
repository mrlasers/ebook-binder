import JSZip from 'jszip'
import path from 'path'
import { promises as fs } from 'fs'
import { parse, getFirstChild, Node, Element, isElement } from '../xml'
import Slate from 'slate'
import * as DocumentXML from './word/documentXml'
import * as StylesXML from './word/stylesXml'

function tap(arg: any) {
  console.log(JSON.stringify(arg, null, 2))
  return arg
}

const getDocumentFromZip = (zip): Element => {
  return (
    zip
      .file('word/document.xml')
      .async('string')
      .then((data) => parse(data, { ignoreNS: true }))
      .then(getFirstChild)
      // .then(tap)
      .then((document) => {
        if (!isElement(document)) {
          throw 'word/document.xml does not appear to be a valid Word XML document'
        }

        return document
      })
  )
}

const getStylesFromZip = (zip) => {
  return zip
    .file('word/styles.xml')
    .async('string')
    .then((data) => parse(data, { ignoreNS: true }))
}

export const read = (filename: string) => {
  console.log('reading word docx')
  fs.readFile(filename)
    .then((file) => {
      console.log('got the file:', file.length)
      const zip = new JSZip()
      return zip.loadAsync(file)
    })
    .then(async (zip) => {
      // zip file is loaded
      console.log(Object.keys(zip.files))

      const styles = await getStylesFromZip(zip)

      const doc = await getDocumentFromZip(zip)

      const document = DocumentXML.convert(doc, StylesXML.convertStyles(styles))

      // console.log(JSON.stringify(document, null, 2))
      console.log(JSON.stringify(document.children[0], null, 2))

      // const document = DocumentXML.convert(getDocumentFromZip(zip), styles)

      // .then(DocumentXML.convert)
      // .then(StylesXML.convertStyles)

      return { document, styles }
    })
    // .then((data) => {
    //   // console.log(data)
    //   // console.log(JSON.stringify(data.document, null, 2))
    // })
    // // .then(console.log)
    // // .then((document) => {
    // //   // console.log('document:', JSON.stringify(document, null, 2))
    // //   return DocumentXML.convertToSlate(document)
    // // })
    // // .then((slated) => {
    // //   console.log('slated::')
    // //   // console.log(slated)
    // //   console.log(JSON.stringify(slated, null, 2))
    // // })
    .catch((err) => {
      console.log('error at end of document read:', err)
      // console.error(err)
    })
}
