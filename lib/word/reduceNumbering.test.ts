import * as Numbering from './reduceNumbering'
import * as XML from '../xml'

const convert = (node: XML.Node) => Numbering.convert(null, node)

test('mvp numbering.xml (2020-09-23)', () => {
  expect(
    convert({
      name: 'numbering',
      attributes: {
        wpc:
          'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
        cx: 'http://schemas.microsoft.com/office/drawing/2014/chartex',
        cx1: 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
        cx2: 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
        cx3: 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
        cx4: 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
        cx5: 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
        cx6: 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
        cx7: 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
        cx8: 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
        mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        aink: 'http://schemas.microsoft.com/office/drawing/2016/ink',
        am3d: 'http://schemas.microsoft.com/office/drawing/2017/model3d',
        o: 'urn:schemas-microsoft-com:office:office',
        r:
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
        v: 'urn:schemas-microsoft-com:vml',
        wp14:
          'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
        wp:
          'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        w10: 'urn:schemas-microsoft-com:office:word',
        w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
        w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
        w16cex: 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
        w16cid: 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
        w16: 'http://schemas.microsoft.com/office/word/2018/wordml',
        w16se: 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
        wpg:
          'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
        wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
        wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
        wps:
          'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        Ignorable: 'w14 w15 w16se w16cid w16 w16cex wp14'
      },
      children: [
        {
          name: 'abstractNum',
          attributes: { abstractNumId: '0', restartNumberingAfterBreak: '0' },
          children: [
            { name: 'nsid', attributes: { val: '10124838' }, children: [] },
            {
              name: 'multiLevelType',
              attributes: { val: 'hybridMultilevel' },
              children: []
            },
            { name: 'tmpl', attributes: { val: 'B386ACAC' }, children: [] },
            {
              name: 'lvl',
              attributes: { ilvl: '0', tplc: '0409000F' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'decimal' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%1.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '720', hanging: '360' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '1', tplc: '04090019' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'lowerLetter' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%2.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '1440', hanging: '360' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '2', tplc: '0409001B', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'lowerRoman' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%3.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'right' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '2160', hanging: '180' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '3', tplc: '0409000F', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'decimal' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%4.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '2880', hanging: '360' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '4', tplc: '04090019', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'lowerLetter' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%5.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '3600', hanging: '360' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '5', tplc: '0409001B', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'lowerRoman' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%6.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'right' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '4320', hanging: '180' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '6', tplc: '0409000F', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'decimal' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%7.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '5040', hanging: '360' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '7', tplc: '04090019', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'lowerLetter' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%8.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '5760', hanging: '360' },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '8', tplc: '0409001B', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                {
                  name: 'numFmt',
                  attributes: { val: 'lowerRoman' },
                  children: []
                },
                { name: 'lvlText', attributes: { val: '%9.' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'right' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '6480', hanging: '180' },
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'abstractNum',
          attributes: { abstractNumId: '1', restartNumberingAfterBreak: '0' },
          children: [
            { name: 'nsid', attributes: { val: '673C3BC0' }, children: [] },
            {
              name: 'multiLevelType',
              attributes: { val: 'hybridMultilevel' },
              children: []
            },
            { name: 'tmpl', attributes: { val: 'DADE1FAA' }, children: [] },
            {
              name: 'lvl',
              attributes: { ilvl: '0', tplc: '04090001' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: '' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '720', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Symbol',
                        hAnsi: 'Symbol',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '1', tplc: '04090003', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: 'o' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '1440', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Courier New',
                        hAnsi: 'Courier New',
                        cs: 'Courier New',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '2', tplc: '04090005', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: '' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '2160', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Wingdings',
                        hAnsi: 'Wingdings',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '3', tplc: '04090001', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: '' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '2880', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Symbol',
                        hAnsi: 'Symbol',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '4', tplc: '04090003', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: 'o' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '3600', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Courier New',
                        hAnsi: 'Courier New',
                        cs: 'Courier New',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '5', tplc: '04090005', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: '' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '4320', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Wingdings',
                        hAnsi: 'Wingdings',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '6', tplc: '04090001', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: '' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '5040', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Symbol',
                        hAnsi: 'Symbol',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '7', tplc: '04090003', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: 'o' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '5760', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Courier New',
                        hAnsi: 'Courier New',
                        cs: 'Courier New',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              name: 'lvl',
              attributes: { ilvl: '8', tplc: '04090005', tentative: '1' },
              children: [
                { name: 'start', attributes: { val: '1' }, children: [] },
                { name: 'numFmt', attributes: { val: 'bullet' }, children: [] },
                { name: 'lvlText', attributes: { val: '' }, children: [] },
                { name: 'lvlJc', attributes: { val: 'left' }, children: [] },
                {
                  name: 'pPr',
                  attributes: {},
                  children: [
                    {
                      name: 'ind',
                      attributes: { left: '6480', hanging: '360' },
                      children: []
                    }
                  ]
                },
                {
                  name: 'rPr',
                  attributes: {},
                  children: [
                    {
                      name: 'rFonts',
                      attributes: {
                        ascii: 'Wingdings',
                        hAnsi: 'Wingdings',
                        hint: 'default'
                      },
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'num',
          attributes: { numId: '1' },
          children: [
            { name: 'abstractNumId', attributes: { val: '0' }, children: [] }
          ]
        },
        {
          name: 'num',
          attributes: { numId: '2' },
          children: [
            { name: 'abstractNumId', attributes: { val: '1' }, children: [] }
          ]
        }
      ]
    })
  ).toMatchObject({
    numbers: {
      '1': { abstractNumId: 0 },
      '2': { abstractNumId: 1 }
    }
  })
})

test('make abstractNum', () => {
  expect(
    convert({
      name: 'abstractNum',
      attributes: {
        abstractNumId: '123'
      },
      children: [
        {
          name: 'lvl',
          attributes: { ilvl: '0' },
          children: []
        },
        {
          name: 'numFmt',
          attributes: { val: 'decimal' },
          children: []
        }
      ]
    })
  ).toMatchObject({
    abstractNumbers: {
      '123': {
        level: 0,
        format: 'decimal'
      }
    }
  })
})

test('make num', () => {
  expect(
    convert({
      name: 'num',
      attributes: { numId: '1' },
      children: [
        {
          name: 'abstractNumId',
          attributes: { val: '0' },
          children: []
        }
      ]
    })
  ).toMatchObject({
    numbers: {
      '1': {
        abstractNumId: 0
      }
    }
  })
})
