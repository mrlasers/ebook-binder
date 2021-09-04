import Path from 'path'

const path1 = './Content/Section1.xhtml'
const path2 = Path.dirname('./Images/butterfly.jpg')

const path3 = Path.relative(path2, path1)

console.log(path3)
