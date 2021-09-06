import { ProcessOptions } from '.'
import { cheerio } from '../lib'
import { FileItem, FootnoteItems } from '../types'

export function addDocumentWrap(options?: ProcessOptions) {
  return ($html: FileItem | string): FileItem => {
    const item = typeof $html === 'string' ? { html: $html } : $html

    const title = item?.headings?.[0]?.text || options?.title || ''

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
    const $ = cheerio.load(item.html)

    // console.log('footnotes:', footnotes)

    if (!footnotes) {
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
        <table epub:type="footnote" class="footnotes">
          <tbody>
            <tr>
              <td><a href="#fnref${ref}">${ref}.</a></td>
              <td><div id="fn${ref}">
              ${footnotes?.[ref]
                .filter((t) => !!t.trim())
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

    return {
      ...item,
      html: $.html() + '\n' + fns.join('\n'),
      footnotes: [...(item.footnotes || []), fnrefs]
    }
  }
}

export function addAndExtractHeadings($html: FileItem | string): FileItem {
  const item = typeof $html === 'string' ? { html: $html } : $html
  const $ = cheerio.load(item.html)

  let nextHeadingNumber = 0

  const headings = $('h1, h2, h3, h4, h5, h6, h7')
    .map(function (i, el) {
      const level = Number(el.name.slice(1))
      const prevLevel = Number($(this).prev().get(0)?.tagName.slice(1))

      if (level === prevLevel) {
        return {
          append: {
            level,
            text: $(this).text(),
            html: $(this).html()
          }
        }
      }

      const attrId = el?.attribs?.id
      const id = attrId?.match(/^p[0-9ivxmcIVXMC]+/)
        ? attrId
        : `r${++nextHeadingNumber}`

      $(this).attr('id', id)

      if (level > 6) {
        $(this).replaceWith(
          $('<h6>')
            .attr($(this).attr())
            .addClass(`h${level}`)
            .html($(this).html())
        )
      }

      return {
        id,
        level,
        text: $(this).text().trim(),
        html: $(this).html().trim()
      }
    })
    .toArray()
    .reduce((headings, heading) => {
      if (!headings.length && !heading?.append) {
        return [heading]
      }

      if (!heading?.append) {
        return [...headings, heading]
      }

      let last = headings[headings.length - 1]

      last.text = `${last.text} | ${heading.append.text}`
      last.html = `${last.html} | ${heading.append.html}`

      return headings
    }, [])

  const pages = $('[id^="p"]')
    .map(function (i, el) {
      const id = $(this).attr('id')
      return { id, page: id.slice(1) }
    })
    .toArray()

  return {
    ...item,
    html: $.html(),
    headings,
    pages
  }
}
