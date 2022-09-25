import Decimal from 'decimal.js'
import _ from 'lodash'
import { Chain, Token, Wallet } from 'types'
import URLParse from 'url-parse'

export const formatNodeUrl = (url: string) => {
  if (url.includes('infura.io')) {
    const arr = url.split('/')
    arr[arr.length - 1] = ellipsis(arr[arr.length - 1], 10)
    return arr.join('/')
  }
  return url
}

export const formatUrlHost = (url: string | undefined) => {
  if (!url) {
    return 'Unknown'
  }
  return new URLParse(url).hostname
}

export const formatWalletAddress = (
  wallet: Pick<Wallet, 'address' | 'chain'> | undefined
) => {
  if (!wallet) {
    return ''
  }
  if (wallet.chain === Chain.NEAR) {
    if (wallet.address.length === 64) {
      return (
        wallet.address.substring(0, 6) + '...' + wallet.address.substring(60)
      )
    }
    return wallet.address
  }
  const tail = wallet.address.length - 4
  return wallet.address.substring(0, 8) + '...' + wallet.address.substring(tail)
}

export const formatAccountId = (accountId: string | undefined) => {
  if (!accountId) {
    return ''
  }
  return (accountId || '').split('.')[0]
}

export function capitalizeFirstLetter(string: string | undefined) {
  if (!string) {
    return ''
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const ellipsis = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str
  }
  return str.substring(0, maxLength - 3) + '...' + str.substring(str.length - 3)
}

export const calcValue = (token: Token, rate = 1) => {
  if (!token) {
    return 0
  }
  const bal = formatTokenBalance(token.balance, token).toNumber()
  const value = bal * token.price * rate
  return Number(value.toFixed(2))
}

export const calcTotal = (tokens: Token[], rate = 1) => {
  let total = 0
  tokens.forEach((token) => {
    total += Number(calcValue(token, rate))
  })
  return total
}

export const formatBalance = (
  balance: string | undefined,
  decimals: number,
  tail = 2
): string => {
  if (!balance) {
    return '0'
  }
  const bal = /[A-Fa-f]{1}/g.test(balance) ? `0x${balance}` : balance
  const _decimals = typeof decimals === 'number' ? decimals : 24
  const v = new Decimal(bal).div(10 ** _decimals).toNumber()
  const result = _.trimEnd(Number(v).toFixed(tail), '0')
  const resultStr = result.split('.')
  return Number(resultStr[1]) === 0 ? resultStr[0] : result
}

export const parseAmount = (amount: string, token: Pick<Token, 'decimals'>) => {
  return new Decimal(amount)
    .mul(new Decimal(10).pow(new Decimal(token.decimals)))
    .toFixed(0)
}

export const formatTokenBalance = (
  balance: string | number,
  token: Token | undefined
) => {
  const decimals = typeof token?.decimals === 'number' ? token?.decimals : 24
  return new Decimal(balance).div(10 ** decimals)
}

export const formatWebviewTitle = (title: string) => {
  if (title.length > 16) {
    return title.substring(0, 16) + '...'
  }
  return title
}

export const decodeUint8Array = (octets: Uint8Array) => {
  let string = ''
  let i = 0
  while (i < octets.length) {
    let octet = octets[i]
    let bytesNeeded = 0
    let codePoint = 0
    if (octet <= 0x7f) {
      bytesNeeded = 0
      codePoint = octet & 0xff
    } else if (octet <= 0xdf) {
      bytesNeeded = 1
      codePoint = octet & 0x1f
    } else if (octet <= 0xef) {
      bytesNeeded = 2
      codePoint = octet & 0x0f
    } else if (octet <= 0xf4) {
      bytesNeeded = 3
      codePoint = octet & 0x07
    }
    if (octets.length - i - bytesNeeded > 0) {
      var k = 0
      while (k < bytesNeeded) {
        octet = octets[i + k + 1]
        codePoint = (codePoint << 6) | (octet & 0x3f)
        k += 1
      }
    } else {
      codePoint = 0xfffd
      bytesNeeded = octets.length - i
    }
    string += String.fromCodePoint(codePoint)
    i += bytesNeeded + 1
  }
  return string
}
