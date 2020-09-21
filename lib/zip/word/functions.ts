import produce from 'immer'
import R from 'ramda'
import Slate from 'slate'
import { isText } from '../../xml'

const omitChildren = R.omit(['children'])

export const combineChildren = (parent: Slate.Element) => {
  if (!parent.children) {
    return parent
  }

  const children = parent.children
    .reduce(
      produce((acc, next) => {
        if (!acc.length) {
          acc.push(next)
          return
        }

        const prev = acc[acc.length - 1]
        console.log('prev:', prev)

        if (isText(prev) && isText(next)) {
          prev.text = prev.text + next.text
          return
        }

        if (R.equals(omitChildren(prev), omitChildren(next))) {
          prev.children = [...prev.children, ...next.children]
          return
        }

        return acc
      }),
      []
    )
    .map(combineChildren)

  console.log(JSON.stringify(children))

  return { children }
}
