// declare global {
//   interface Window {
//     savedState: any
//   }
// }

// import { combineReducers } from 'redux'
// import {
//   configureStore,
//   createAction,
//   createReducer,
//   createSlice
// } from '@reduxjs/toolkit'

// import rootReducer, { actions } from './rootReducer'

// const store = configureStore({
//   reducer: rootReducer
// })

// console.log('store.ts:', module.hot)

// if (module.hot) {
//   module.hot.accept('./rootReducer', () => {
//     const reducer = require('./rootReducer').default
//     store.replaceReducer(reducer)
//   })
// }

// export { actions }

// export default store

import { configureStore, Store } from '@reduxjs/toolkit'
import rootReducer, { actions } from './rootReducer'
import { config } from 'process'

const store = configureStore({ reducer: rootReducer })

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const newRootReducer = require('./rootReducer').default
    store.replaceReducer(newRootReducer)
  })
}

export type AppDispatch = typeof store.dispatch
export { actions }
export default store
