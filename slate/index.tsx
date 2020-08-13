import React, { useEffect, useCallback, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from './store'

import App from './App'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
)
