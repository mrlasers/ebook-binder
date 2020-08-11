import React, { useEffect, useCallback, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom'

import Editor from './Editor/index'

const App = () => {
  return (
    <div>
      <Editor onChange={(_) => _} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
