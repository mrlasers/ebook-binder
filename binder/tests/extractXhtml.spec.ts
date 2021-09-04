import { addAndExtractHeadings } from '../processing/extractXhtml'

it('sets heading IDs per our rules and returns headings and page numbers', () => {
  const html =
    '<h1>Part <em>One</em></h1><h2 id="p2">Chapter I</h2><h3 id="r2">11:35 <span class="small-caps">A.M.</span></h3><p>Hello, World!</p>'
  const expected = {
    html: '<h1 id="r1">Part <em>One</em></h1><h2 id="p2">Chapter I</h2><h3 id="r2">11:35 <span class="small-caps">A.M.</span></h3><p>Hello, World!</p>',
    headings: [
      {
        id: 'r1',
        level: 1,
        text: 'Part One',
        html: 'Part <em>One</em>'
      },
      {
        id: 'p2',
        level: 2,
        text: 'Chapter I',
        html: 'Chapter I'
      },
      {
        id: 'r2',
        level: 3,
        text: '11:35 A.M.',
        html: '11:35 <span class="small-caps">A.M.</span>'
      }
    ],
    pages: [
      {
        id: 'p2',
        page: '2'
      }
    ]
  }
  expect(addAndExtractHeadings(html)).toMatchObject(expected)
})
