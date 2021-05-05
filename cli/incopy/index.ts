import * as Xml from '@mrlasers/xml-parser'
import { pipe, flow } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'

const { isElement, isText } = Xml

import { compose } from '../../lib/fp'

const stringify = (x: any) => JSON.stringify(x, null, 2)

const namedElement = (name: string) => (node: Xml.Node) =>
  isElement(node) && node.name === name

const maybeNamedElement = (name: string) => (node: Xml.Node) =>
  isElement(node) && node.name === name ? O.of<Xml.Element>(node) : O.none

const maybeElement = (node: Xml.Node) => (isElement(node) ? O.of(node) : O.none)

const documentToChildren = flow(
  maybeNamedElement('Document'),
  O.map(({ children }) => children)
)

const childrenToStories = A.filterMap(
  flow(
    maybeNamedElement('Story'),
    O.map(flow((child) => child.children, A.filterMap(maybeElement)))
    // O.map((child) => child.children),
    // O.map(A.filterMap(maybeElement))
  )
)
// A.compact

const documentToStories = flow(documentToChildren, O.map(childrenToStories))

const characterStyleToStyle = (style: string | number | boolean): string => {
  if (typeof style !== 'string') {
    return undefined
  }

  // console.log(`style: ${style}`)

  switch (style?.match(/\/.+$/)?.[0]) {
    default:
      return undefined
    case '/Running Head Text':
      return 'toc'
  }
}

const characterStyleDict: Dictionary = {
  'Running Head Text': 'toc',
  default: undefined
}

type Dictionary = {
  [key: string]: string | number | boolean
  default: string | number | boolean
}

const matchInDictionary = (
  dict: Dictionary,
  pre?: (i: string | number | boolean) => string
) => (idx: string | number | boolean) => {
  const key = pre ? pre(idx) : idx

  if (typeof key === 'boolean') {
    return dict.default
  }

  return dict[key] || dict.default
}

const matchCharStyle = matchInDictionary(characterStyleDict, (key) => {
  if (typeof key === 'boolean') {
    return undefined
  }

  return key.toString().split('/').pop()
})

export const parseIncopy = (xml: string) => {
  return Xml.parse(xml)
    .then(documentToStories)
    .then(O.chain(A.head)) // so we can just test on one story
    .then(O.map(A.filter(({ name }) => name === 'ParagraphStyleRange')))
    .then(
      O.chain(
        flow(
          A.map((p) => {
            return {
              name: 'p',
              attributes: {
                style: p.attributes?.AppliedParagraphStyle
              },
              children: pipe(
                p.children,
                A.filterMap(
                  flow(
                    maybeNamedElement('CharacterStyleRange'),
                    O.map<Xml.Element, Xml.Element>(
                      ({ name, attributes, children }) => ({
                        name: 'run',
                        attributes: Object.keys(attributes).reduce(
                          (acc, key) => {
                            switch (key) {
                              default:
                                return acc
                              case 'AppliedCharacterStyle':
                                return {
                                  ...acc,
                                  style: matchCharStyle(attributes[key])
                                }
                              case 'FontStyle':
                                if (attributes[key] === 'Bold') {
                                  return { ...acc, bold: true }
                                }
                                if (attributes[key] === 'Italic') {
                                  return { ...acc, italic: true }
                                }
                                return acc
                            }
                          },
                          {}
                        ),
                        children: pipe(
                          children,
                          A.filter(isElement)
                          // A.filter((el) => {
                          //   switch (el.name) {
                          //     default:
                          //       return true
                          //     case 'Br':
                          //       return false
                          //   }
                          // }),
                        )
                      })
                    )
                  )
                )
                // A.map(({ name, attributes, children }) => {
                //   return {
                //     name: 'run',
                //     attributes: {},
                //     children: pipe(
                //       children,
                //       A.filterMap((c) => {
                //         if (isText(c)) {
                //           return O.none
                //         }

                //         if (c.name === 'Content') {
                //           const text = c.children.reduce((acc, val) => {
                //             if (isText(val)) {
                //               return `${acc} ${val.text}`.trim()
                //             }

                //             return acc
                //           }, '')

                //           return O.of(Xml.text(text))
                //         }

                //         return O.none
                //       })
                //     )
                //   }
                // })
              )
            }
          }),
          A.head
        )
      )
    )
    .then(stringify)
    .then(console.log)
}

export const _parseIncopy = (xml: string) => {
  console.log('parsing incopy')
  Xml.parse(xml)
    .then((node) => {
      // get the Story elements
      if (isElement(node)) {
        // return node.children.filter(byName('Story'))
        return node.children.filter((child) => {
          return isElement(child) && child.name === 'Story'
        })
      }
    })
    .then((children: Xml.Node[]) => {
      return children[0]
    })
    .then((child) => {
      return isElement(child)
        ? child.children.filter((c) => {
            return isElement(c) && c.name === 'ParagraphStyleRange'
          })
        : null
    })
    .then((paras) => {
      return paras.map((p) => {
        if (isText(p)) {
          return null
        }

        const name =
          typeof p.attributes['AppliedParagraphStyle'] === 'string' &&
          p.attributes['AppliedParagraphStyle'].match(
            /^ParagraphStyle\/Heading/
          )
            ? 'heading'
            : 'p'

        const level =
          name === 'heading'
            ? parseInt(
                typeof p.attributes['AppliedParagraphStyle'] === 'string' &&
                  p.attributes['AppliedParagraphStyle'].match(/[0-9]+$/)?.[0],
                0
              )
            : undefined

        return {
          name: name,
          attributes: { level },
          children: p.children
            .filter(
              (pchild) =>
                isElement(pchild) && pchild.name === 'CharacterStyleRange'
            )
            .flatMap((pchild: Xml.Element) =>
              pchild.children
                .map((child) => {
                  if (isText(child)) {
                    return null
                  }

                  return child.children
                    .filter((c) => isText(c))
                    .reduce((acc, val) => {
                      return isText(val) ? `${acc} ${val.text}`.trim() : acc
                    }, '')
                })
                .filter(Boolean)
                .map(Xml.text)
            )
            .filter(Boolean)
        }
      })
    })
    .then((arr) => arr[0])
    .then(compose(console.log, stringify))
}
