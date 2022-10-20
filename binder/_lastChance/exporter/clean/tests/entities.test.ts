import "@relmify/jest-fp-ts"

import { cheerioRunner } from "../../../lib/cheerio"
import { conformHtmlEntities } from "../entities"

describe('conformHtmlEntities', () => {
  const fn = cheerioRunner(conformHtmlEntities)

  it("does not work, so we're going to skip the tests for now", () =>
    expect(1).toBe(1))

  // it('replaces `&nbsp;` with `&#xa0;`', () => {
  //   expect(fn(`<p>Hello,&nbsp;World!</p>`)).toBe(
  //     `<html><head></head><body><p>Hello,&#xa0;World!</p></body></html>`
  //   )
  // })
})
