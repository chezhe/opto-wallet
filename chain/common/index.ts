import * as bip39 from 'bip39'
import { Chain, NetworkType, Token, Wallet } from 'types'
import { NEAR_NETWORKS, MNEMONIC_STRENGTH } from 'chain/near/constants'
import * as Random from 'expo-random'
import { cryptoIsReady } from '@polkadot/util-crypto'
import { calcValue, parseAmount } from 'utils/format'
import Decimal from 'decimal.js'

export const isValidAmount = (amount: string, token?: Token) => {
  if (!amount || !amount.trim() || !token) {
    return false
  }
  const amountNumber = Number(amount)
  if (isNaN(amountNumber)) {
    return false
  }
  if (amountNumber <= 0) {
    return false
  }
  if (token) {
    const _amount = parseAmount(amount, token)
    if (new Decimal(_amount).greaterThan(new Decimal(token.balance))) {
      return false
    }
  }
  return true
}

export const isValidReceiverAddress = async (
  address: string,
  wallet: Wallet | undefined
) => {
  if (wallet?.chain === Chain.NEAR) {
    const strArr = address.split('.')
    if (address.length === 64) {
      return /^[a-z0-9]{64}$/.test(address)
    } else if (strArr.length === 1) {
      return false
    } else if (strArr.length === 2) {
      const network = NEAR_NETWORKS[wallet.networkType]
      return (
        `.${strArr[1]}` === network.suffix &&
        /^[a-z0-9_-]{1,64}$/.test(strArr[0])
      )
    }
  } else if (wallet?.chain === Chain.OCT) {
    if (!cryptoIsReady()) return false
    const polkaUtils = require('../polkadot/utils')

    if (await polkaUtils.isSubstrateAddress(address)) {
      return true
    }
  }

  return false
}

export const getChainFromAddress = async (address: string) => {
  if (address.includes('.')) {
    const strArr = address.split('.')
    if (
      strArr[1] === NetworkType.MAINNET ||
      strArr[1] === NetworkType.TESTNET
    ) {
      return Chain.NEAR
    }
  } else if (address.length === 64 && /^[a-z0-9]{64}$/.test(address)) {
    return Chain.NEAR
  }

  try {
    if (!cryptoIsReady()) return undefined
    const polkaUtils = require('../polkadot/utils')
    if (await polkaUtils.isSubstrateAddress(address)) {
      return Chain.OCT
    }
  } catch (error) {}

  return undefined
}

export const filterWalletToken = (t: Token, w: Wallet | undefined) => {
  if (!w) {
    return false
  }

  return (
    (t.address === w?.address || t.isNative) &&
    w?.chain === t.chain &&
    (w?.networkType === t.networkType || t.isNative) &&
    (w?.chain === Chain.OCT ? w.appchainId === t.appchainId : true)
  )
}

export const sortWalletTokens = (tokens: Token[]) => {
  const pinnedTokens = tokens.filter((t: Token) => t.isNative)
  const otherTokens = tokens
    .filter((t) => !t.isNative)
    .sort((a: Token, b: Token) => {
      const valueDiff = calcValue(b) - calcValue(a)
      if (valueDiff === 0) {
        return Number(b.balance) - Number(a.balance)
      }
      return valueDiff
    })
  return [...pinnedTokens, ...otherTokens]
}

const rng = (size: number): Buffer => {
  return Buffer.from(Random.getRandomBytes(size))
}

export const generateMnemonic = async (entropy?: Buffer | string) => {
  return entropy !== undefined
    ? bip39.entropyToMnemonic(entropy)
    : bip39.generateMnemonic(MNEMONIC_STRENGTH, rng)
}

export const normalizeMnemonic = (seedPhrase: string) =>
  seedPhrase
    .trim()
    .split(/\s+/)
    .map((part) => part.toLowerCase())
    .join(' ')
