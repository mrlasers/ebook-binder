import { processHtmlHACK } from '../processing'

it('processes an html document', () => {
  const html = `<!DOCTYPE html><html><head><title>Whatever</title></head><body><h1><strong>Chapter One</strong></h1><p>It was the best of times, it was the end of times...</p><h1 id="p256" class="     gender      ">Chapter <strong>Two</strong></h1><p>He was a dark and stormy knight...</p><h2 id="meanwhile1"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><p>...and checking it twice...</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><h1 id="end">The End</h1><p>The end.</p></body></html>`

  const expected = {
    html: `<h1 id="r1">Chapter One</h1><p>It was the best of times, it was the end of times...</p><h1 id="p256">Chapter Two</h1><p>He was a dark and stormy knight...</p><h2 id="r2"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li><p>Eat breakfast</p></li><li><p>Get dressed</p></li><li><p>Kill everyone in town</p></li></ul><p>...and checking it twice...</p><ul><li><p>Eat breakfast</p></li><li><p>Get dressed</p></li><li><p>Kill everyone in town</p></li></ul><h1 id="r3">The End</h1><p>The end.</p>`,
    headings: [
      {
        id: 'r1',
        level: 1,
        text: 'Chapter One',
        html: 'Chapter One'
      },
      {
        id: 'p256',
        level: 1,
        text: 'Chapter Two',
        html: 'Chapter Two'
      },
      {
        id: 'r2',
        level: 2,
        text: 'Meanwhile, in Elderron...',
        html: '<em>Meanwhile</em>, in Elderron...'
      },
      {
        id: 'r3',
        level: 1,
        text: 'The End',
        html: 'The End'
      }
    ],
    pages: [{ id: 'p256', page: '256' }]
  }

  expect(processHtmlHACK(html)).toMatchObject(expected)
})

it('processes an html fragment', () => {
  const html =
    '<h1><strong>Chapter One</strong></h1><p>It was the best of times, it was the end of times...</p><h1 id="p256">Chapter <strong>Two</strong></h1><p>He was a dark and stormy knight...</p><h2 id="meanwhile1"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><p>...and checking it twice...</p><ul><li>Eat breakfast</li></ul><ul><li>Get dressed</li></ul><ul><li>Kill everyone in town</li></ul><h1 id="end">The End</h1><p>The end.</p>'

  const expected = {
    html: '<h1 id="r1">Chapter One</h1><p>It was the best of times, it was the end of times...</p><h1 id="p256">Chapter Two</h1><p>He was a dark and stormy knight...</p><h2 id="r2"><em>Meanwhile</em>, in Elderron...</h2><p>She was making a list,</p><ul><li><p>Eat breakfast</p></li><li><p>Get dressed</p></li><li><p>Kill everyone in town</p></li></ul><p>...and checking it twice...</p><ul><li><p>Eat breakfast</p></li><li><p>Get dressed</p></li><li><p>Kill everyone in town</p></li></ul><h1 id="r3">The End</h1><p>The end.</p>',
    headings: [
      {
        id: 'r1',
        level: 1,
        text: 'Chapter One',
        html: 'Chapter One'
      },
      {
        id: 'p256',
        level: 1,
        text: 'Chapter Two',
        html: 'Chapter Two'
      },
      {
        id: 'r2',
        level: 2,
        text: 'Meanwhile, in Elderron...',
        html: '<em>Meanwhile</em>, in Elderron...'
      },
      {
        id: 'r3',
        level: 1,
        text: 'The End',
        html: 'The End'
      }
    ],
    pages: [{ id: 'p256', page: '256' }]
  }

  expect(processHtmlHACK(html)).toMatchObject(expected)
})
