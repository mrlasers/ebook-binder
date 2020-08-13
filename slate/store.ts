import * as Redux from 'redux'
import {
  configureStore,
  createAction,
  createReducer,
  createSlice
} from '@reduxjs/toolkit'

const { actions, reducer } = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1
  }
})

const store = configureStore({ reducer })

export { actions, store }
