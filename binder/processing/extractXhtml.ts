import { Cheerio } from '../lib'
import { FileItem, FootnoteItems } from '../types'

export function addDocumentWrap(title?: string) {
  return ($html: FileItem | string): FileItem => {
    const item = typeof $html === 'string' ? { html: $html } : $html
    const html = `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
    <meta http-equiv="default-style" content="text/html;charset=utf-8"/>
    <title>${title}</title>
    <link rel="stylesheet" type="text/css" href="../Styles/styles.css"/>
    </head>
    <body>
    ${item.html}
    </body>
    </html>
    `

    return {
      ...item,
      html
    }
  }
}

export function addAndExtractFootnoteRefs(footnotes?: FootnoteItems) {
  return ($html: FileItem | string): FileItem => {
    const item = typeof $html === 'string' ? { html: $html } : $html
    const $ = Cheerio.load(item.html)

    if (!footnotes) {
      console.log('no footnotes, aborting')
      return item
    }

    const fnrefs = $('sup')
      .map(function (i, el) {
        const ref = Number($(this).text())
        if (isNaN(ref) || !footnotes[`${ref}`]) return

        $(this).html(
          `<a id="fnref${ref}" href="#fn${ref}" epub:type="noteref">${ref}</a>`
        )

        return ref
      })
      .toArray()
      .filter(Boolean)

    const fns = fnrefs
      .filter((n) => footnotes[n])
      .map((ref) => {
        return `
        <table>
          <tbody>
            <tr>
              <td><a href="#fnref${ref}">${ref}.</a></td>
              <td><div id="fn${ref}">
              ${footnotes?.[ref]
                .map((text) => {
                  return `<p>${text}</p>`
                })
                .join('')}
                </div></td>
            </tr>
          </tbody>
        </table>
        
        `
        // `<aside epub:type="footnote">` +
        // `<div id="fn${ref}">` +
        // footnotes?.[ref]
        //   .map((text) => {
        //     return `<p>${text}</p>`
        //   })
        //   .join('') +
        // `</div>` +
        // `</aside>`
      })

    return { ...item, html: $.html() + '\n' + fns.join('\n') }
  }
}

export function addAndExtractHeadings($html: FileItem | string): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = Cheerio.load(item.html)

  let nextHeadingNumber = 0

  const headings = $('h1, h2, h3, h4, h5, h6')
    .map(function (i, el) {
      const attrId = el?.attribs?.id
      const id = attrId?.match(/^p[0-9ivxmcIVXMC]+/)
        ? attrId
        : `r${++nextHeadingNumber}`

      $(this).attr('id', id)

      return {
        id,
        level: parseInt(el.name.slice(1), 0),
        text: $(this).text(),
        html: $(this).html()
      }
    })
    .toArray()

  const pages = $('[id^="p"]')
    .map(function (i, el) {
      const id = $(this).attr('id')
      return { id, page: id.slice(1) }
    })
    .toArray()

  return {
    html: $.html(),
    headings,
    pages
  }
}
