function RegexEscape(s: string) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

const tags = ['p', 'div'].join('|')

// .replace(/(<(p|figcaption|h[1-6])[^>]*>)\s+/g, (_, tag) => tag)
const regex = `(<(${tags})[^>]*>)\\s+`
// .replace(/\s+<\/(p|h[1-6])>/g, (_, tag) => tag)
const regexEnd = `\\s+(<\/(${tags})>)`

const regexp = new RegExp(`(<(${tags})[^>]*>)\\s+`, 'g')
const regexpEnd = new RegExp(`\\s+(<\/(${tags})>)`, 'g')

const str = '<p id="hello">     World!  </p><div>   The. End.   </div>'

const replacerTag = (_, tag) => tag

const result = str.replace(regexp, replacerTag).replace(regexpEnd, replacerTag)

console.log(result)
