import { reducePropertyChildren, addAttrAsName } from './index'

it('passes a test', () => {
  expect(1).toBe(1)
})

it('adds attribute of name to target', () => {
  const target = {
    type: 'paragraph',
    attributes: {}
  }
  const source = {
    name: 'pStyle',
    attributes: {
      val: 'Normal'
    }
  }
  const expected = {
    type: 'paragraph',
    attributes: {
      style: 'Normal'
    }
  }

  expect(addAttrAsName(target, source, 'val', 'style')).toEqual(expected)
})

it('adds a property attribute to parent', () => {
  const parent = {
    type: 'paragraph',
    attributes: {},
    children: []
  }
  const properties = {
    children: [
      {
        name: 'pStyle',
        attributes: {
          val: 'Normal'
        }
      },
      {
        name: 'jc',
        attributes: {
          val: 'center'
        }
      }
    ]
  }
  const expected = {
    type: 'paragraph',
    attributes: {
      style: 'Normal',
      jc: 'center'
    },
    children: []
  }

  expect(reducePropertyChildren(parent, properties)).toEqual(expected)
})

const input = {
  name: 'document',
  children: [
    {
      name: 'body',
      children: [
        { name: 'p' },
        {
          name: 'sectPr',
          children: [
            {
              name: 'type',
              attributes: {
                val: 'nextPage'
              },
              children: []
            }
          ]
        }
      ]
    }
  ]
}
