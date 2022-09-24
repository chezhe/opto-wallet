import { createSlice } from '@reduxjs/toolkit'
import { Category, Chain, ChainDapps, Project } from 'types'

interface DAppSlice {
  categories: Category[]
  starred: Project[]
  searchHistory: string[]
  NEAR?: ChainDapps
  OCT?: ChainDapps
}

const initialState: DAppSlice = {
  categories: [],
  starred: [],
  searchHistory: [],
}

export const assetSlice = createSlice({
  name: 'dapp',
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState
    },
    updateChainDapps: (state, action) => {
      const { chain, dapps } = action.payload
      state[chain as Chain] = dapps
    },
    star: (state, action) => {
      const { project } = action.payload
      const index = state.starred.findIndex((p) => p.title === project.title)
      if (index === -1) {
        state.starred.push(project)
      } else {
        state.starred.splice(index, 1)
      }
    },
    searched: (state, action) => {
      if (!state.searchHistory) {
        state.searchHistory = []
      }
      if (!state.searchHistory.includes(action.payload)) {
        state.searchHistory.splice(0, 0, action.payload)
      }
      if (state.searchHistory.length > 10) {
        state.searchHistory = state.searchHistory.slice(0, 10)
      }
    },
    clearHistory: (state, action) => {
      state.searchHistory = []
    },
  },
})

export const {} = assetSlice.actions

export default assetSlice.reducer
