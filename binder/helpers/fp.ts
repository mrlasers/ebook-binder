export const compose =
  (...fns) =>
  (...args) =>
    fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0]

export const trace = (x: any): any => {
  console.log(x)
  return x
}

export const head = <A>(xs: A[]): A => {
  return xs.length ? xs[0] : null
}

export const last = <A>(xs: A[]): A => {
  return xs.length ? xs.slice(-1)[0] : null
}
export const dropLast = <A>(xs: A[]): A[] => {
  return xs.slice(0, xs.length - 1)
}
export const headsTail = <A>(xs: A[]): [A[], A] => {
  const heads = dropLast(xs) || undefined
  const tail = last(xs) || undefined

  return [dropLast(xs), last(xs)]
}

function curry(fn) {
  const arity = fn.length

  return function $curry(...args) {
    if (args.length < arity) {
      return $curry.bind(null, ...args)
    }

    return fn.call(null, ...args)
  }
}

export const filter = curry((fn, f) => f.filter(fn))

export const map = curry((fn, f) => f.map(fn))

export const reduce = curry((fn, zero, xs) => xs.reduce(fn, zero))

export const prop = curry((p, obj) => obj[p])
export const split = curry((sep, str) => str.split(sep))
