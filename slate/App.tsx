import React from 'react'
import { hot, setConfig } from 'react-hot-loader'
import { connect } from 'react-redux'

import Editor from './Editor/index'
import { Toolbar } from './components'

import { actions } from './store'

setConfig({
  showReactDomPatchNotification: false
})

const App = ({ count, dispatch }) => {
  return (
    <div>
      <nav>
        <span>[ {JSON.stringify(count)} ]</span>
        <button onClick={(_) => dispatch(actions.decrement())}>-</button>
        <button onClick={(_) => dispatch(actions.increment())}>+</button>
      </nav>
      <Toolbar />
      <Editor onChange={(_) => _} />
    </div>
  )
}

const mapState = (state) => {
  return {
    count: state + 1
  }
}

const connectedApp = connect(mapState)(App)

export default hot(module)(connect(mapState)(App))

// export default hot(module)(connectedApp)
