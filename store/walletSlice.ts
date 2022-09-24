import { createSlice } from '@reduxjs/toolkit'
import { Wallet } from 'types'

interface WalletSlice {
  list: Wallet[]
  current: Wallet | undefined
}

const initialState: WalletSlice = {
  list: [],
  current: undefined,
}

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    logout: (state) => {
      state.list = []
      state.current = undefined
    },
    add: (state, action) => {
      if (!action.payload) {
        return
      }
      if (!state.list) {
        state.list = []
      }
      if (!state.list.some((t) => t.address === action.payload.address)) {
        state.list.push(action.payload)
      }
      state.current = action.payload
    },
    justAdd: (state, action) => {
      if (!action.payload) {
        return
      }
      if (!state.list) {
        state.list = []
      }
      if (!state.list.some((t) => t.address === action.payload.address)) {
        state.list.push(action.payload)
      }
    },
    setCurrent: (state, action) => {
      if (state.current) {
        state.list = state.list.map((t) => {
          if (t.address === state.current?.address) {
            return state.current
          }
          return t
        })
      }
      state.current = action.payload
    },
    restore: (state, action) => {
      state.list = action.payload
      if (state.list.length) {
        if (!state.current) {
          state.current = state.list[0]
        }
      } else {
        state.current = undefined
      }
    },
    remove: (state, action) => {
      state.list = state.list.filter(
        (wallet) => wallet.address !== action.payload.address
      )
      if (action.payload.address === state.current?.address) {
        const sameChainW = state.list.filter(
          (t) => t.chain === action.payload.chain
        )
        state.current = sameChainW[0] || state.list[0]
      }
    },
    networkEdited: (state, action) => {
      const { oldNetwork, newNetwork } = action.payload
      state.list = state.list.map((t) => {
        if (
          t.customNetworkName === oldNetwork.name &&
          t.chain === oldNetwork.chain
        ) {
          return {
            ...t,
            customNetworkName: newNetwork.name,
            networkType: newNetwork.type,
          }
        }
        return t
      })
      if (
        state.current &&
        state.current?.customNetworkName === oldNetwork.name &&
        state.current.chain === oldNetwork.chain
      ) {
        state.current.customNetworkName = newNetwork.name
        state.current.networkType = newNetwork.type
      }
    },
    networkDeleted: (state, action) => {
      const network = action.payload
      state.list = state.list.map((t) => {
        if (t.customNetworkName === network.name && t.chain === network.chain) {
          return {
            ...t,
            customNetworkName: undefined,
            networkType: network.type,
          }
        }
        return t
      })
      if (
        state.current &&
        state.current?.customNetworkName === network.name &&
        state.current.chain === network.chain
      ) {
        state.current.customNetworkName = undefined
        state.current.networkType = network.type
      }
    },
  },
})

export const {} = walletSlice.actions

export default walletSlice.reducer
