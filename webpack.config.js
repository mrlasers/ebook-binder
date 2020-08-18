const path = require('path')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')

const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    main: './src/index.tsx'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: path.join(__dirname, 'src'),
        use: [
          isDevelopment && {
            loader: 'babel-loader',
            options: { plugins: ['react-refresh/babel'] }
          },
          'awesome-typescript-loader'
        ].filter(Boolean)
      }
    ]
  },
  plugins: [
    isDevelopment && new ReactRefreshPlugin()
    // new HtmlWebpackPlugin({
    //   filename: './index.html',
    //   template: './public/index.html'
    // })
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  }
}

// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
// const Path = require('path')

// const isDev = process.env.NODE_ENV !== 'production'

// module.exports = {
//   mode: isDev ? 'development' : 'production',
//   plugins: [isDev && new ReactRefreshWebpackPlugin()].filter(Boolean),
//   entry: './slate/index.tsx',
//   module: {
//     rules: [
//       // {
//       //   test: /\.tsx?$/,
//       //   use: 'ts-loader',
//       //   include: Path.resolve(__dirname, 'slate'),
//       //   exclude: /node_modules/
//       // }
//       {
//         test: /\.tsx?$/,
//         include: Path.join(__dirname, 'src'),
//         use: [
//           isDev && {
//             loader: 'babel-loader',
//             options: {
//               plugins: ['react-refresh/babel']
//             }
//           },
//           'awesome-typescript-loader'
//         ].filter(Boolean)
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.tsx', '.ts', '.js']
//   },
//   output: {
//     filename: 'main.js',
//     path: Path.resolve(__dirname, 'dist')
//   },
//   devServer: {
//     contentBase: Path.resolve(__dirname, 'dist'),
//     compress: true,
//     port: 1234,
//     hot: true
//   }
// }
