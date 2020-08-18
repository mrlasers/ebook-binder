import * as Xml from './xml-reader'

it('passes a test', () => expect(1).toBe(1))

// describe('Parser', () => {
//   it('parses <hello style="cool"><world>Earth</world></hello>', () => {
//     const input = '<hello style="cool"><world>Earth</world></hello>'
//     const expected = {
//       type: 'node',
//       name: 'hello',
//       attributes: {
//         style: 'cool'
//       },
//       children: [
//         {
//           type: 'node',
//           name: 'world',
//           attributes: {},
//           children: [
//             {
//               type: 'text',
//               text: 'Earth'
//             }
//           ]
//         }
//       ]
//     }

//     expect.assertions(1)
//     return expect(Reader.parse(input)).resolves.toEqual(expected)
//   })

//   it('parses xml and ignores tag namespaces', () => {
//     expect(
//       Reader.parse('<w:hello>World!</w:hello>', { ignoreNS: true })
//     ).resolves.toMatchObject({
//       name: 'hello',
//       children: [{ type: 'text', text: 'World!' }]
//     })
//   })

//   it('parses a "Hello, World!" Word document.xml', () => {
//     const input =
//       '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14 wp14"><w:body><w:p><w:pPr><w:pStyle w:val="Normal"/><w:bidi w:val="0"/><w:jc w:val="left"/><w:rPr></w:rPr></w:pPr><w:r><w:rPr></w:rPr><w:t>Hello, World!</w:t></w:r></w:p><w:sectPr><w:type w:val="nextPage"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:left="1134" w:right="1134" w:header="0" w:top="1134" w:footer="0" w:bottom="1134" w:gutter="0"/><w:pgNumType w:fmt="decimal"/><w:formProt w:val="false"/><w:textDirection w:val="lrTb"/></w:sectPr></w:body></w:document>'
//     const expected = {
//       name: 'w:document',
//       children: [
//         {
//           name: 'w:body',
//           children: [
//             {
//               name: 'w:p',
//               children: [
//                 {
//                   name: 'w:pPr',
//                   children: [
//                     { name: 'w:pStyle' },
//                     { name: 'w:bidi' },
//                     { name: 'w:jc' },
//                     { name: 'w:rPr' }
//                   ]
//                 },
//                 {
//                   name: 'w:r',
//                   children: [
//                     { name: 'w:rPr' },
//                     {
//                       name: 'w:t',
//                       children: [
//                         {
//                           type: 'text',
//                           text: 'Hello, World!'
//                         }
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             },
//             {
//               name: 'w:sectPr',
//               children: [
//                 { name: 'w:type' },
//                 { name: 'w:pgSz' },
//                 { name: 'w:pgMar' },
//                 { name: 'w:pgNumType' },
//                 { name: 'w:formProt' },
//                 { name: 'w:textDirection' }
//               ]
//             }
//           ]
//         }
//       ]
//     }

//     return expect(Reader.parse(input)).resolves.toMatchObject(expected)
//   })
// })

// describe('Elements', () => {
//   it('creates a text element', () => {
//     const input = 'Hello, World!'
//     const expected = { type: 'text', text: 'Hello, World!' }
//     return expect(Reader.createElement(input)).toEqual(expected)
//   })

//   it('creates node element with just a name', () => {
//     const input = { name: 'hello', attributes: {} }
//     const expected = {
//       type: 'node',
//       name: 'hello',
//       attributes: {},
//       children: []
//     }

//     return expect(Reader.createElement(input)).toEqual(expected)
//   })

//   it('creates node element with attributes', () => {
//     const input = {
//       name: 'hello',
//       attributes: { style: 'paragraph', id: 'p001' }
//     }
//     const expected = {
//       type: 'node',
//       name: 'hello',
//       attributes: {
//         style: 'paragraph',
//         id: 'p001'
//       },
//       children: []
//     }

//     return expect(Reader.createElement(input)).toEqual(expected)
//   })
// })
