import "@relmify/jest-fp-ts"

import { cheerioRunner } from "../../../lib/cheerio"
import { removeEmptyParagraphs } from "../paragraphs"

describe('removeEmptyParagraphs', () => {
  const fn = cheerioRunner(removeEmptyParagraphs)

  it('removes empty paragraphs', () => {
    const html = `
<body>
  <p>Hello, World!</p>
  <p></p>
  <p>Goodnight, Moon.</p>
  <p>       </p>
</body>
`
    const expected = `
<body>\n  <p>Hello, World!</p>\n  \n  <p>Goodnight, Moon.</p>\n  \n</body>
`

    expect(fn(html)).toBe(expected)
  })
})
