import { createSlice } from '@reduxjs/toolkit'
import { Chain, NFT, Token } from 'types'

interface AssetSlice {
  tokens: Token[]
  nfts: NFT[]
}

const initialState: AssetSlice = {
  tokens: [],
  nfts: [],
}

export const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    reset: (state) => {
      state.tokens = state.tokens.filter((t) => t.isNative)
    },
    updateTokenList: (state, action) => {
      const { nativeToken, tokens } = action.payload
      state.tokens = state.tokens.map((t) => {
        if (t.isNative && t.chain === nativeToken.chain) {
          if (t.chain === Chain.OCT) {
            if (t.networkType === nativeToken.networkType) {
              return {
                ...t,
                ...nativeToken,
              }
            } else {
              return t
            }
          }
          return {
            ...t,
            ...nativeToken,
          }
        }
        return t
      })

      const newTokens: Token[] = []
      tokens.forEach((t: Token) => {
        const existed = state.tokens.find(
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

      state.tokens.push(...newTokens)
    },
    updateNft: (state, action) => {
      state.nfts = action.payload
    },
    deleteWalletToken: (state, action) => {
      state.tokens = state.tokens.filter((t) => {
        return t.address !== action.payload.address || t.isNative
      })
    },
    initNativeToken: (state, action) => {
      const nativeTokens = action.payload
      const newTokens = nativeTokens.filter((t: Token) => {
        return !state.tokens.find((to) => {
          if (t.chain === Chain.OCT) {
            return (
              to.chain === t.chain &&
              to.isNative &&
              to.networkType === t.networkType
            )
          }
          return to.chain === t.chain && to.isNative
        })
      })

      if (newTokens.length) {
        state.tokens.push(...newTokens)
      }
    },
  },
})

export const {} = assetSlice.actions

export default assetSlice.reducer
