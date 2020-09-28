import * as IO from '../../lib/fileio'
import clipboardy from 'clipboardy'

enum Column {
  File = 0,
  FragmentId = 1,
  SectionId = 2,
  Style = 3,
  Title = 4
}

type Node = {
  title: string
  file: string
  style: string
  fragment: string
  level?: string
  children?: Node[]
}

type NodeTree = {
  children: Node[]
}

const setLevelFromStyle = (node) => {
  return {
    ...node,
    level: node.style.match(/H[0-9]/)
      ? parseInt(node.style.replace('H', ''))
      : 10
  }
}

const buildTree = (nodes: Node[]): NodeTree => {
  return nodes.reduce(
    (acc, n) => {
      if (!acc.current) {
        return {
          ...acc,
          current: n
        }
      }

      if (n.level > acc.current.level) {
        const last = {
          ...acc.current,
          children: acc.current.children ? [...acc.current.children, n] : [n]
        }

        return {
          ...acc,
          current: n,
          stack: [...acc.stack, last]
        }
      }

      if (n.level === acc.current.level) {
        const newCurrent = acc.stack[acc.stack.length - 1]
      }

      return acc
    },
    { children: [], current: undefined, stack: [] }
  )
}

const mapLevel = (lvl) => {
  switch (lvl) {
    default:
      return null
    case 'H1':
      return 0
    case 'H2':
      return 1
    case 'H3':
      return 2
  }
}

const mapTocStyle = (t) => {
  const name = t.slice(0, 2)
  const tail = t.slice(t.length - 1) === '_' ? ' em1' : ''

  switch (name) {
    default:
      return null
    case 'H1':
      return 'toch' + tail
    case 'H2':
      return 'toc' + tail
    case 'H3':
      return 'toc2' + tail
  }
}

const addHtmlTocItem = (toc: string, item) => {
  return !item.tocStyle
    ? toc
    : toc +
        `<p class="${item.tocStyle}"><a href="${item.filename}">${item.title}</a></p>` +
        '\n'
}

export const toc = (filename: string) => {
  return IO.readFile(filename).then((data) => {
    const result = data
      .split('\n')
      .filter((line) => line.trim().length)
      .map((line) => {
        return line.replace('\r', '').split('\t')
      })
      .map((arr) => ({
        title: arr[2],
        level: mapLevel(arr[1].slice(0, 2)),
        tocStyle: mapTocStyle(arr[1]),
        filename: arr[0]
      }))
      .reduce(
        (acc, item, idx) => {
          return {
            ...acc,
            htmlToc: addHtmlTocItem(acc.htmlToc, item),
            ncx: [
              ...acc.ncx,
              `<navPoint id="nav${idx}" playOrder="${
                idx + 2
              }"><navLabel><text>${
                item.title
              }</text></navLabel><content src="../Content/${item.filename}"/>`
            ],
            nav: [
              ...acc.nav,
              `<li><a href="../Content/${item.filename}">${item.title}</a></li>`
            ]
          }
        },
        { htmlToc: '', ncx: [], nav: [] }
      )

    clipboardy.write(result.nav.join('\n\t\t'))
    return result
  })
}
