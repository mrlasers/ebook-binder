import { identity, pipe, flow } from 'fp-ts/function'
import * as _A from 'fp-ts-std/Array'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import { headsTail } from '../../../lib/fp'

const cheapTestArray: Node[] = [
  { name: 'Hello', level: 1, children: [] },
  { name: 'World', level: 2, children: [] },
  { name: '!', level: 3, children: [] },
  { name: '!!!!', level: 3, children: [] },
  { name: 'Hello, World!', level: 2, children: [] },
  { name: 'HELLO, WORLD?', level: 3, children: [] },
  { name: 'Goodnight, Moon.', level: 1, children: [] }
]

export type Node = {
  name?: string
  level: number
  children: Node[]
}

const hasLength = (x) => !!x.length

const addChild = (nodes: Node[], child: Node) =>
  flow(
    headsTail,
    (xs: [Node[], Node]) => xs,
    E.fromPredicate(
      ([heads, tail]) => tail.level < child.level,
      () => [...nodes, child]
    ),
    E.map(([heads, tail]) => [
      ...heads,
      {
        ...tail,
        children: levelsToTree(tail.children, child)
      }
    ]),
    E.getOrElse(identity)
  )

export const levelsToTree = (nodes: Node[], child: Node) =>
  pipe(
    nodes,
    O.fromPredicate(hasLength),
    O.map(addChild(nodes, child)),
    O.getOrElse(() => [child])
  )

export const _levelToTree = (nodes: Node[], child: Node) => {
  if (!nodes.length) {
    return [child]
  }

  const [heads, tail] = headsTail(nodes)

  if (tail.level >= child.level) {
    return [...nodes, child]
  }

  return [
    // ...heads,
    {
      ...tail,
      children: _levelToTree(tail.children, child)
    }
  ]
}
