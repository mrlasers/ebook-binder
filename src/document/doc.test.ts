import * as Doc from './doc'

describe('Text class', () => {
  it('creates a Text object & prints text + html', () => {
    const t = Doc.Text.of('Hello, World!')

    expect(t.getText()).toBe('Hello, World!')
    expect(t.getHtml()).toBe('Hello, World!')
  })

  it('creates Text object w/ bold+italic & gets its output strings', () => {
    const t = Doc.Text.of('Hello, World!', { bold: true, italic: true })

    expect(t.getText()).toBe('Hello, World!')
    expect(t.getHtml()).toBe('<i><b>Hello, World!</b></i>')
  })

  it('creates Text object w/ italic+bold & gets its output strings', () => {
    const t = Doc.Text.of('Hello, World!', { italic: true, bold: true })

    expect(t.getText()).toBe('Hello, World!')
    expect(t.getHtml()).toBe('<i><b>Hello, World!</b></i>')
  })
})

describe('Linebreak class', () => {
  it('creates a Linebreak & prints output', () => {
    const result = Doc.Linebreak.of()

    expect(result.getText()).toBe('')
    expect(result.getHtml()).toBe('<br/>')
  })
})
