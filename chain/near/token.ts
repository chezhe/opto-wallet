import API from 'configure/api'
import { Account, Near } from 'near-api-js'
import { AppDispatch } from 'store'
import { Chain, NetworkType, Token, Wallet } from 'types'
import { fetcher } from 'utils/fetch'

export const fetchNearFiat = (networkId: NetworkType) => {
  return fetcher(`${API.indexer}/api/fiat`).then((data) => data.near.usd ?? '0')
}

export const updateNearTokenList = async ({
  client,
  wallet,
  dispatch,
}: {
  client: Near
  wallet: Wallet
  dispatch: AppDispatch
}) => {
  client.connection.provider
    .query({
      request_type: 'view_account',
      finality: 'final',
      account_id: wallet.address,
    })
    .then((response) => {
      dispatch({
        payload: {
          chain: Chain.NEAR,
          balance: (response as any).amount,
        },
        type: 'asset/updateNativeTokenBalance',
      })
    })
    .catch(() => {
      dispatch({
        payload: {
          chain: Chain.NEAR,
          balance: '0',
        },
        type: 'asset/updateNativeTokenBalance',
      })
    })

  getLikelyTokensList(client, wallet)
    .then((tokenList) => {
      dispatch({ type: 'asset/updateLikelyTokens', payload: tokenList })
    })
    .catch(console.error)

  fetchNearFiat(wallet.networkType)
    .then((fiat) => {
      dispatch({
        payload: {
          chain: Chain.NEAR,
          price: fiat,
        },
        type: 'asset/updateNearPrice',
      })
    })
    .catch(console.error)
}

export const getLikelyTokensList = async (near: Near, wallet: Wallet) => {
  const viewAccount = new Account(near.connection, 'dontcare')

  try {
    const likelyTokens = await fetchNearTokens(wallet)

    const metas = await Promise.all(
      likelyTokens.map((t: string) => {
        return viewAccount
          .viewFunction(t, 'ft_metadata')
          .then((meta) => meta)
          .catch(() => null)
      })
    )

    const balances = await Promise.all(
      likelyTokens.map((t: string) => {
        return viewAccount
          .viewFunction(t, 'ft_balance_of', { account_id: wallet.address })
          .then((meta) => meta)
          .catch(() => '0')
      })
    )

    const prices = await fetchNearListedTokenPrice(wallet.networkType)

    return metas
      .map((t, idx) => {
        if (!t) {
          return null
        }
        const contractId = likelyTokens[idx]
        return {
          ...t,
          balance: balances[idx],
          price: prices[contractId] ? Number(prices[contractId].price) : 0,
          contractId,
          address: wallet.address,
          chain: Chain.NEAR,
          networkType: wallet.networkType,
        } as Token
      })
      .filter((t) => t)
  } catch (error) {
    return []
  }
}

export const getLikelyNFTList = async (
  near: Near,
  networkId: NetworkType,
  address: string
) => {
  const viewAccount = new Account(near.connection, 'dontcare')

  try {
    const likelyNFTs = await fetchNearNFT(networkId, address)
    const metas = await Promise.all(
      likelyNFTs.map((t: string) => {
        return viewAccount
          .viewFunction(t, 'nft_metadata')
          .then((meta) => meta)
          .catch(() => null)
      })
    )
    const numbers = await Promise.all(
      likelyNFTs.map((t: string) => {
        return viewAccount
          .viewFunction(t, 'nft_supply_for_owner', { account_id: address })
          .then((res) => res)
          .catch(() => null)
      })
    )

    const items = await Promise.all(
      likelyNFTs.map((t: string, idx: number) => {
        return viewAccount
          .viewFunction(t, 'nft_token', { token_id: numbers[idx] })
          .then((res) => res)
          .catch(() => null)
      })
    )

    return metas
      .map((m, idx) => {
        if (!m || !items[idx]) {
          return null
        }
        return { ...m, items: [items[idx]], id: numbers[idx] }
      })
      .filter((m) => m)
      .map((m) => ({ ...m, address }))
  } catch (error) {
    return []
  }
}

export const fetchNearActivity = (w: Wallet) => {
  return fetcher(
    `${API.indexer}/api/activity?accountId=${w.address}&network=${w.networkType}`
  )
    .then((res) => res)
    .catch(() => [])
}

export const fetchNearTokens = (w: Wallet) => {
  return fetcher(
    `${API.indexer}/api/likelyTokens?accountId=${w.address}&network=${w.networkType}`
  )
    .then((res) => res)
    .catch(() => [])
}

export const fetchNearAccountIds = async (
  networkType: NetworkType,
  publicKey: string
) => {
  try {
    const results = await fetcher(
      `${API.indexer}/api/accountIds?pk=${publicKey}&network=${networkType}`
    )
    if (!results.length) {
      const backupResults = await fetcher(
        `${API.kitwalletIndexer[networkType]}/publicKey/${publicKey}/accounts`
      )
      return backupResults
    }
    return results
  } catch (error) {
    return []
  }
}

export const fetchNearStakingPools = (networkId: NetworkType) => {
  return fetcher(`${API.indexer}/stakingPools?network=${networkId}`)
    .then((res) => res)
    .catch(() => {
      return []
    })
}

export const fetchNearListedTokenPrice = (networkId: NetworkType) => {
  return fetcher(API[networkId].TOKEN_PRICE)
    .then((data) => data)
    .catch(() => 16)
}

export const fetchNearNFT = (networkId: NetworkType, accountId: string) => {
  return fetcher(
    `${API.indexer}/account/${accountId}/likelyNFTs?network=${networkId}`
  )
    .then((res) => res)
    .catch(() => [])
}
