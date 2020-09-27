import JSZip from 'jszip'
import * as XML from '../xml'
import * as Doc from './nodeReducers'
import * as Num from './reduceNumbering'
import * as H from './word2html'
import * as Rels from './documentRels'

const XMLparse = (xml: string) => XML.parse(xml, { ignoreNS: true })

const DOCconvert = (node: XML.Node) => Doc.convert(null, node)

const readNumbering = (zip: JSZip) =>
  zip
    .file('word/numbering.xml')
    .async('string')
    .then(XMLparse)
    // .then(JSON.stringify)
    .then((node: XML.Node) => Num.convert(null, node))

export const parse = async (zip: JSZip) => {
  // gonna shelve the numbering for now
  const doc = {
    numbering: await readNumbering(zip),
    document: await zip
      .file('word/document.xml')
      .async('string')
      .then(XMLparse)
      .then(DOCconvert),
    relationships: await zip
      .file('word/_rels/document.xml.rels')
      .async('string')
      .then(XMLparse)
      .then(Rels.convert)
  }

  // console.log(JSON.stringify(doc.document, null, 2))
  // console.log(JSON.stringify(doc.relationships, null, 2))
  // console.log(JSON.stringify(doc.numbering, null, 2))
  console.log(JSON.stringify(Doc.process(doc.document, doc), null, 2))

  return ''

  // console.log(numbering)
  const xmlNodes = zip.file('word/document.xml').async('string').then(XMLparse)

  const docNodes = xmlNodes.then(DOCconvert)
  // .then(XML.getFirstChild)
  // .then(XML.getFirstChild)
  // .then(DOCconvert)
  // .then((docNode) => {
  //   return Doc.firstChild(docNode)
  // })
  // .then(JSON.stringify)

  const document = await docNodes.then((node) => JSON.stringify(node, null, 2))
  // .then(H.toHtml).then((html) => {
  //   return html.split('</p>').join('</p>\n')
  // })

  console.log(document)

  return zip
}
