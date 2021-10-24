import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { flow, identity, pipe } from 'fp-ts/function'
import { isBoolean } from 'fp-ts/lib/boolean'
import * as O from 'fp-ts/Option'

import { headsTail } from '../../../../lib/fp'
import { Heading } from '../../tasks'

export type TocNode = {
  text: string
  filename: string
  id: string
  children: TocNode[]
  level: number
  toc: boolean
  landmark: string | null
}

export type HeadingToTocNodeOptions = {
  floor?: number
  ceiling?: number
  min?: number
  max?: number
}

export const boundHeadingLevel =
  (floor: number = 0, ceiling: number = 100) =>
  (level: number) => {
    if (level <= floor) return floor
    if (level >= ceiling) return ceiling
    return level
  }

export const headingToTocNode =
  (opts?: HeadingToTocNodeOptions) =>
  (heading: Heading): TocNode => ({
    text: heading.html,
    filename: pipe(
      heading.id ? `#${heading.id}` : '',
      (id) => heading.filename + id
    ),
    id: heading.id,
    children: [],
    // making some changes here to see if we can't flatten the bottom level
    level: boundHeadingLevel(opts.floor, opts.ceiling)(heading.level), //heading.level <= opts?.floor ? 0 : heading.level,
    toc: isBoolean(heading.toc) ? heading.toc : false,
    landmark: heading?.landmark ?? null
  })

function addChild(nodes: TocNode[], child: TocNode) {
  return (ns: TocNode[]): TocNode[] =>
    pipe(
      ns,
      headsTail,
      (xs: [TocNode[], TocNode]) => xs,
      E.fromPredicate(
        ([_, tail]) => tail.level < child.level,
        () => [...nodes, child]
      ),
      E.map(([heads, tail]) => [
        ...heads,
        { ...tail, children: levelsToTree(tail.children, child) }
      ]),
      E.getOrElse(identity)
    )

  // return flow(
  //   headsTail,
  //   (xs: [TocNode[], TocNode]) => xs,
  //   E.fromPredicate(
  //     ([_, tail]) => tail.level < child.level,
  //     () => [...nodes, child]
  //   ),
  //   E.map(([heads, tail]) => [
  //     ...heads,
  //     { ...tail, children: levelsToTree(tail.children, child) }
  //   ]),
  //   E.getOrElse(identity)
  // )
}

export function levelsToTree(nodes: TocNode[], child: TocNode) {
  return pipe(
    nodes,
    O.fromPredicate((x) => !!x.length),
    O.map(addChild(nodes, child)),
    O.getOrElse(() => [child])
  )
}

export const reduceToNestedHeadings = (headings: Heading[]) =>
  pipe(
    headings,
    A.map(headingToTocNode({ floor: 2, ceiling: 3 })),
    A.filter((heading) => heading.toc),
    A.reduce<TocNode, TocNode[]>([], levelsToTree)
  )
