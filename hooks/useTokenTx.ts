import { useEffect, useState } from 'react'
import { Chain, Token, TxActivity, Wallet } from 'types'
import { fetcher, graphFetcher } from 'utils/fetch'
import { gql } from 'graphql-request'
import { fetchNearActivity } from 'chain/near/token'
import useSWR from 'swr'
import API from 'configure/api'

const TRANSFERS_IN_QUERY = gql`
  query AccountTransfersIn($id: String!, $offset: Int!, $pageSize: Int!) {
    account(id: $id) {
      transferIn(offset: $offset, first: $pageSize, orderBy: TIMESTAMP_DESC) {
        nodes {
          id
          fromId
          toId
          amount
          extrinsicId
          timestamp
        }
        totalCount
      }
    }
  }
`

const TRANSFERS_OUT_QUERY = gql`
  query AccountTransfersOut($id: String!, $offset: Int!, $pageSize: Int!) {
    account(id: $id) {
      transferOut(offset: $offset, first: $pageSize, orderBy: TIMESTAMP_DESC) {
        nodes {
          id
          fromId
          toId
          amount
          extrinsicId
          timestamp
        }
        totalCount
      }
    }
  }
`
const deduplicate = (results: [number, string][] | undefined) =>
  results
    ? results
        .map((result) => result[1])
        .filter((value, index, self) => self.indexOf(value) === index)
    : []

export default function useTokenTx(wallet: Wallet, token: Token) {
  const [txs, setTxs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [oldToken, setOldToken] = useState<Token>()
  const { data: nearTx, error } = useSWR(
    wallet.chain === Chain.NEAR
      ? `${API.indexer}/api/activity?accountId=${wallet.address}&network=${wallet.networkType}`
      : null,
    fetcher
  )

  useEffect(() => {
    async function fetch() {
      try {
        setIsLoading(true)
        if (
          oldToken?.contractId !== token.contractId ||
          oldToken?.chain !== token.chain ||
          oldToken?.address !== token.address
        ) {
          setTxs([])
          setOldToken(token)
        }

        if (wallet.chain === Chain.NEAR) {
        } else if (wallet.chain === Chain.OCT) {
          const octTxIn = await graphFetcher(
            `https://api.subquery.network/sq/octopus-appchains/${wallet.appchainId}`,
            TRANSFERS_IN_QUERY,
            {
              id: wallet.address,
              offset: 0,
              pageSize: 30,
            }
          )
          const octTxOut = await graphFetcher(
            `https://api.subquery.network/sq/octopus-appchains/${wallet.appchainId}`,
            TRANSFERS_OUT_QUERY,
            {
              id: wallet.address,
              offset: 0,
              pageSize: 30,
            }
          )
          const _txs = [
            ...(octTxIn?.account.transferIn.nodes ?? []),
            ...(octTxOut?.account.transferOut.nodes ?? []),
          ]

          setTxs(_txs as any)
        }
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
      }
    }

    fetch()
  }, [wallet.address, wallet.appchainId, wallet.networkType, token?.contractId])

  let _txs = []
  let _isLoading = isLoading
  if (wallet?.chain === Chain.NEAR) {
    if (token?.isNative) {
      _txs = nearTx || []
    } else {
      _txs = (nearTx || []).filter(
        (tx: TxActivity) => tx.receiver_id === token.contractId
      )
    }
    _isLoading = !nearTx && !error
  } else {
    _txs = txs
  }
  return {
    txs: _txs,
    isLoading: _isLoading,
  }
}
