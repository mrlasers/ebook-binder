import clipboardy from 'clipboardy'
import { promises as fs } from 'fs'

const files = Array(112)
  .fill('')
  .map((_, i) => ({
    id: `sec${i + 1}`,
    href: `Section${(i + 1).toString().padStart(3, '0')}.xhtml`
  }))

const manifest = files
  .map(
    (f) =>
      `<item id="${f.id}" media-type="application/xhtml+xml" href="Content/${f.href}"/>`
  )
  .join('\n\t\t')

const spine = files.map((f) => `<itemref idref="${f.id}"/>`).join('\n\t\t')

// clipboardy.write(spine)
// console.log('written to clipboard')

// fs.readdir(
//   'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\J\\Julie Kim\\build\\epub\\Images'
// ).then((data) => {
//   console.log(data)
// })

const images = [
  '5organsWev.jpg',
  'Ahn.jpg',
  'candle.jpg',
  'circle.jpg',
  'connecting-organs.jpg',
  'cover.jpg',
  'dignity.jpg',
  'doctor.jpg',
  'drought1.jpg',
  'earth.jpg',
  'earth2.jpg',
  'empty-circle.jpg',
  'energy.jpg',
  'fire.jpg',
  'fire2.jpg',
  'five-organs.jpg',
  'glasses2.jpg',
  'goodeye.jpg',
  'h-ki.jpg',
  'h-li.jpg',
  'h-lu.jpg',
  'h-s.jpg',
  'hail1.jpg',
  'handcircle.jpg',
  'health1.jpg',
  'heart.jpg',
  'ideal.jpg',
  'Ki-h.jpg',
  'ki-li.jpg',
  'ki-lu.jpg',
  'ki-s.jpg',
  'kidney.jpg',
  'li-h.jpg',
  'li-k.jpg',
  'li-li.jpg',
  'li-lu.jpg',
  'li-s.jpg',
  'liver.jpg',
  'logo.jpg',
  'longevity.jpg',
  'lu-h.jpg',
  'lu-k.jpg',
  'lu-li.jpg',
  'lu-lu.jpg',
  'lu-s.jpg',
  'lung.jpg',
  'metal.jpg',
  'metal2.jpg',
  'money1.jpg',
  'monsoon.jpg',
  'mungbean1.jpg',
  'nose.jpg',
  'organissues.jpg',
  'organs.jpg',
  'P15.jpg',
  'p21A.jpg',
  'palmabdomen.jpg',
  'palmchest.jpg',
  'palmdanjun.jpg',
  'palmstomach.jpg',
  'potato.jpg',
  's-h.jpg',
  's-k.jpg',
  's-li.jpg',
  's-lu.jpg',
  'score-summary-circle.jpg',
  'score-summary.jpg',
  'secondaryOrgans.jpg',
  'secretsofthebody1.jpg',
  'smf3natureofuniv.jpg',
  'spiritual_ladder.jpg',
  'stamp.jpg',
  'stomach.jpg',
  'taste2.jpg',
  'thinker.jpg',
  'throat.jpg',
  'treeL.jpg',
  'treepot.jpg',
  'water.jpg',
  'waterk.jpg',
  'wood.jpg',
  'yinyang-examples.jpg',
  'yinyang.jpg'
]
