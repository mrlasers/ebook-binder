import { document } from './docx-reader'

it('gets document body', () => {
  const input = {
    name: 'w:document',
    attributes: {},
    children: [{ name: 'w:body', attributes: {}, children: [] }]
  }
  const expected = { children: [] }
  expect(document(input)).toEqual(expected)
})

const input = {
  name: 'w:document',
  attributes: {
    'xmlns:o': 'urn:schemas-microsoft-com:office:office',
    'xmlns:r':
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'xmlns:v': 'urn:schemas-microsoft-com:vml',
    'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
    'xmlns:wp':
      'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'xmlns:wps':
      'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
    'xmlns:wpg':
      'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
    'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
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
