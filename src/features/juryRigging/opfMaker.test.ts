import { tag } from './opfMaker'

it('creates a tag with no attributes or text', () => {
  return expect(tag('paragraph')()).toBe('<paragraph />')
})
