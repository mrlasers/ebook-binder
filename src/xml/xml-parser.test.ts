import { parse } from './xml-parser'
import { Node } from './node'

describe('XML parser', () => {
  it('parses an XML document', () => {
    const input = '<hello><world>Earth</world></hello>'
    const expected: Node = {
      name: 'hello',
      attributes: {},
      children: [
        {
          name: 'world',
          attributes: {},
          children: [{ text: 'Earth' }]
        }
      ]
    }

    return expect(parse(input)).resolves.toEqual(expected)
  })

  it('parses an XML document with attributes', () => {
    const input =
      '<hello id="p123"><world style="font-family: Garamond">Earth</world></hello>'
    const expected: Node = {
      name: 'hello',
      attributes: { id: 'p123' },
      children: [
        {
          name: 'world',
          attributes: { style: 'font-family: Garamond' },
          children: [{ text: 'Earth' }]
        }
      ]
    }

    return expect(parse(input)).resolves.toEqual(expected)
  })

  it('parses a "Hello, World!" Word docx', () => {
    const input =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14 wp14"><w:body><w:p><w:pPr><w:pStyle w:val="Normal"/><w:bidi w:val="0"/><w:jc w:val="left"/><w:rPr></w:rPr></w:pPr><w:r><w:rPr></w:rPr><w:t>Hello, World!</w:t></w:r></w:p><w:sectPr><w:type w:val="nextPage"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:left="1134" w:right="1134" w:header="0" w:top="1134" w:footer="0" w:bottom="1134" w:gutter="0"/><w:pgNumType w:fmt="decimal"/><w:formProt w:val="false"/><w:textDirection w:val="lrTb"/></w:sectPr></w:body></w:document>'
    const expected: Node = {
      name: 'w:document',
      attributes: {
        'xmlns:o': 'urn:schemas-microsoft-com:office:office',
        'xmlns:r':
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'xmlns:v': 'urn:schemas-microsoft-com:vml',
        'xmlns:w':
          'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
        'xmlns:wp':
          'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'xmlns:wps':
          'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        'xmlns:wpg':
          'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
        'xmlns:mc':
          'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'xmlns:wp14':
          'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
        'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
        'mc:Ignorable': 'w14 wp14'
      },
      children: [
        {
          name: 'w:body',
          attributes: {},
          children: [
            {
              name: 'w:p',
              attributes: {},
              children: [
                {
                  name: 'w:pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'w:pStyle',
                      attributes: { 'w:val': 'Normal' },
                      children: []
                    },
                    {
                      name: 'w:bidi',
                      attributes: { 'w:val': '0' },
                      children: []
                    },
                    {
                      name: 'w:jc',
                      attributes: { 'w:val': 'left' },
                      children: []
                    },
                    {
                      name: 'w:rPr',
                      attributes: {},
                      children: []
                    }
                  ]
                },
                {
                  name: 'w:r',
                  attributes: {},
                  children: [
                    { name: 'w:rPr', attributes: {}, children: [] },
                    {
                      name: 'w:t',
                      attributes: {},
                      children: [{ text: 'Hello, World!' }]
                    }
                  ]
                }
              ]
            },
            {
              name: 'w:sectPr',
              attributes: {},
              children: [
                {
                  name: 'w:type',
                  attributes: { 'w:val': 'nextPage' },
                  children: []
                },
                {
                  name: 'w:pgSz',
                  attributes: { 'w:w': '12240', 'w:h': '15840' },
                  children: []
                },
                {
                  name: 'w:pgMar',
                  attributes: {
                    'w:left': '1134',
                    'w:right': '1134',
                    'w:header': '0',
                    'w:top': '1134',
                    'w:footer': '0',
                    'w:bottom': '1134',
                    'w:gutter': '0'
                  },
                  children: []
                },
                {
                  name: 'w:pgNumType',
                  attributes: { 'w:fmt': 'decimal' },
                  children: []
                },
                {
                  name: 'w:formProt',
                  attributes: {
                    'w:val': 'false'
                  },
                  children: []
                },
                {
                  name: 'w:textDirection',
                  attributes: { 'w:val': 'lrTb' },
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }

    return expect(parse(input)).resolves.toMatchObject(expected)
  })
})
