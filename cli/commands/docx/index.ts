import { createCommand } from 'commander'
import { readFile } from '../../../lib/fileio'
import JSZip from 'jszip'
import { promises as Fs } from 'fs'
import { parse, Node, Element, isText } from '@mrlasers/xml-parser'
import Path from 'path'
import * as Fp from '../../../lib/fp'
import { left } from 'fp-ts/lib/EitherT'
import { pipe, flow } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Docx from './processDocx'

import {
  processor,
  getChildByName,
  nodeProcessor,
  wDocument,
  wBody,
  getFirstChildByName
} from './functions'

const getFile = (filename) => (zip: JSZip) => zip.file(filename).async(`string`)

// const getWBodyChild = (node: Element) => {
//   return node.children.find((n) => !isText(n) && n.name === 'w:body')
// }

const getByName = (name: string) => (node: Element) =>
  !isText(node) && node.name === name

const getChildBy = (predicate: (el: Element) => boolean) => (node: Element) => {
  return node.children.find(predicate)
}

const getWBodyChild = getChildBy(getByName('w:body'))

const getFirstChild = (node: Node) => {
  if (isText(node)) {
    return null
  }

  return node.children[0] || null
}

const getFirst = (arr: any[]) => arr[0]

const processNode = (node: Node): Node => {
  if (isText(node)) {
    return node
  }

  if (node.name === 'w:p') {
    return node.children.reduce(
      (p: Element, child) => {
        if (isText(child)) {
          return p
        }

        switch (child.name) {
          default:
            return p
          case 'w:pPr':
            return {
              ...p,
              children: [...p.children, ...child.children]
            }
        }
      },
      {
        name: 'paragraph',
        attributes: {},
        children: []
      }
    )
  }

  return {
    name: 'NOOP',
    attributes: {
      name: node.name
    },
    children: []
  }
}

type Document = {
  sections: { children: Element[] }[]
}

const wPPr = (para: Element) => (pPr: Element) => {
  return pPr.children.reduce((p: Element, prop) => {
    if (isText(prop)) {
      return p
    }

    switch (prop.name) {
      default:
        return p
      case 'w:pStyle':
        if (prop.attributes['w:val'] === 'Heading1') {
          return {
            ...p,
            name: 'heading',
            attributes: {
              ...p.attributes,
              level: 1
            }
          }
        }

        return {
          ...p,
          attributes: {
            ...p.attributes,
            style: prop.attributes['w:val']
          }
        }
    }
  }, para)
}

const wPAttributes = (p: Element) => {
  const knownAttrs: string[] = []
  const newAttrs = Object.keys(p.attributes).reduce((attrs, key) => {
    if (knownAttrs.includes(key)) {
      return {
        ...attrs,
        [key]: p.attributes[key]
      }
    }

    return attrs
  }, {})

  console.log(`newAttrs: ${newAttrs}`)

  return newAttrs
}

const wP = (doc: Document) => (p: Element) => {
  const [heads, tail] = Fp.headsTail(doc.sections)
  const para = p.children.reduce(
    (acc: Element, child) => {
      if (isText(child)) {
        return acc
      }

      switch (child.name) {
        default:
          return {
            ...acc,
            children: [...acc.children, child]
          }
        case 'w:pPr':
          return wPPr(acc)(child)
      }
    },
    {
      name: 'paragraph',
      attributes: wPAttributes(p),
      children: []
    }
  )
  return {
    sections: [...heads, { ...tail, children: [...tail.children, para] }]
  }
}

// const wBody = (body: Element) => {
//   return body.children.reduce(
//     (body, child) => {
//       if (isText(child)) {
//         return body
//       }

//       switch (child.name) {
//         default:
//           return body
//         case 'w:p':
//           return wP(body)(child)
//       }
//     },
//     {
//       sections: [
//         {
//           children: []
//         }
//       ]
//     }
//   )
// }

export const parseWordDocument = (doc: Node): Element => {
  if (isText(doc)) {
    return null
  }

  return pipe(
    doc,
    getFirstChildByName('w:body'),
    O.map(Docx.body),
    O.fold(
      () => null,
      (x) => x
    )
  )
}

export const docx = createCommand('docx')
  .description(`Convert Word docx to ebook`)
  .option('-o --output', 'Output directory')
  .arguments(`<docx>`)
  .action((docx) => {
    Fs.readFile(docx)
      .then((file) => {
        return new JSZip().loadAsync(file)
      })
      .then(getFile(`word/document.xml`))
      .then(parse)
      .then((xml) => {
        return [parseWordDocument(xml), xml]
      })
      // .then(wDocument)
      // .then(wBody)
      // .then(getWBodyChild)
      .then((x) =>
        Array.isArray(x)
          ? x.map((y) => JSON.stringify(y, null, 2))
          : JSON.stringify(x, null, 2)
      )
      .then((data) => {
        const filename = Path.resolve(
          Path.dirname(docx),
          `${Path.basename(docx)}.json`
        )
        const fileraw = Path.resolve(
          Path.dirname(docx),
          `${Path.basename(docx)}_raw.json`
        )
        const json = data[0] || (data as string)
        const raw = data[1] || null

        if (raw) {
          Fs.writeFile(fileraw, raw).catch(console.error)
        }

        return Fs.writeFile(filename, json).then(
          (_) => `Output written to ${filename}`
        )
      })
      .then(console.log)
      .catch(console.error)
  })
