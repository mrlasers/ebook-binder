import * as Num from './numbering'

test('adds level for abstractNum', () => {
  expect(
    Num.convert(
      {},
      {
        name: 'lvl',
        attributes: { ilvl: '0' },
        children: [
          {
            name: 'numFmt',
            attributes: { val: 'decimal' },
            children: []
          },
          {
            name: 'lvlText',
            attributes: { val: '%1.' },
            children: []
          },
          {
            name: 'lvlJc',
            attributes: { val: 'left' },
            children: []
          },
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
                  ascii: 'Courier New'
                },
                children: []
              }
            ]
          }
        ]
      }
    )
  ).toMatchObject({
    level: {
      0: {
        format: 'decimal',
        text: '%1.',
        alignment: 'left',
        indent: { left: '720', hanging: '360' },
        font: 'Courier New'
      }
    }
  })
})
