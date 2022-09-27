import { NEAR_NETWORKS } from 'chain/near/constants'
import { OCT_NETWORKS } from 'chain/polkadot/constants'
import { store } from 'store'
import { Chain, NetworkType, Wallet } from 'types'

export const getNetwork = (w: Wallet | undefined) => {
  if (!w) {
    return null
  }
  if (w.chain === Chain.OCT && w?.appchainId) {
    return OCT_NETWORKS[w.appchainId]
  }

  let network = null

  if (w.chain === Chain.NEAR) {
    network = NEAR_NETWORKS[w.networkType]
  }

  if (w.customNetworkName) {
    const customNetworks = store.getState().setting.networks
    const customNetwork = customNetworks.find(
      (t) => t.name === w.customNetworkName
    )
    if (customNetwork) {
      return {
        ...network,
        name: customNetwork.name,
        nodeUrl: customNetwork.nodeUrl,
        type: w.networkType,
      }
    }
  }

  return network
}

export const getAvaliableNetworks = (w: Wallet | undefined) => {
  if (!w) {
    return []
  }
  const networkTypes = getAvaliableNetworkType(w)
  if (w.chain === Chain.OCT) {
    return Object.values(OCT_NETWORKS)
  } else if (w.chain === Chain.NEAR) {
    const customNetworks = store.getState().setting.networks
    const customChainNetwork = customNetworks.filter((t) => t.chain === w.chain)

    if (networkTypes.length === 2) {
      return [...Object.values(NEAR_NETWORKS), ...customChainNetwork]
    }
    return [
      NEAR_NETWORKS[w.networkType],
      ...customChainNetwork.filter((t) => t.type === w.networkType),
    ]
  }
  return []
}

export const getAvaliableNetworkType = (w: Wallet) => {
  if (w.chain === Chain.NEAR) {
    if (w.address.includes(NEAR_NETWORKS[NetworkType.MAINNET].suffix)) {
      return [NetworkType.MAINNET]
    } else if (w.address.includes(NEAR_NETWORKS[NetworkType.TESTNET].suffix)) {
      return [NetworkType.TESTNET]
    }
    return [NetworkType.MAINNET, NetworkType.TESTNET]
  } else if (w.chain === Chain.OCT) {
    return [NetworkType.MAINNET]
  }
  return [NetworkType.MAINNET]
}
