import { cheerio } from '../lib'

const html = `



<p>                Hello, World!       


</p>

`

const $ = cheerio.load(html)

// $('p').children().map(function (i,el) {
//   if (el.type === 'text')
// })

function trimParagraphs() {
  $('p')
    .contents()
    .each(function (i, el) {
      if (el.type === 'text') {
        const text = $(this).text().trim()
        $(this).text(text)
      }
    })
}

// console.log($('p').children().length)

trimParagraphs()

console.log($.html())
