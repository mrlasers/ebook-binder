import * as Rels from './documentRels'

test('one relationship', () => {
  expect(
    Rels.convert({
      name: 'Relationships',
      attributes: {},
      children: [
        {
          name: 'Relationship',
          attributes: {
            Id: 'i123',
            Type: 'http://../image',
            Target: 'media/image1.jpg'
          },
          children: []
        }
      ]
    })
  ).toMatchObject({
    i123: {
      type: 'image',
      target: {
        path: 'media',
        file: 'image1.jpg'
      }
    }
  })
  // ).toMatchObject({
  //   type: null,
  //   children: [
  //     {
  //       type: 'relationship',
  //       properties: {
  //         id: 'i123',
  //         type: 'http://../image',
  //         target: 'media/image1.jpg'
  //       },
  //       children: []
  //     }
  //   ]
  // })
})
