const Path = require('path')

module.exports = {
  mode: 'development',
  entry: './slate/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'main.js',
    path: Path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: Path.resolve(__dirname, 'dist'),
    compress: true,
    port: 1234,
    hot: true
  }
}
