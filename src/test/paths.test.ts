import { combineDefaultEpubPaths, combineDefaultSourcePaths } from '../paths'

describe(`#combineDefaultSourcePaths`, () => {
  it(`combines default source paths with htmlPath`, () => {
    const paths = {
      htmlPath: `C:\\source\\xhtml`
    }

    const expected = {
      htmlPath: `C:\\source\\xhtml`
    }

    expect(combineDefaultSourcePaths(paths)).toMatchObject(expected)
  })
})
