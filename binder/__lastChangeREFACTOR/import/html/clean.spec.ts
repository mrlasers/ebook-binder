import { CheerioAPI } from 'cheerio'

import {
    addFootnoteRefs,
    addHeadingIDs,
    combineSiblingH1Headings,
    convertOversetHeadings,
    load,
    markupQA_GENDER,
    mergePullquotes,
    removeClasses,
    removeEmptyParagraphs,
    replaceBreaks,
    replaceIllustrationPlaceholders,
    unwrapDocumentBody
} from './clean'

type TestHelperInput = {
  input: string
  expected: string
  func: ($: CheerioAPI) => CheerioAPI
}

const testHelper = ({ input, expected, func }: TestHelperInput) =>
  expect(func(load(input)).html()).toBe(expected)

describe('helper functions for tests', () => {
  it('runs a helper function', () =>
    testHelper({
      input: '<p>Hello, World!</p>',
      expected: '<p>Hello, World!</p>',
      func: ($) => $
    }))
})

it('unwraps document body', () => {
  testHelper({
    input: '<body><p>Hello, World!</p></body>',
    expected: '<p>Hello, World!</p>',
    func: unwrapDocumentBody
  })
})

it('merges pullquotes', () => {
  testHelper({
    input:
      '<div class="pullquote">Hello, World!</div><div class="pullquote"><ul><li>One</li><li>Two</li></ul></div><div class="pullquote">The.End</div>',
    expected:
      '<div class="pullquote"><p>Hello, World!</p><ul><li>One</li><li>Two</li></ul><p>The.End</p></div>',
    func: mergePullquotes
  })
})

it('replaces break paragraphs', () => {
  testHelper({
    input: '<p class="break">BOOBOO</p>',
    expected: '<div class="break"><img src="booboo.jpg" alt="break"/></div>',
    func: replaceBreaks('booboo.jpg')
  })
})

describe('#replaceIllustrationPlaceholders', () => {
  it('replaces when file extension', () => {
    testHelper({
      input: '<div class="illus ileft">HelloWorld.jpg|Hello, World!!!</div>',
      expected:
        '<div class="illus ileft"><img src="HelloWorld.jpg" alt="Hello, World!!!"/></div>',
      func: replaceIllustrationPlaceholders
    })
  })
  it('replaces when no file extension', () => {
    testHelper({
      input: '<div class="illus ileft">  HelloWorld  | Hello, World!!!  </div>',
      expected:
        '<div class="illus ileft"><img src="HelloWorld.jpg" alt="Hello, World!!!"/></div>',
      func: replaceIllustrationPlaceholders
    })
  })
})

it('combines sibling H1 headings', () => {
  testHelper({
    input: '<h1 id="hi">Hello</h1><h1>World!</h1>',
    expected: '<h1 id="hi">Hello, World!</h1>',
    func: combineSiblingH1Headings(', ')
  })
})

it('adds spans to markup QA paragraphs', () => {
  testHelper({
    input:
      '<div class="pullquote qa"><p>   Q   Hello, World?</p></div><div class="pullquote qa"><p>  A    The.End</p></div>',
    expected:
      '<div class="pullquote qa"><p><span>Q</span> Hello, World?</p></div><div class="pullquote qa"><p><span>A</span> The.End</p></div>',
    func: markupQA_GENDER
  })
})

it('adds heading IDs', () => {
  testHelper({
    input: '<h1>Hello, World!</h1><h2 id="p1">The.End</h2>',
    expected: '<h1 id="r1">Hello, World!</h1><h2 id="p1">The.End</h2>',
    func: addHeadingIDs('r')
  })
})

it('converts headings over level 6 to paragraphs with respective heading class', () => {
  testHelper({
    input: '<h7 class="hi">Hello, World!</h7>',
    expected: '<p class="hi h7">Hello, World!</p>',
    func: convertOversetHeadings
  })
})

it('removes classes', () => {
  testHelper({
    input: '<p class="hello world">Hello, World!</p>',
    expected: '<p class="hello">Hello, World!</p>',
    func: removeClasses('world')
  })
})

it('removes empty paragraphs', () => {
  testHelper({
    input:
      '<p>Hello, World!</p><p><strong>/</strong></p><p></p><p><em></p><p>The.End</p>',
    expected: '<p>Hello, World!</p><p>The.End</p>',
    func: removeEmptyParagraphs
  })
})

it('adds footnote markup', () => {
  testHelper({
    input: '<p>Hello, World!<sup>  23  </sup></p>',
    expected:
      '<p>Hello, World!<sup><a id="fnref23" href="#fn23" epub:type="noteref">23</a></sup></p><aside epub:type="footnote"><table class="footnotes"><tbody><tr id="fn23"><td><a href="#fnref23">23.</a></td><td><p>Hello, World!</p></td></tr></tbody></table></aside>',
    func: addFootnoteRefs({ '23': ['Hello, World!'] })
  })
})
