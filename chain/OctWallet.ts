import WebView, { WebViewMessageEvent } from 'react-native-webview'
import {
  NetworkType,
  Token,
  Chain,
  BaseTx,
  DApp,
  BaseNetwork,
  MarketSection,
  BasePreviewSignParams,
  WalletSource,
  AppChainType,
  ChainMeta,
  SecureKeyStore,
  Wallet,
  OctTx,
  TxType,
  CombineNetworkType,
  NFTsByCollection,
} from 'types'
import { fetcher, graphFetcher } from 'utils/fetch'
import icons from 'utils/icons'
import BaseWallet from './BaseWallet'
import { cryptoIsReady } from '@polkadot/util-crypto'
import { formatBalance, parseAmount } from 'utils/format'
import Decimal from 'decimal.js'
import { gql } from 'graphql-request'

const chain = Chain.OCT

const NETWORKS: {
  [key in AppChainType]: BaseNetwork
} = {
  [AppChainType.ATOCHA]: {
    icon: icons.ATOCHA,
    name: AppChainType.ATOCHA,
    type: AppChainType.ATOCHA,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/atocha/jungxomf4hdcfocwcalgoiz64g9avjim',
  },
  [AppChainType.DEBIO]: {
    icon: icons.DEBIO,
    name: AppChainType.DEBIO,
    type: AppChainType.DEBIO,
    nodeUrl:
      'wss://gateway.testnet.octopus.network/barnacle0918/j8xz59egu4h8y814qnunm0cqfrq09lrw',
  },
  [AppChainType.MYRIAD]: {
    icon: icons.MYRIAD,
    name: AppChainType.MYRIAD,
    type: AppChainType.MYRIAD,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/myriad/a4cb0a6e30ff5233a3567eb4e8cb71e0',
  },
  [AppChainType.FUSOTAO]: {
    icon: icons.FUSOTAO,
    name: AppChainType.FUSOTAO,
    type: AppChainType.FUSOTAO,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/fusotao/0efwa9v0crdx4dg3uj8jdmc5y7dj4ir2',
  },
  [AppChainType.DISCOVOL]: {
    icon: icons.DISCOVOL,
    name: AppChainType.DISCOVOL,
    type: AppChainType.DISCOVOL,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/discovol/afpft46l1egfhrv8at5pfyrld03zseo1',
  },
}

export default class OctWallet extends BaseWallet {
  static meta: ChainMeta = {
    chain,
    icon: icons.OCT,
    defaultNetworks: NETWORKS,
    defaultNetworkType: AppChainType.ATOCHA,
    sources: [WalletSource.MNEMONIC, WalletSource.PRIVATE_KEY],
    nativeTokens: [
      {
        name: 'Atocha',
        balance: '0',
        icon: icons.ATOCHA,
        price: 0,
        symbol: 'ATO',
        isNative: true,
        decimals: 18,
        chain,
        networkType: AppChainType.ATOCHA,
      },
      {
        name: 'Myriad',
        balance: '0',
        icon: icons.MYRIAD,
        price: 0,
        symbol: 'MIRIA',
        isNative: true,
        decimals: 18,
        chain,
        networkType: AppChainType.MYRIAD,
      },
      {
        name: 'debionetwork',
        balance: '0',
        icon: icons.DEBIO,
        price: 0,
        symbol: 'DBIO',
        isNative: true,
        decimals: 18,
        chain,
        networkType: AppChainType.DEBIO,
      },
      {
        name: 'fusotao',
        balance: '0',
        icon: icons.FUSOTAO,
        price: 0,
        symbol: 'TAO',
        isNative: true,
        decimals: 18,
        chain,
        networkType: AppChainType.FUSOTAO,
      },
      {
        name: 'discovol',
        balance: '0',
        icon: icons.DISCOVOL,
        price: 0,
        symbol: 'DISC',
        isNative: true,
        decimals: 14,
        chain,
        networkType: AppChainType.DISCOVOL,
      },
    ],
  }

  static async createWalletFromMnemonic({
    mnemonic,
  }: {
    mnemonic: string
    [key: string]: any
  }): Promise<Wallet> {
    if (!cryptoIsReady()) {
      throw new Error('Crypto is not ready')
    }
    const initPolkaProvider = require('./common/initPolkaProvider').default
    const api = await initPolkaProvider()
    const Keyring = require('@polkadot/api').Keyring
    const keyring = new Keyring({ type: 'sr25519' })
    const newPair = keyring.addFromUri(mnemonic)
    const nWallet = {
      chain,
      networkType: OctWallet.meta.defaultNetworkType,
      address: newPair.address,
      publicKey: newPair.publicKey.toString(),
    }

    await api.disconnect()

    const keyStore: SecureKeyStore = {
      ...nWallet,
      mnemonic,
    }

    await this.createWallet(keyStore)

    return nWallet
  }

  static async createWalletFromPrivateKey({
    privateKey,
  }: {
    [key: string]: any
    privateKey: string
  }): Promise<Wallet> {
    if (!cryptoIsReady()) {
      throw new Error('Crypto is not ready')
    }
    const initPolkaProvider = require('./common/initPolkaProvider').default
    const api = await initPolkaProvider()
    const Keyring = require('@polkadot/api').Keyring
    const keyring = new Keyring({ type: 'sr25519' })
    const newPair = keyring.addFromUri(privateKey)
    const nWallet = {
      chain: Chain.OCT,
      networkType: OctWallet.meta.defaultNetworkType,
      address: newPair.address,
      publicKey: newPair.publicKey.toString(),
      appchainId: AppChainType.ATOCHA,
    }
    await api.disconnect()

    const keyStore: SecureKeyStore = {
      ...nWallet,
      privateKey,
    }

    await this.createWallet(keyStore)

    return nWallet
  }

  async isValidAddress(
    addr: string,
    networkType: NetworkType
  ): Promise<boolean> {
    if (!cryptoIsReady()) return false
    const polkaUtils = require('./common/octUtils')
    return await polkaUtils.isSubstrateAddress(addr)
  }

  formattedAddress(): string {
    return OctWallet.formatAddress(this.wallet.address)
  }

  static formatAddress(addr: string): string {
    const tail = addr.length - 4
    return addr.substring(0, 8) + '...' + addr.substring(tail)
  }

  async getTokenList(localTokens: Token[]): Promise<{
    address: string
    networkType: CombineNetworkType
    tokens: Token[]
    nativeToken: {
      balance: string
      price: number
      chain: Chain
      networkType: CombineNetworkType
    }
  }> {
    const { address, networkType } = this.wallet
    const network = this.getNetwork()
    if (!cryptoIsReady()) {
      return {
        address,
        networkType,
        tokens: [],
        nativeToken: {
          balance: '0',
          price: 0,
          chain,
          networkType: network.type,
        },
      }
    }
    const initPolkaProvider = require('./common/initPolkaProvider').default
    const api = await initPolkaProvider(network.nodeUrl)
    const price = await fetcher(
      `${this.API}/api/${chain}/fiat?appchain=${network.type}`
    )

    const res = await api.query.system.account(address)
    const result: any = res.toJSON()

    const balance = new Decimal(result?.data?.free).toString()

    return {
      address,
      networkType,
      tokens: [],
      nativeToken: {
        balance,
        price: Number(price),
        chain,
        networkType: network.type,
      },
    }
  }

  async getNFTList(): Promise<NFTsByCollection[]> {
    return Promise.resolve([])
  }

  async getTokenTxList(t: Token): Promise<BaseTx[][]> {
    const { address, networkType } = this.wallet
    const octTxIn = await graphFetcher(
      `https://api.subquery.network/sq/octopus-appchains/${networkType}`,
      TRANSFERS_IN_QUERY,
      {
        id: address,
        offset: 0,
        pageSize: 30,
      }
    )
    const octTxOut = await graphFetcher(
      `https://api.subquery.network/sq/octopus-appchains/${networkType}`,
      TRANSFERS_OUT_QUERY,
      {
        id: address,
        offset: 0,
        pageSize: 30,
      }
    )
    const _txs: OctTx[] = [
      ...(octTxIn?.account.transferIn.nodes ?? []),
      ...(octTxOut?.account.transferOut.nodes ?? []),
    ]

    return _txs.map((tx) => {
      const isOut = address === tx.fromId
      return [
        {
          type: isOut ? TxType.OUT : TxType.IN,
          time: tx.timestamp,
          title: `${isOut ? 'Send' : 'Receive'} ${formatBalance(
            tx.amount,
            t.decimals
          )} ${t.symbol}`,
          subtitle: OctWallet.formatAddress(isOut ? tx.toId : tx.fromId),
          hash: tx.extrinsicId,
          link: '',
        },
      ]
    })
  }

  async transfer({
    to,
    amount,
    token,
  }: {
    to: string
    amount: string
    token: Token
  }): Promise<string> {
    if (!cryptoIsReady()) {
      throw new Error('Crypto is not ready')
    }
    const _amount = parseAmount(amount, token)
    const network = this.getNetwork()
    const initPolkaProvider = require('./common/initPolkaProvider').default
    const api = await initPolkaProvider(network.nodeUrl)

    const keyStore = await this.exportWallet()

    const Keyring = require('@polkadot/api').Keyring
    const keyring = new Keyring({ type: 'sr25519' })
    const pair = keyring.addFromUri(keyStore.mnemonic!)
    await api.tx.balances.transfer(to, _amount).signAndSend(pair)
    return ''
  }
  signAndSendTransaction(tx: any): Promise<string> {
    throw new Error('Method not implemented.')
  }
  signAndSendTransactions(txs: any): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  isWCSupported = () => false

  getNetworks(): BaseNetwork[] {
    return Object.values(NETWORKS)
  }

  getNetwork(): BaseNetwork {
    const w = this.wallet

    return NETWORKS[w.networkType as AppChainType]
  }

  isDefaultNetwork(type: string): boolean {
    return Object.keys(NETWORKS).includes(type)
  }

  createAccount(params: { [key: string]: any }): Promise<string> {
    throw new Error('Method not implemented.')
  }

  async getDAppList(): Promise<DApp[]> {
    const { networkType, chain } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/dapps?network=${networkType}`
    )
  }

  async searchDApps(keyword: string): Promise<DApp[]> {
    const { networkType, chain } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/searchDApps?network=${networkType}&keyword=${keyword}`
    )
  }

  async getMarket(): Promise<MarketSection[]> {
    const { networkType, chain } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/market?network=${networkType}`
    )
  }

  async getStaking() {
    const { networkType, chain } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/staking?network=${networkType}`
    )
  }

  injectedDAppScript = () => ''

  onDAppMessage(e: WebViewMessageEvent, webview: WebView<{}>): void {
    throw new Error('Method not implemented.')
  }
  onConnectDApp(webview: WebView<{}>, params: any): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onRejectDApp(webview: WebView<{}>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDisconnectDApp(webview: WebView<{}>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onSignDApp(webview: WebView<{}>, payload: any): Promise<void> {
    throw new Error('Method not implemented.')
  }
  formatPreviewSignParams(params: any): BasePreviewSignParams[] {
    throw new Error('Method not implemented.')
  }

  filterWalletToken(t: Token): boolean {
    const w = this.wallet
    if (!w || !t) {
      return false
    }

    if (w.chain === t.chain) {
      return !!(t.isNative && t.networkType === w.networkType)
    }

    return false
  }
}

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
