const Path = require('path')

module.exports = {
  entry: 'slate/index.tsx',
  output: {
    filename: 'main.js',
    path: Path.resolve(__dirname, dist)
  }
}
