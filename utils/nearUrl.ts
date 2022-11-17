import { LOGIN_ACCESS_TYPES, NearLogin, NearSign } from 'types'
import URLParse from 'url-parse'

export const isNearUrl = (url: string) => {
  return (
    isLoginURL(url) ||
    isSignURL(url) ||
    isVerifyURL(url) ||
    isLinkdropURL(url) ||
    isImportSecretKeyURL(url)
  )
}

export const parseLoginURL = (
  url: string,
  accountId: string,
  suffix: string
): NearLogin => {
  const parsed = URLParse(url, true)

  const contractId = parsed.query.contract_id
  const publicKey = parsed.query.public_key
  const failureUrl = parsed.query.failure_url
  const successUrl = parsed.query.success_url
  const invalidContractId = parsed.query.invalidContractId

  let requestingFullAccess =
    !contractId ||
    (publicKey && contractId?.endsWith(`.${suffix}`)) ||
    contractId === accountId
  const requestAccountIdOnly = !publicKey && !contractId
  if (requestAccountIdOnly) {
    requestingFullAccess = false
  }
  const loginAccessType = requestingFullAccess
    ? LOGIN_ACCESS_TYPES.FULL_ACCESS
    : LOGIN_ACCESS_TYPES.LIMITED_ACCESS

  return {
    loginAccessType,
    failureUrl,
    successUrl,
    contractId,
    invalidContractId,
    publicKey,
  }
}

export const parseSignURL = (url: string): NearSign => {
  const parsed = URLParse(url, true)
  const { transactions, callbackUrl, meta } = parsed.query

  return {
    transactions,
    callbackUrl,
    meta,
  }
}

export const isLoginURL = (url: string): boolean => {
  return (
    url.startsWith('https://wallet.near.org/login') ||
    url.startsWith('https://wallet.testnet.near.org/login') ||
    url.startsWith('https://app.mynearwallet.com/login') ||
    url.startsWith('https://testnet.mynearwallet.com/login') ||
    url.startsWith('https://app.optowallet.com/login') ||
    url.startsWith('https://app.testnet.optowallet.com/login')
  )
}

export const isSignURL = (url: string): boolean => {
  return (
    url.startsWith('https://wallet.near.org/sign') ||
    url.startsWith('https://wallet.testnet.near.org/sign') ||
    url.startsWith('https://app.mynearwallet.com/sign') ||
    url.startsWith('https://testnet.mynearwallet.com/sign') ||
    url.startsWith('https://app.optowallet.com/sign') ||
    url.startsWith('https://app.testnet.optowallet.com/sign')
  )
}

export const isVerifyURL = (url: string): boolean => {
  return (
    url.startsWith('https://wallet.near.org/verify-owner') ||
    url.startsWith('https://wallet.testnet.near.org/verify-owner') ||
    url.startsWith('https://app.mynearwallet.com/verify-owner') ||
    url.startsWith('https://testnet.mynearwallet.com/verify-owner') ||
    url.startsWith('https://app.optowallet.com/verify-owner') ||
    url.startsWith('https://app.testnet.optowallet.com/verify-owner')
  )
}

export const isLinkdropURL = (url: string): boolean => {
  return (
    url.startsWith('https://wallet.near.org/linkdrop') ||
    url.startsWith('https://wallet.testnet.near.org/linkdrop') ||
    url.startsWith('https://app.mynearwallet.com/linkdrop') ||
    url.startsWith('https://testnet.mynearwallet.com/linkdrop') ||
    url.startsWith('https://app.optowallet.com/linkdrop') ||
    url.startsWith('https://app.testnet.optowallet.com/linkdrop')
  )
}

export const isImportSecretKeyURL = (url: string): boolean => {
  return (
    url.startsWith('https://wallet.near.org/auto-import-secret-key') ||
    url.startsWith('https://wallet.testnet.near.org/auto-import-secret-key') ||
    url.startsWith('https://app.mynearwallet.com/auto-import-secret-key') ||
    url.startsWith('https://testnet.mynearwallet.com/auto-import-secret-key') ||
    url.startsWith('https://app.optowallet.com/auto-import-secret-key') ||
    url.startsWith('https://app.testnet.optowallet.com/auto-import-secret-key')
  )
}
