import { Text } from './text'

it('creates Text object', () => {
  const t = Text.of({ text: 'Hello, World!' })
  const expected = { text: 'Hello, World!' }
  expect(t.value()).toMatchObject(expected)
})

it('compares two Text objects equal if key values are equal', () => {
  const t1 = Text.of({ text: 'Hello, World!', bold: true })
  const t2 = Text.of({ text: 'Hello, World!', bold: true })
  expect(t1.equals(t2)).toBe(true)
})

it('compares two Text objects to not be equal if key values are not equal', () => {
  const t1 = Text.of({ text: 'Hello, World!', bold: true })
  const t2 = Text.of({ text: 'Hello, World!', bold: false })
  expect(t1.equals(t2)).toBe(false)
})
