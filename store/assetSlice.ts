import { createSlice } from '@reduxjs/toolkit'
import { NATIVE_TOKENS } from 'chain/common/constants'
import { NFT, Token, TxActivity } from 'types'

interface AssetSlice {
  token: Token[]
  nft: NFT[]
  activity: TxActivity[]
}

const initialState: AssetSlice = {
  token: NATIVE_TOKENS,
  nft: [],
  activity: [],
}

export const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    reset: (state) => {
      state.token = NATIVE_TOKENS
    },
    updateNativeTokenBalance: (state, action) => {
      state.token = state.token.map((t) => {
        if (
          t.isNative &&
          t.chain === action.payload.chain &&
          t.appchainId === action.payload.appchainId
        ) {
          return { ...t, balance: action.payload.balance }
        }
        return t
      })
    },
    updateNearPrice: (state, action) => {
      state.token = state.token.map((t) => {
        if (
          t.isNative &&
          t.chain === action.payload.chain &&
          t.appchainId === action.payload.appchainId
        ) {
          return { ...t, price: action.payload.price }
        }
        return t
      })
    },
    updateActivity: (state, action) => {
      state.activity = action.payload
    },
    updateNft: (state, action) => {
      state.nft = action.payload
    },
    updateLikelyTokens: (state, action) => {
      const newTokens: Token[] = []
      action.payload.forEach((t: Token) => {
        const existed = state.token.find(
          (to) =>
            to.chain === t.chain &&
            to.contractId === t.contractId &&
            to.address === t.address &&
            to.networkType === t.networkType
        )
        if (existed) {
          existed.balance = t.balance
          existed.price = t.price
        } else {
          newTokens.push(t)
        }
      })
      state.token.push(...newTokens)
    },
    deleteWalletToken: (state, action) => {
      state.token = state.token.filter((t) => {
        return t.address !== action.payload.address || t.isNative
      })
    },
  },
})

export const { updateNativeTokenBalance } = assetSlice.actions

export default assetSlice.reducer
