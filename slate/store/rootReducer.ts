import { combineReducers } from 'redux'
import { createSlice } from '@reduxjs/toolkit'

export const { actions, reducer } = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 100,
    decrement: (state) => state - 100
  }
})

export default combineReducers({
  count: reducer
})

// const something = createSlice({
//   name: 'other',
//   initialState: '',
//   reducers: {
//     yes: (state) => state + 'yes',
//     no: (state) => state + 'no'
//   }
// })

// export { actions }

// export default {
//   count: reducer,
//   something: something.reducer
// }
