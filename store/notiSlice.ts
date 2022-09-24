import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import { iNotification } from 'types'

interface NotiSlice {
  list: iNotification[]
}

const initialState: NotiSlice = {
  list: [],
}

export const notiSlice = createSlice({
  name: 'noti',
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState
    },
    add: (state, action) => {
      if (!state.list) {
        state.list = []
      }
      state.list = _.uniqBy(
        [action.payload, ...state.list],
        (t) => t.noti.request.identifier
      )
    },
    read: (state, action) => {
      state.list = state.list.map((t) => {
        if (t.noti.request.identifier === action.payload) {
          return { ...t, isRead: true }
        }
        return t
      })
    },
    readAll: (state) => {
      state.list = state.list.map((t) => {
        return { ...t, isRead: true }
      })
    },
  },
})

export const { add, read } = notiSlice.actions

export default notiSlice.reducer
