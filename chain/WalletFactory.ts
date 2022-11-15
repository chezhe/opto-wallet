import { AppDispatch, store } from 'store'
import { AppChainType, Chain, NetworkType, Wallet } from 'types'
import icons from 'utils/icons'
import NearWallet from './NearWallet'
import OctWallet from './OctWallet'

export default class WalletFactory {
  static chains = [
    NearWallet.meta,
    OctWallet.meta,
  ]

  static getChains() {
    const isLabEnabled = store.getState().setting.isLabEnabled
    if (isLabEnabled) {
      return WalletFactory.chains
    }
    return [NearWallet.meta, OctWallet.meta]
  }

  static async startFromMnemonic(
    mnemonic: string,
    dispatch: AppDispatch
  ) {
    const defaultChains = WalletFactory.getChains()
      .filter((t) => t.default)
      .map((t) => t.chain)

    const defaultChain = defaultChains[0]
    if (defaultChain) {
      const nWallet = await WalletFactory.createWalletFromMnemonic(
        defaultChain,
        {
          networkType: NetworkType.MAINNET,
          mnemonic,
        }
      )
      dispatch({
        type: 'wallet/add',
        payload: nWallet,
      })
    }
  }

  static async createWalletFromMnemonic(chain: Chain, params: any) {
    if (chain === Chain.NEAR) {
      return await NearWallet.createWalletFromMnemonic(params)
    } else if (chain === Chain.OCT) {
      return await OctWallet.createWalletFromMnemonic(params)
    }
    throw new Error('Invalid chain')
  }

  static async createWalletFromPrivateKey(chain: Chain, params: any) {
    if (chain === Chain.NEAR) {
      return await NearWallet.createWalletFromPrivateKey(params)
    } else if (chain === Chain.OCT) {
      return await OctWallet.createWalletFromPrivateKey(params)
    }
    throw new Error('Invalid chain')
  }

  static isLedgerSupported(chain: Chain) {
    if (chain === Chain.NEAR) {
      return NearWallet.isLedgerSupported()
    }
    return false
  }

  static isCustomNetworkSupported(chain: Chain) {
    if (chain === Chain.NEAR) {
      return true
    }
    return false
  }

  static chainLogo(chain: Chain) {
    switch (chain) {
      case Chain.NEAR:
        return icons.NEAR
      case Chain.OCT:
        return icons.OCT
      default:
        break
    }
    return icons.NEAR
  }

  static formatAddress(w: Pick<Wallet, 'chain' | 'address'>) {
    if (w.chain === Chain.NEAR) {
      return NearWallet.formatAddress(w.address)
    } else if (w.chain === Chain.OCT) {
      return OctWallet.formatAddress(w.address)
    }
    return w.address
  }

  static hasSameAddressByNetworkType(chain: Chain) {
    if (chain === Chain.NEAR) {
      return false
    }
    return true
  }

  static canCreateWalletFromScan(w: Wallet | undefined, data: string) {
    if (!w) return false

    switch (w.chain) {
      case Chain.NEAR:
        return w.networkType === NetworkType.MAINNET
      default:
        break
    }

    return false
  }

  static fromWallet(w: Wallet) {
    if (w.chain === Chain.NEAR) {
      return new NearWallet(w)
    } else if (w.chain === Chain.OCT) {
      return new OctWallet(w)
    }
  }

  static getNetworkTypeByAddress(address: string, chain: Chain) {
    if (chain === Chain.OCT) {
      return AppChainType.FUSOTAO
    } else if (chain === Chain.NEAR) {
      if (address.endsWith('.testnet')) {
        return NetworkType.TESTNET
      }
    }
    return NetworkType.MAINNET
  }
}
