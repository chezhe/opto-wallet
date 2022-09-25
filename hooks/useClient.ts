import { useEffect, useState } from 'react'
import { connect, Near } from 'near-api-js'
import { Chain, NetworkBase } from 'types'
import { useAppSelector } from 'store/hooks'
import { ApiPromise as PolkadotProvider } from '@polkadot/api'
import { cryptoIsReady } from '@polkadot/util-crypto'
import { WalletKeyStore } from 'chain/near/WalletKeyStore'
import { getNetwork } from 'chain/common/network'

export const initNear = async (
  network: NetworkBase,
  keyStore = new WalletKeyStore()
) => {
  const config = {
    nodeUrl: network.nodeUrl,
    networkId: network.type,
    headers: {},
    keyStore: keyStore,
  }
  const near = await connect(config)
  return near
}

export const useNear = () => {
  const [near, setNear] = useState<Near | null>(null)
  const wallet = useAppSelector((state) => state.wallet.current)

  useEffect(() => {
    if (wallet?.networkType) {
      const network = getNetwork(wallet)
      if (network) {
        initNear(network)
          .then((_near) => setNear(_near))
          .catch(console.log)
      }
    }
  }, [wallet?.networkType])

  return near
}

export const useClient = () => {
  const [client, setClient] = useState<Near | PolkadotProvider | null>(null)
  const wallet = useAppSelector((state) => state.wallet.current)
  const networkType = wallet?.networkType

  useEffect(() => {
    const network = getNetwork(wallet)
    if (!wallet || !networkType || !network) {
      return
    }
    if (wallet.chain === Chain.NEAR) {
      initNear(network)
        .then((_near) => setClient(_near))
        .catch(console.log)
      return
    }
    const appchainId = wallet?.appchainId
    if (!appchainId) return

    async function prepareWsProvider() {
      try {
        if (!cryptoIsReady() || !network) {
          return
        }
        const initPolkaProvider =
          require('../chain/polkadot/initPolkaProvider').default
        const api = await initPolkaProvider(network.nodeUrl)
        setClient(api)
      } catch (error) {
        console.error(error)
      }
    }
    prepareWsProvider()
  }, [wallet?.chain, wallet?.appchainId, networkType])

  return client
}
