import '@relmify/jest-fp-ts'
import { normalize, loadManifestFileItemHtml } from '../manifest/loader'
import * as TE from 'fp-ts/TaskEither'

it('normalizes a manifest file item', () => {
  const expected = {
    filename: 'Hello, World!'
  }

  expect(normalize('Hello, World!')).toMatchObject(expected)
  expect(normalize({ filename: 'Hello, World!' })).toMatchObject(expected)
})

it('tests a TE', () => {
  expect(TE.of('hello, world!')()).toMatchObject(TE.of('hello, world!')())
})

describe('readFile', () => {
  const fileItem = { filename: 'hello.xhtml' }

  it('loads html from fileitem filename and puts it into object', () => {
    const html = '<p>Hello, World!</p>'
    const result = loadManifestFileItemHtml(fileItem, () => TE.of(html))

    result().then((item) => {
      expect(item).toEqualRight({
        filename: 'hello.xhtml',
        html: '<p>Hello, World!</p>'
      })
    })
  })

  it('fails to load html from fileitem filename', () => {
    const html = '<p>Hello, World!</p>'
    const result = loadManifestFileItemHtml(fileItem, () =>
      TE.left(new Error('whatever'))
    )

    result().catch((item) => {
      expect(item).toEqualLeft({
        msg: 'whatever'
      })
    })
  })
})
