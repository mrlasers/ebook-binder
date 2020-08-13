import React, { useEffect, useCallback, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom'

import Editor from './Editor/index'
import { Toolbar } from './components'

const App = () => {
  return (
    <div>
      <Toolbar />
      <Editor onChange={(_) => _} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
