import React, { useEffect, useCallback, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from './store'

import App from './App'

// const render = () => {
//   // const App = require('./App').default

//   ReactDOM.render(
//     <Provider store={store}>
//       <App />
//     </Provider>,
//     document.getElementById('app')
//   )
// }

// render()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
)

module.hot.accept()

// declare const module: any
// if (module.hot) {
//   module.hot.accept()
// }
