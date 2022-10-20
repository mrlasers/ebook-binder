import "@relmify/jest-fp-ts"

import { cheerioRunner } from "../../../lib/cheerio"
import { unwrapDocumentBody } from "../body"

describe('unwrapDocumentBody', () => {
  const unwarpBody = cheerioRunner(unwrapDocumentBody)

  it('unwraps minimal document body', () => {
    const html = `<html><head><title>Hello, World!</title></head><body><h1>Hello, World!</h1><p>He was a dark and stormy knight...</p></body></html>`
    const expected = `<h1>Hello, World!</h1><p>He was a dark and stormy knight...</p>`

    expect(unwarpBody(html)).toBe(expected)
  })

  it('does not unwrap html fragment with no body', () => {
    const html = `<p>Hello, World!</p>`
    expect(unwarpBody(html)).toBe(html)
  })
})
