// import { Cheerio } from '../lib'
import { processHtml } from '../processing'
import { cheerio } from '../lib'
import { guard } from 'fp-ts-std/Function'

const html =
  '<ul>      <li>         Hello, <!-- secret --><em>World</em>!</li><li><p>The end.</p></li><li>Last <p>Night</p></li><li>      SPACE   BALLS <p>in</p>   BLACK   </li><li>     <p></p>      </li></ul>'

const $ = cheerio.load(html)

$('*')
  .contents()
  .filter((i, el) => el.type === 'comment')
  .each(function () {
    $(this).remove()
  })

$('li').each(function (i, el) {
  $(this)
    .contents()
    .filter(function (i, el) {
      if (el.type === 'text') {
        return true
      }

      if (el.type === 'comment') {
        return false
      }

      return !['p', 'div'].includes($(this).prop('name'))

      console.log(el.type, $(this).prop('name'))
    })
    .each(function (i, el) {
      $(this).wrap('<p></p>')
    })
  // .wrapAll('<p></p>')
})
// .each(function (i, el) {
//   console.log(el.type, $(this).prop('name'))
// })

console.log($.html())

// const result = $('li')
//   .contents()
//   .filter(function (i, el) {
//     console.log(el.type, el.parent)
//     return true
//     // console.log(this)
//     // if (el.type === 'text') {
//     //   return true
//     // }

//     // if (el.type === 'tag') {
//     //   console.log(el.parent)
//     // }
//   })
//   .each(function (i, el) {
//     if (el.nodeType === 3) {
//       $(this).wrap('<p></p>')
//     }
//   })

// console.log($.html())

//   '<!DOCTYPE html><html><head><title>Whatever</title></head><body><h1><strong>Chapter One</strong></h1><p>It was the best of times, it was the end of times...</p><h1 id="p256">Chapter <strong>Two</strong></h1><p>He was a dark and stormy knight...</p><h2 id="meanwhile1"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><p>...and checking it twice...</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><h1 id="end">The End</h1><p>The end.</p></body></html>'

// const result = Cheerio.load(html, { xmlMode: true }, false)('body').html()

// console.log(result)
// const ids = ['r1', 'p23', 'pvi', 'r344', 'page1']

// const result = ids.filter((id) => !!id?.match(/^[^p][0-9ivxmcIVXMC]+$/))

// console.log(result)

// const $ = Cheerio.load(
//   '<h1 id="r1">Hello, World!</h1><h2 id="p23">The end.</h2><h1 id="passmesomespinach">Yuck</h1><h2 id="pxi">Page xi</h2>'
// )

// $('h1,h2,h3,h4,h5,h6')
//   .filter((i, el) => !el.attribs?.id.match(/^p[0-9ivxmcIVXMC]+/))
//   .each(function (i, el) {
//     console.log(el.name, el.attribs)
//   })

// const html =
//   '<h1><strong>Chapter One</strong></h1><p>It was the best of times, it was the end of times...</p><h1 id="p256">Chapter <strong>Two</strong></h1><p>He was a dark and stormy knight...</p><h2 id="meanwhile1"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><p>...and checking it twice...</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><h1 id="end">The End</h1><p>The end.</p>'

// const expected =
//   '<h1 id="r1"><strong>Chapter One</strong></h1><p>It was the best of times, it was the end of times...</p><h1 id="p256">Chapter <strong>Two</strong></h1><p>He was a dark and stormy knight...</p><h2 id="r2"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li>Eat breakfast</li><li>Get dressed</li><li>Kill everyone in town</li></ul><p>...and checking it twice...</p><ul><li>Eat breakfast</li><li>Get dressed</li><li>Kill everyone in town</li></ul><h1 id="r3">The End</h1><p>The end.</p>'

// const returned =
//   '<h1 id="r1">Chapter One</h1><p>It was the best of times, it was the end of times...</p><h1 id="p256">Chapter Two</h1><p>He was a dark and stormy knight...</p><h2 id="r2"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li>Eat breakfast</li><li>Get dressed</li><li>Kill everyone in town</li></ul><p>...and checking it twice...</p><ul><li>Eat breakfast</li><li>Get dressed</li><li>Kill everyone in town</li></ul><h1 id="r3">The End</h1><p>The end.</p>'

// const result = processHtml(html)

// const diff = result.html.split('').reduce((acc, val, idx) => {
//   return expected[idx] === val ? `${acc}${val}` : acc
// })

// console.log('diff:', diff)
