import { identity, pipe, flow } from 'fp-ts/function'
import * as _A from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import { head, last, dropLast, headsTail } from '../../../lib/fp'
import { stringify } from 'fp-ts-std/JSON'

// type N = { name: string; level: number; children: N[] }
// type SortNode = { level: number; nodes: N[] }

const arr: Node[] = [
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

let x = 0

// export const levelToTreeEither = (nodes: Node[], child: Node) => {
//   return pipe(
//     nodes,
//     E.fromPredicate(
//       (ns) => (ns.length ? true : false),
//       () => [child]
//     ),
//     E.chain(
//       flow(
//         headsTail,
//         (xs: [Node[], Node]) => xs,
//         E.fromPredicate(
//           flow(A.last, O.map(n => n.level < child.level), O.fold(, E.right)),
//           () => [...nodes, child]
//         ),
//         // E.fromPredicate(
//         //   ([, tail]) => tail.level < child.level,
//         //   () => [...nodes, child]
//         // ),
//         E.map(([heads, tail]) => [
//           ...heads,
//           {
//             ...tail,
//             children: levelToTreeEither(tail.children, child)
//           }
//         ])
//       )
//     ),
//     (x) => x,
//     E.fold(identity, identity)
//   )
// }

// console.log(
//   JSON.stringify(
//     levelToTreeEither([{ level: 1, children: [] }], {
//       name: 'Hello',
//       level: 2,
//       children: []
//     })
//   )
// )

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

// const result = pipe(A.reduce([], levelToTree)(arr))

// console.log(result)

// {
//   const maybeNodes = O.fromPredicate((ns: Node[]) => ns.length ? true : false)(nodes)
// }

export const _levelToTree = (nodes: Node[], child: Node) => {
  if (!nodes.length) {
    return [child]
  }

  const [heads, tail] = headsTail(nodes)

  if (tail.level >= child.level) {
    return [...nodes, child]
  }

  return [
    ...heads,
    {
      ...tail,
      children: _levelToTree(tail.children, child)
    }
  ]
}
