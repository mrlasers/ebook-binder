// ====== GOOD
type Distribute<From, U extends keyof From> = U extends any
  ? { name: U; value: From[U] }
  : never
type TypeToProps<T> = Distribute<T, keyof T>

type Props = TypeToProps<typeof emptyState>

type Indexed = {
  [key: string]: string | number
}

const emptyState = {
  title: '',
  author: '',
  year: 2020
}
// GOOD ======

const otherState: Indexed = {
  title: '',
  author: '',
  year: 2020
}

type keyOf<T> = keyof T

type keys = keyOf<typeof emptyState>
type keys2 = keyOf<typeof otherState>
