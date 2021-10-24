import { Json } from 'fp-ts/Json'
import { Footnotes } from '../types'

export const FootnoteseJson = (json: Json): Footnotes => {
  const result = Object.keys(json).reduce<Footnotes>((acc, key) => {
    if (!Number(key)) {
      return acc
    }

    const jsonKey = json[key]

    const footnote = (Array.isArray(jsonKey) ? jsonKey : [])
      .map((s) =>
        typeof s === 'string' ? s.trim().replace(/\s\s+/g, ' ') : ''
      )
      .filter((s) => s.length)

    return {
      ...acc,
      [key]: footnote
    }
  }, {})

  return result
}
