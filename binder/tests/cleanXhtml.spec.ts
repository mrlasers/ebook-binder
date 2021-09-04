import {
  mergeLists,
  unwrapStrongHeading,
  removeEmptyParagraphs,
  replaceBreak,
  wrapListItemContentInParagraph,
  removeClasses
} from '../processing/cleanXhtml'

it('removes classes', () => {
  const html =
    '<p class="bad egg">Hello, <strong class="      "><em class="bad">World</em></strong>!</p>'
  const expected = '<p class="egg">Hello, <strong><em>World</em></strong>!</p>'
  expect(removeClasses('bad')(html).html).toBe(expected)
})

it('wraps contents of LI in P, if not already wrapped', () => {
  const html = '<ul><li>Hello, World!</li><li>The end.</li></ul>'
  const expected =
    '<ul><li><p>Hello, World!</p></li><li><p>The end.</p></li></ul>'
  expect(wrapListItemContentInParagraph(html).html).toBe(expected)
})

it('wraps LI contents even when contents includes paragraphs or divs', () => {
  const html = '<ul><li>Hello, World!</li><li><p>The end.</p></li></ul>'
  const expected =
    '<ul><li><p>Hello, World!</p></li><li><p>The end.</p></li></ul>'
  expect(wrapListItemContentInParagraph(html).html).toBe(expected)
})

it('merges consecutive lists', () => {
  const html =
    '<h1 id="r1">Hello, World!</h1><p>It was the best of times, it was the end of times...</p><ul><li>One</li></ul><ul><li>Two</li></ul><ul><li>Three</li></ul><p>He was a dark <em>and</em> stormy knight...</p><ul><li>Alpha</li></ul><ul><li>Bravo</li></ul><p>The End.</p><ul><li>Appendix</li></ul>'
  const expected =
    '<h1 id="r1">Hello, World!</h1><p>It was the best of times, it was the end of times...</p><ul><li>One</li><li>Two</li><li>Three</li></ul><p>He was a dark <em>and</em> stormy knight...</p><ul><li>Alpha</li><li>Bravo</li></ul><p>The End.</p><ul><li>Appendix</li></ul>'

  expect(mergeLists(html).html).toBe(expected)
})

it('removes strong tags in headings', () => {
  const html =
    '<h1><strong>Chapter One</strong></h1><h2>Boo<strong>!</strong></h2>'
  const expected = '<h1>Chapter One</h1><h2>Boo!</h2>'
  expect(unwrapStrongHeading(html).html).toBe(expected)
})

it('removed empty paragraphs', () => {
  const html =
    '<p><strong>      </strong></p><p>Hello, World!</p><p><strong></strong></p><p>The End.</p>'
  const expected = '<p>Hello, World!</p><p>The End.</p>'
  expect(removeEmptyParagraphs(html).html).toBe(expected)
})

it('replaces break placeholders', () => {
  const html =
    '<p>Hello, World!</p><div class="break">whatever</div><p>The End.</p>'
  const expected =
    '<p>Hello, World!</p><div class="break"><img src="../Images/break.jpg" alt=""/></div><p>The End.</p>'
  expect(replaceBreak(html).html).toBe(expected)
})
