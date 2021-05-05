import Path from 'path'
import * as IO from '../lib/fileio'
const toc = require('./carol-march/toc.json')

const manifest = toc
  .map((val, idx) => {
    return (
      '\t'.repeat(2) +
      `<item id="sec${
        idx + 1
      }" media-type="application/xhtml+xml" href="Content/${val.file}"/>`
    )
  })
  .join('\r\n')

const spine = toc
  .map((val, idx) => {
    return '\t'.repeat(2) + `<itemref idref="sec${idx + 1}"/>`
  })
  .join('\r\n')

const ncx = toc
  .map((val, idx) => {
    return `<navPoint id="sec${idx + 1}" playOrder="${
      idx + 2
    }"><navLabel><text>${val.title}</text></navLabel><content src="../Content/${
      val.file
    }"/></navPoint>`
  })
  .map((line) => '\t'.repeat(2) + line)
  .join('\r\n')

const landmarks = toc
  .filter((val) => val.landmark)
  .map((val, idx) => {
    return `<li><a epub:type="${val.landmark}" href="../Content/${val.file}">${val.title}</a></li>`
  })
  .map((line) => '\t'.repeat(2) + line)
  .join('\r\n')

const { stack, previous } = toc
  .filter((val) => {
    return val.level || !val.landmark
  })
  .reduce(
    (acc, val) => {
      if (!acc.previous) {
        return {
          stack: acc.stack,
          previous: {
            ...val,
            children: []
          }
        }
      }

      if (acc.previous.level < val.level) {
        return {
          stack: acc.stack,
          previous: {
            ...acc.previous,
            children: [...acc.previous.children, val]
          }
        }
      }

      if (acc.previous.level === val.level) {
        return {
          stack: [...acc.stack, acc.previous],
          previous: {
            ...val,
            children: []
          }
        }
      }

      return acc
    },
    {
      stack: [],
      previous: null
    }
  )

const navtoc = [...stack, previous]
  .map(function mapNode(node) {
    // return '<li>' +
    //   `<a href="${node.file}">` +
    //   node.title +
    //   '</a>' +
    //   node.children
    //   ? '<ol>' + 'children here' + '</ol>'
    //   : '' + '</li>'
    return `<li><a href="../Content/${
      node.file
    }">${node.title}</a>${node.children?.length ? '\r\n\t<ol>\r\n\t\t' + node.children.map(mapNode).join('\r\n\t\t') + '\r\n\t</ol>\r\n' : ''}</li>`
  })
  .join('\r\n')

const htmltoc = toc
  .filter((node) => node.level)
  .map((node) => {
    const tocClass =
      node.level === 2
        ? node.title === 'Interlude'
          ? 'toc-i'
          : 'toc-2'
        : node.title.match(/^Part /)
        ? 'toc-ch'
        : 'toc'
    return `<p class="${tocClass}"><a href="${node.file}">${node.title}</a></p>`
  })
  .join('\r\n')

// console.log(navtoc)

// IO.writeFile(
//   Path.join(__dirname, './carol-march/output', 'manifest.xml'),
//   manifest
// ).then(console.log)

// IO.writeFile(
//   Path.join(__dirname, './carol-march/output', 'spine.xml'),
//   spine
// ).then(console.log)

// IO.writeFile(Path.join(__dirname, './carol-march/output', 'ncx.xml'), ncx)

// IO.writeFile(
//   Path.join(__dirname, './carol-march/output', 'landmarks.xml'),
//   landmarks
// )

// IO.writeFile(
//   Path.join(__dirname, './carol-march/output', 'navtoc.txt'),
//   JSON.stringify(navtoc, null, 2)
// )

IO.writeFile(
  Path.join(__dirname, './carol-march/output', 'toc.xhtml'),
  htmltoc // JSON.stringify(htmltoc, null, 2)
)

IO.writeFile(
  Path.join(__dirname, './carol-march/output', 'navtoc.xml'),
  navtoc // JSON.stringify(htmltoc, null, 2)
)

// console.log(Path.join(__dirname, './carol-march/output', 'manifest.xml'))
