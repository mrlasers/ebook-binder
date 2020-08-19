import css from 'css'

const result = css.parse(`
h1, h2 {
  color: red;
}
h1 {
  font-size: 120%;
}
`)

console.log(JSON.stringify(result.stylesheet.rules, null, 2))
