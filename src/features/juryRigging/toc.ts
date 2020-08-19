interface LevelMap {
  [key: string]: number
}

export interface Heading {
  file: string
  level: number
  text: string
}

export interface LevelClassMap {
  default?: string
  1?: string
  2?: string
  3?: string
  4?: string
  5?: string
  6?: string
}

export interface ParseHeadingsLine {
  levelMap: LevelClassMap
}

export interface HeadingToHtmlOptions {
  className?: string | LevelClassMap
}

export interface TxtToHtmlOptions {
  joiner: string
}

export interface parseHeadingsTxtToHtmlOptions {
  joiner: string
  levelMap?: LevelMap
  className?: LevelClassMap
}

export const parseHeadingsLine = (levelMap?: LevelMap) => (
  line: string
): Heading => {
  const [file, _id, _secId, level, text] = line.split('\t').map((t) => t.trim())
  return { file, level: levelMap?.[level] || 0, text }
}

export const headingToHtml = (className?: string | LevelClassMap) => (
  heading: Heading
): string => {
  const tocClass =
    typeof className === 'string'
      ? className
      : className?.[heading.level] ?? className?.default ?? ''
  return `<p${tocClass ? ` class="${tocClass}"` : ''}><a href="${
    heading.file
  }">${heading.text}</a></p>`
}

export function parseHeadingsTxtToHtml(
  headings_txt: string,
  options?: parseHeadingsTxtToHtmlOptions
) {
  return headings_txt
    .trim()
    .split('\n')
    .map((t) => t.trim())
    .map(parseHeadingsLine(options?.levelMap))
    .map(headingToHtml(options?.className))
    .join(options?.joiner ?? '')
}
