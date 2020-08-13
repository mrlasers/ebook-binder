// declare global {
//   interface Window {
//     savedState: any
//   }
// }

// import { hot } from 'react-hot-loader'
import { combineReducers } from 'redux'
import {
  configureStore,
  createAction,
  createReducer,
  createSlice
} from '@reduxjs/toolkit'

import rootReducer, { actions } from './rootReducer'

const store = configureStore({
  reducer: rootReducer
})

export { actions }

export default store
