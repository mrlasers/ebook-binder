import * as Doc from './document'

describe('Document.xml - MVP features', () => {
  test('single list node', () => {
    expect(
      Doc.process({
        children: [
          {
            type: 'list',
            properties: { numId: 1 },
            children: [{ text: 'Hello' }]
          }
        ]
      })
    ).toMatchObject({
      children: [
        {
          type: 'list',
          properties: { numId: 1 },
          children: [
            {
              type: 'list-item',
              properties: {},
              children: [{ text: 'Hello' }]
            }
          ]
        }
      ]
    })
  })

  test('two list node children', () => {
    expect(
      Doc.process({
        children: [
          {
            type: 'list',
            properties: { numId: 1 },
            children: [{ text: 'Hello' }]
          },
          {
            type: 'list',
            properties: { numId: 1 },
            children: [{ text: 'World' }]
          }
        ]
      })
    ).toMatchObject({
      children: [
        {
          type: 'list',
          properties: { numId: 1 },
          children: [
            {
              type: 'list-item',
              properties: {},
              children: [{ text: 'Hello' }]
            },
            {
              type: 'list-item',
              properties: {},
              children: [{ text: 'World' }]
            }
          ]
        }
      ]
    })
  })

  test('image', () => {
    expect(
      Doc.process(
        {
          children: [
            {
              type: 'paragraph',
              properties: {},
              children: [
                {
                  type: 'image',
                  properties: {
                    inline: true,
                    name: 'Picture 1',
                    description: 'Coral',
                    id: 'rId5'
                  },
                  children: []
                }
              ]
            }
          ]
        },
        {
          relationships: {
            rId5: {
              type: 'image',
              target: {
                path: 'media',
                file: 'image1.jpg'
              }
            }
          }
        }
      )
    ).toMatchObject({
      children: [
        {
          type: 'paragraph',
          properties: {},
          children: [
            {
              type: 'image',
              properties: {
                id: 'rId5',
                file: 'image1.jpg'
                // target: {
                //   path: 'media',
                //   file: 'image1.jpg'
                // }
              }
            }
          ]
        }
      ]
    })
  })
})
