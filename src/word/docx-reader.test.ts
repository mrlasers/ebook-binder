import * as Docx from './docx-reader'
import * as Xml from '../xml/xml-reader'

const helloDoc =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14 wp14"><w:body><w:p><w:pPr><w:pStyle w:val="Normal"/><w:bidi w:val="0"/><w:jc w:val="left"/><w:rPr></w:rPr></w:pPr><w:r><w:rPr></w:rPr><w:t>Hello, World!</w:t></w:r></w:p><w:sectPr><w:type w:val="nextPage"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:left="1134" w:right="1134" w:header="0" w:top="1134" w:footer="0" w:bottom="1134" w:gutter="0"/><w:pgNumType w:fmt="decimal"/><w:formProt w:val="false"/><w:textDirection w:val="lrTb"/></w:sectPr></w:body></w:document>'

const helloObj = Xml.parse(helloDoc)

it('gets xmlns object', () => {
  const result = Docx.getNamespaces(helloObj)
  expect(result).toBeInstanceOf('object')
})

// describe('Docx Parser', () => {
//   it('throws if document structure is wrong', () => {
//     expect(() =>
//       Docx.parse({
//         type: 'node',
//         name: 'hello',
//         attributes: {},
//         children: [{ type: 'text', text: 'world' }]
//       })
//     ).toThrow('Invalid Word XML object')
//   })

//   it('parses a simple document structure', async () => {
//     const doc = await Xml.parse(helloDoc, { ignoreNS: true }).then(Docx.parse)

//     const expected = {
//       sections: [
//         {
//           paragraphs: [{}]
//         }
//       ]
//     }

//     expect(doc.sections).toHaveLength(1)
//     expect(doc).toMatchObject(expected)
//   })
// })

// describe('Docx helper functions', () => {
//   it('adds new Section to document', () => {
//     const doc = {
//       sections: []
//     }
//     const expected = {
//       sections: [{ paragraphs: [] }]
//     }

//     expect(Docx.addNewSection(doc)).toMatchObject(expected)
//   })
// })
