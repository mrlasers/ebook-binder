import { nanoid } from 'nanoid'
import shortid from 'shortid'

const figures = [
  [6, 1, 'Poor quality plans make it harder to get planning permission'],
  [6, 2, 'This side extension adds a lot of space but is poorly designed'],
  [6, 3, 'The various extensions to these two houses harm the streetscene'],
  [7, 4, 'A single-storey rear extension'],
  [7, 5, 'A single-storey side extension'],
  [7, 6, 'A larger home extension'],
  [7, 7, 'A hip-to-gable roof extension'],
  [7, 8, 'A rear dormer roof extension'],
  [7, 9, 'Large “box” dormers are a common feature o7, f residential areas'],
  [7, 10, 'A “double” or “L-shaped” dormer'],
  [7, 11, 'Rooflights'],
  [7, 12, 'A porch'],
  [7, 13, 'An outbuilding'],
  [7, 14, 'The new Class AA right to add two s7, toreys'],
  [7, 15, 'Claire’s increased roof height is visible from the street'],
  [8, 16, 'The planning policy Hierarchy'],
  [8, 17, 'The planning balance'],
  [
    8,
    18,
    'On a row of matching houses, an extension to one can look out of place'
  ],
  [8, 19, 'It is easier to extend houses on a mixed streetscene'],
  [8, 20, 'Almost all of Brendan’s neighbours already had roof extensions'],
  [8, 21, 'The 45-degree rule'],
  [
    8,
    22,
    'Some of the factors that reduce the impact of an extension on a neighbour'
  ],
  [
    8,
    23,
    'An extension may have less impact if its height is reduce along the boundary'
  ],
  [
    8,
    24,
    'An extension may have less impact if it steps away from the boundary'
  ],
  [8, 25, 'Applying the 45-degree rule to a first floor rear extension'],
  [
    8,
    26,
    'For two-storey side extensions, councils often request setbacks from teh front and side'
  ],
  [8, 27, 'The terracing effect'],
  [
    8,
    28,
    'A “mega extension” (combined ground, first and second floor extensions)'
  ]
]

const listOfImages = [
  'figure1.jpg',
  'figure14.jpg',
  'figure19.jpg',
  'figure23.jpg',
  'figure28.jpg',
  'figure7.jpg',
  'illustration-step2.jpg',
  'figure10.jpg',
  'figure15.jpg',
  'figure2.jpg',
  'figure24.jpg',
  'figure3.jpg',
  'figure8.jpg',
  'illustration-step3.jpg',
  'figure11.jpg',
  'figure16.jpg',
  'figure20.jpg',
  'figure25.jpg',
  'figure4.jpg',
  'figure9.jpg',
  'illustration-step4.jpg',
  'figure12.jpg',
  'figure17.jpg',
  'figure21.jpg',
  'figure26.jpg',
  'figure5.jpg',
  'illustration-intro.jpg',
  'illustration-step5.jpg',
  'figure13.jpg',
  'figure18.jpg',
  'figure22.jpg',
  'figure27.jpg',
  'figure6.jpg',
  'illustration-step1.jpg',
  'illustration-step6.jpg',
  'author.jpg'
]

const result1 = figures
  .map(
    ([sec, n, title]) =>
      `<li><a href="../Content/Section${sec
        .toString()
        .padStart(2, '0')}.xhtml#figure${n}">Figure ${n}: ${title}</a></li>`
  )
  .join('\n')

const result = listOfImages
  .map((filename) => filename.split('.')[0])
  .sort((a, b) => (a > b ? 1 : -1))
  .map(
    (name) =>
      `<item id="img-${shortid()}" media-type="image/jpeg" href="Images/${name}.jpg"/>`
  )
  .join('\n')

console.log(result1)
