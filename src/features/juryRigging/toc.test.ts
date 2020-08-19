import { parseHeadingsTxtToHtml, parseHeadingsLine, headingToHtml } from './toc'

const headings_txt = `
Section01.xhtml		sec1		_blank_
Section02.xhtml		sec2	H1	CONTENTS
Section03.xhtml		sec3	H1	1. Introduction
`.trim()

describe('parse headings.txt', () => {
  it('parses headings to output html fragment', () => {
    const input = headings_txt
    const expected =
      '<p><a href="Section01.xhtml">_blank_</a></p><p><a href="Section02.xhtml">CONTENTS</a></p><p><a href="Section03.xhtml">1. Introduction</a></p>'
    expect(parseHeadingsTxtToHtml(input)).toBe(expected)
  })

  it('parses headings to output html fragment w/ custom joiner', () => {
    const input = headings_txt
    const expected =
      '<p><a href="Section01.xhtml">_blank_</a></p>\n<p><a href="Section02.xhtml">CONTENTS</a></p>\n<p><a href="Section03.xhtml">1. Introduction</a></p>'
    expect(parseHeadingsTxtToHtml(input, { joiner: '\n' })).toBe(expected)
  })
})

describe('parse lines of heading data', () => {
  it('parses headings line', () => {
    const input = 'Section01.xhtml		sec1		_blank_'
    const expected = {
      file: 'Section01.xhtml',
      level: 0,
      text: '_blank_'
    }
    expect(parseHeadingsLine()(input)).toEqual(expected)
  })

  it('parses headings line w/ levelMap', () => {
    const input = 'Section02.xhtml		sec2	H1	CONTENTS   '
    const options = {
      H1: 1
    }
    const expected = {
      file: 'Section02.xhtml',
      level: 1,
      text: 'CONTENTS'
    }
    expect(parseHeadingsLine(options)(input)).toEqual(expected)
  })
})

describe('heading to html', () => {
  it('converts heading to html string', () => {
    const input = {
      file: 'Section02.xhtml',
      level: 1,
      text: 'CONTENTS'
    }
    const expected = '<p><a href="Section02.xhtml">CONTENTS</a></p>'
    expect(headingToHtml()(input)).toBe(expected)
  })

  it('converts html to html w/ class name', () => {
    const input = {
      file: 'Section02.xhtml',
      level: 1,
      text: 'CONTENTS'
    }
    const options = 'toc'
    const expected = '<p class="toc"><a href="Section02.xhtml">CONTENTS</a></p>'
    expect(headingToHtml(options)(input)).toBe(expected)
  })

  it('converts html to html w/ level-mapped class name', () => {
    const input = {
      file: 'Section02.xhtml',
      level: 1,
      text: 'CONTENTS'
    }
    const options = {
      default: 'toc',
      1: 'toch'
    }
    const expected =
      '<p class="toch"><a href="Section02.xhtml">CONTENTS</a></p>'
    expect(headingToHtml(options)(input)).toBe(expected)
  })

  it('converts html to html w/o level-mapped class name', () => {
    const input = {
      file: 'Section02.xhtml',
      level: 2,
      text: 'CONTENTS'
    }
    const options = {
      default: 'toc',
      1: 'toch'
    }
    const expected = '<p class="toc"><a href="Section02.xhtml">CONTENTS</a></p>'
    expect(headingToHtml(options)(input)).toBe(expected)
  })
})
