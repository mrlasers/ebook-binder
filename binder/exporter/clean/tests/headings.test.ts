import "@relmify/jest-fp-ts"

import { cheerioRunner } from "../../../lib/cheerio"
import { convertOversetHeadings, wrapConsecutiveH1Headings } from "../headings"

describe('convertOversetHeadings', () => {
  const fn = cheerioRunner(convertOversetHeadings)

  it('converts h7, h8, h9, and h10 headings to p.h#', () => {
    const html = `<h7>Seven</h7><h8>Eight</h8><h9>Nine</h9><h10>Ten</h10>`
    const expected = `<p class="h7">Seven</p><p class="h8">Eight</p><p class="h9">Nine</p><p class="h10">Ten</p>`

    expect(fn(html)).toBe(expected)
  })

  it('converts h7 with `id` property', () => {
    const html = `<h7 id="p23">Seven</h7>`
    const expected = `<p id="p23" class="h7">Seven</p>`

    expect(fn(html)).toBe(expected)
  })

  it('converts h8 with `id` and nested elements', () => {
    const html = `<h7 id="p23">Seven <em>ate</em> Nine</h7>`
    const expected = `<p id="p23" class="h7">Seven <em>ate</em> Nine</p>`

    expect(fn(html)).toBe(expected)
  })
})

// describe('wrapConsecutiveH1Headings', () => {
//   const fn = cheerioRunner(
//     wrapConsecutiveH1Headings({ divClass: 'chapter', secondClass: 'title' })
//   )
// })
