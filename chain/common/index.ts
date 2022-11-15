import * as bip39 from 'bip39'
import { Token, Wallet } from 'types'
import * as Random from 'expo-random'
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
    : bip39.generateMnemonic(128, rng)
}

export const normalizeMnemonic = (seedPhrase: string) =>
  seedPhrase
    .trim()
    .split(/\s+/)
    .map((part) => part.toLowerCase())
    .join(' ')

export function buf2hex(buffer: Uint8Array): string {
  return [...buffer].map((x) => x.toString(16).padStart(2, '0')).join('')
}
