import { CheerioAPI } from 'cheerio'
import { join } from 'fp-ts-std/Array'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { load } from '../cleanHtml'

export type FootnoteFormatter = {
  body: (rows: string[]) => string
  row: (fn: number, notes: string[]) => string
  ref: (fn: number) => string
}

export const footnoteTable: FootnoteFormatter = {
  body: (rows) =>
    `<aside epub:type="footnote"><table class="footnotes"><tbody>${rows.join(
      '\n'
    )}</tbody></table></aside>`,
  row: (fn, notes) =>
    `<tr><td><a href="#fnref${fn}">${fn}.</a> </td><td><div epub:type="footnote" id="fn${fn}">${notes
      .map((note) => `<p>${note}</p>`)
      .join('')}</div></td></tr>`,
  ref: (fn) =>
    `<a id="fnref${fn}" href="#fn${fn}" epub:type="noteref">${fn}</a>`
}

/*
<aside epub:type="footnote" class="footnote">
	<p><a href="#footnote-ref1">1</a>. <span id="footnote1" epub:type="footnote">Work Cited: Patrul Rinpoche, <em>The Words of My Perfect Teacher [Kunzang Lama’i Shelung]</em>, rev. ed., trans. Padmakara Translation Group, Boston: Shambhala, 1998, p. 138ff</span></p>
</aside>
*/

export const footnoteAmazon: FootnoteFormatter = {
  row: (fn, rows) =>
    `<aside id="ft-${fn}" epub:type="footnote"><p><a epub:type="noteref" href="#source${fn}">${fn}.</a> ${rows[0]}</p></aside>`,
  body: (rows) => rows.join('\n'),
  ref: (fn) =>
    `<a id="source${fn}" href="#ft-${fn}" epub:type="noteref">${fn}</a>`
}

export const footnoteNamaste: FootnoteFormatter = {
  body: (rows) => `${rows.join('\n')}`,
  row: (fn, notes) =>
    `<aside id="footnote${fn}" epub:type="footnote"><a epub:type="noteref" href="#footnote-ref${fn}">${fn}</a>. <span>${notes[0]}</span></aside>`,
  ref: (fn) =>
    `<a id="footnote-ref${fn}" href="#footnote${fn}" epub:type="noteref">${fn}</a>`
}

export const footnoteIBooks: FootnoteFormatter = {
  row: (fn, notes) =>
    `<aside id="myNote${fn}" epub:type="footnote">${notes[0]}</aside>`,
  body: (rows) => `${rows.join('\n')}`,
  ref: (fn) => `<a href="#myNote${fn}" epub:type="noteref">${fn}</a>`
}

export const footnoteMaker: FootnoteFormatter = footnoteTable

export const addFootnoteRefs =
  (footnotes?: { [key: number]: string[] }) =>
  ($: CheerioAPI): CheerioAPI => {
    if (footnotes) {
      const aside = pipe(
        $('sup').map(function () {
          return pipe(
            Number($(this).text().trim()),
            O.fromPredicate((n) => !isNaN(n) && !!footnotes[n]),
            O.map((n) => ({
              fn: n,
              notes: footnotes[n].map((fn) => fn.trim()).filter(Boolean)
            })),
            O.map(({ fn, notes }) => {
              $(this).html(footnoteMaker.ref(fn))

              return footnoteMaker.row(fn, notes)
            })
          )
        }),
        ($) => $.toArray().filter(Boolean),
        A.filter(O.isSome),
        A.sequence(O.Monad),
        O.chain((rows) => (rows.length ? O.of(rows) : O.none)),
        O.fold(() => '', footnoteMaker.body)
      )

      const html = $.html() + aside

      return load(html)
    }

    return $
  }
