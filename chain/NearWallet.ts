import { BN } from 'bn.js'
import { sha256 } from 'js-sha256'
import * as bip39 from 'bip39'
import nacl from 'tweetnacl'
import { derivePath } from 'near-hd-key'
import bs58 from 'bs58'
import { buf2hex, normalizeMnemonic } from 'chain/common'
import BaseWallet from './BaseWallet'
import { KeyPair, providers, Signer, transactions, utils } from 'near-api-js'
import {
  Chain,
  BaseNetwork,
  NetworkType,
  SecureKeyStore,
  Token,
  Wallet,
  WalletSource,
  ChainMeta,
  BasePreviewSignParams,
  NFTsByCollection,
  NearLinkDrop,
  NFTContractMetadata,
  NFTItem,
  BaseTx,
} from 'types'
import {
  AccessKeyInfoView,
  CodeResult,
  FinalExecutionOutcome,
} from 'near-api-js/lib/providers/provider'
import { fetcher, post } from 'utils/fetch'
import {
  capitalizeFirstLetter,
  decodeUint8Array,
  parseAmount,
} from 'utils/format'
import { store } from 'store'
import type {
  Action,
  Transaction,
  AddKeyPermission,
} from '@near-wallet-selector/core'
import LedgerAPI from './LedgerAPI'
import { PublicKey } from 'near-api-js/lib/utils'
import {
  SignedTransaction,
  Transaction as RawTransaction,
} from 'near-api-js/lib/transaction'
import type { AccessKeyView } from 'near-api-js/lib/providers/provider'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import icons from 'utils/icons'
import WebView, { WebViewMessageEvent } from 'react-native-webview'
import Decimal from 'decimal.js'
import { AccountAuthorizedApp } from 'near-api-js/lib/account'

const FT_TRANSFER_GAS = '30000000000000'
const NEAR_DERIVED_PATH = "m/44'/397'/0'"
const MIN_BALANCE_TO_CREATE = parseNearAmount('0.1')!
const LINKDROP_GAS = '100000000000000'

const NETWORKS = {
  [NetworkType.TESTNET]: {
    name: NetworkType.TESTNET,
    networkId: NetworkType.TESTNET,
    type: NetworkType.TESTNET,
    nodeUrl:
      'https://near-testnet.infura.io/v3/c895a1e99c794155a57cd6a39b055b65',
    explorerUrl: 'https://explorer.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    indexerUrl: 'https://testnet-api.kitwallet.app',
    contractCreateAccountUrl: 'https://near-contract-helper.onrender.com',
    lookupAccountIdSuffix: 'lockup.m0',
    suffix: '.testnet',
    MIN_BALANCE_FOR_GAS: '0.05',
    MIN_BALANCE_TO_CREATE: '0.1',
    LINKDROP_GAS: '100000000000000',
    kitwalletIndexer: 'https://testnet-api.kitwallet.app',
    nravatar: 'app.nravatar.testnet',
  },
  [NetworkType.MAINNET]: {
    name: NetworkType.MAINNET,
    networkId: NetworkType.MAINNET,
    type: NetworkType.MAINNET,
    nodeUrl:
      'https://near-mainnet.infura.io/v3/c895a1e99c794155a57cd6a39b055b65',
    explorerUrl: 'https://explorer.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    indexerUrl: 'https://api.kitwallet.app',
    contractCreateAccountUrl: 'https://near-contract-helper.onrender.com',
    lookupAccountIdSuffix: 'lockup.near',
    suffix: '.near',
    MIN_BALANCE_FOR_GAS: '0.05',
    MIN_BALANCE_TO_CREATE: '0.1',
    LINKDROP_GAS: '100000000000000',
    kitwalletIndexer: 'https://api.kitwallet.app',
    nravatar: 'app.nravatar.near',
  },
}

export function btoa(str: string) {
  return Buffer.from(str).toString('base64')
}

const chain = Chain.NEAR
export default class NearWallet extends BaseWallet {
  static meta: ChainMeta = {
    chain,
    icon: icons.NEAR,
    default: true,
    defaultNetworks: NETWORKS,
    defaultNetworkType: NetworkType.MAINNET,
    sources: [WalletSource.MNEMONIC, WalletSource.PRIVATE_KEY],
    nativeTokens: [
      {
        name: 'NEAR',
        balance: '0',
        icon: icons.NEAR,
        price: 0,
        symbol: 'NEAR',
        isNative: true,
        decimals: 24,
        chain,
        networkType: NetworkType.MAINNET,
      },
    ],
  }

  getNetwork = () => {
    const w = this.wallet

    let network = NETWORKS[w.networkType as NetworkType]

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

  isDefaultNetwork(type: string): boolean {
    return Object.keys(NETWORKS).includes(type)
  }

  getNetworks(): BaseNetwork[] {
    const { chain, networkType, address } = this.wallet
    const customNetworks = store.getState().setting.networks
    const customChainNetwork = customNetworks.filter((t) => t.chain === chain)

    let networkTypes = [NetworkType.MAINNET, NetworkType.TESTNET]
    if (address.includes(NETWORKS[NetworkType.MAINNET].suffix)) {
      networkTypes = [NetworkType.MAINNET]
    } else if (address.includes(NETWORKS[NetworkType.TESTNET].suffix)) {
      networkTypes = [NetworkType.TESTNET]
    }
    if (networkTypes.length === 2) {
      return [...Object.values(NETWORKS), ...customChainNetwork]
    }
    return [
      NETWORKS[networkType as NetworkType],
      ...customChainNetwork.filter((t) => t.type === networkType),
    ]
  }

  async getAuthorizedApps(): Promise<AccountAuthorizedApp[]> {
    try {
      const network = this.getNetwork()
      const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
      const response = await provider.query({
        request_type: 'view_access_key_list',
        account_id: this.wallet.address,
        finality: 'optimistic',
      })

      let accessKeys: AccessKeyInfoView[] = []
      if (Array.isArray(response)) {
        accessKeys = response
      } else {
        accessKeys = (response as any).keys
      }
      const authorizedApps: AccountAuthorizedApp[] = []

      accessKeys.forEach((item) => {
        const perm = item.access_key.permission
        if (perm !== 'FullAccess') {
          authorizedApps.push({
            contractId: perm.FunctionCall.receiver_id,
            amount: perm.FunctionCall.allowance,
            publicKey: item.public_key,
          })
        }
      })
      return authorizedApps
    } catch (error) {
      return []
    }
  }

  static formatAddress(addr: string): string {
    if (addr.length === 64) {
      return addr.substring(0, 6) + '...' + addr.substring(60)
    }
    return addr
  }

  formattedAddress(): string {
    let addr = this.wallet.address
    if (addr.length === 64) {
      return addr.substring(0, 6) + '...' + addr.substring(60)
    }
    return addr
  }

  isValidAddress(address: string, networkType: NetworkType): Promise<boolean> {
    if (address.length === 64) {
      return Promise.resolve(/^[a-z0-9]{64}$/.test(address))
    } else {
      return NearWallet.existAccountId(address, networkType)
    }
  }

  async getAvatar() {
    const { address, networkType } = this.wallet
    return NearWallet.getAvatarByAddress(networkType as NetworkType, address)
  }

  static async getAvatarByAddress(networkType: NetworkType, address: string) {
    try {
      const network = NETWORKS[networkType]
      const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
      const avatarRes = await provider.query<CodeResult>({
        request_type: 'call_function',
        account_id: network.nravatar,
        method_name: 'get_avatar',
        args_base64: btoa(JSON.stringify({ account_id: address })),
        finality: 'optimistic',
      })

      const avatar = JSON.parse(Buffer.from(avatarRes.result).toString())

      if (avatar) {
        const { contract_id, token_id } = avatar
        const result = await getNFT(provider, contract_id, token_id)
        const collection: NFTContractMetadata = result.collection
        const item: NFTItem = result.item
        return getNFTMedia(collection, item, address)
      }
    } catch (error) {}
    return undefined
  }

  async getNFTMedia(contractId: string, tokenId: string) {
    const network = this.getNetwork()
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
    const result = await getNFT(provider, contractId, tokenId)
    const collection: NFTContractMetadata = result.collection
    const item: NFTItem = result.item
    return getNFTMedia(collection, item, this.wallet.address)
  }

  async getNFT(contractId: string, tokenId: string) {
    const network = this.getNetwork()
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
    return await getNFT(provider, contractId, tokenId)
  }

  async getTokenList(localTokens: Token[]) {
    const { address, networkType } = this.wallet
    const network = this.getNetwork()
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
    const isExist = await this.isExist()
    const fiat = await fetcher(`${this.API}/api/${chain}/fiat`)

    if (!isExist) {
      return {
        address,
        networkType,
        tokens: [],
        nativeToken: {
          balance: '0',
          price: fiat.near.usd ?? 0,
          chain,
        },
      }
    }
    const account = await provider.query<CodeResult>({
      request_type: 'view_account',
      finality: 'final',
      account_id: address,
    })

    const likelyTokens = await fetcher(
      `${this.API}/api/${chain}/tokens?accountId=${address}&network=${networkType}`
    )

    const newTokens = likelyTokens.filter(
      (t: string) => !localTokens.some((l) => l.contractId === t)
    )

    // only get the metadata of new token
    const metas = await Promise.all(
      newTokens.map(async (t: string) => {
        try {
          const res = await provider.query<CodeResult>({
            request_type: 'call_function',
            account_id: t,
            method_name: 'ft_metadata',
            args_base64: '',
            finality: 'optimistic',
          })

          return {
            ...JSON.parse(Buffer.from(res.result).toString()),
            contractId: t,
          }
        } catch (error) {
          return null
        }
      })
    )

    const balances = await Promise.all(
      likelyTokens.map(async (t: string) => {
        try {
          const res = await provider.query<CodeResult>({
            request_type: 'call_function',
            account_id: t,
            method_name: 'ft_balance_of',
            args_base64: btoa(JSON.stringify({ account_id: address })),
            finality: 'optimistic',
          })

          return JSON.parse(Buffer.from(res.result).toString())
        } catch (error) {
          return '0'
        }
      })
    )

    const prices = await fetcher(
      `${this.API}/api/${chain}/list-token-price?network=${networkType}`
    )

    // To fix
    const tokens: Token[] = likelyTokens
      .map((t: string, idx: number) => {
        let meta = null
        if (localTokens.some((l) => l.contractId === t)) {
          meta = localTokens.find((l) => l.contractId === t)
        } else if (metas.some((m) => m?.contractId === t)) {
          meta = metas.find((m) => m?.contractId === t)
        }
        if (!meta) return null

        const contractId = likelyTokens[idx]
        return {
          ...meta,
          balance: balances[idx],
          price: prices[contractId] ? Number(prices[contractId].price) : 0,
          contractId,
          address: address,
          chain,
          networkType: networkType,
        } as Token
      })
      .filter((t: any) => t !== null) as Token[]

    return {
      address,
      networkType,
      tokens,
      nativeToken: {
        balance: (account as any).amount,
        price: fiat.near.usd ?? 0,
        chain,
      },
    }
  }

  async getNFTList(): Promise<NFTsByCollection[]> {
    const { address, networkType } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/nfts?accountId=${address}&network=${networkType}`
    )
  }

  async getTokenTxList(token: Token): Promise<BaseTx[][]> {
    const { networkType, address } = this.wallet

    const activities = await fetcher(
      `${this.API}/api/${chain}/txns?accountId=${address}&network=${networkType}`
    )
    const txs = activities.filter((txs: BaseTx[]) => {
      if (token.isNative) {
        return true
      }
      return txs.some((tx) => tx.subtitle === token.contractId)
    })

    return txs
  }

  async signAndSendTransaction({
    receiverId,
    actions,
  }: {
    receiverId: string
    actions: Action[]
  }) {
    const txHashes = await this.signAndSendTransactions({
      transactions: [
        {
          signerId: this.wallet.address,
          receiverId,
          actions,
        },
      ],
    })
    return txHashes[0]
  }

  async signTransaction(tx: any): Promise<SignedTransaction> {
    const signedTxs = await this.signTransactions({ transactions: [tx] })
    return signedTxs[0]
  }

  getSigner(privateKey = ''): Signer {
    if (this.wallet.isLedger) {
      return LedgerAPI.getSigner()
    }

    return {
      createKey: (accountId: string, networkId?: string) => {
        throw new Error('Not implemented')
      },
      getPublicKey: async (address: string, networdId?: string) => {
        if (privateKey) {
          const keypair = KeyPair.fromString(privateKey)
          return keypair.getPublicKey()
        }
        const _keyStore = await super.exportWallet()
        return PublicKey.fromString(_keyStore.publicKey)
      },
      signMessage: async (
        message: Uint8Array,
        address: string,
        networkId?: string
      ) => {
        const hash = new Uint8Array(sha256.array(message))
        let keypair: KeyPair
        if (privateKey) {
          keypair = KeyPair.fromString(privateKey)
        } else {
          const _keyStore = await super.exportWallet()
          keypair = KeyPair.fromString(_keyStore.privateKey)
        }
        const signature = keypair.sign(hash)

        return signature
      },
    }
  }

  async signMessage(msg: string): Promise<any> {
    const signer = this.getSigner()
    const signed = await signer.signMessage(
      Buffer.from(msg),
      this.wallet.address
    )
    return signed
  }

  async verifyMessage(message: string): Promise<any> {
    const signer = this.getSigner()
    const publicKey = await signer.getPublicKey(this.wallet.address)
    const network = this.getNetwork()
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
    const blockInfo = await provider.block({
      finality: 'final',
    })
    const data = {
      accountId: this.wallet.address,
      message,
      blockId: blockInfo.header.hash,
      publicKey: Buffer.from(publicKey.data).toString('base64'),
      keyType: publicKey.keyType,
    }

    const encoded = JSON.stringify(data)
    const signed = await this.signMessage(encoded)
    return {
      ...data,
      signature: Buffer.from(signed.signature).toString('base64'),
      keyType: signed.publicKey.keyType,
    }
  }

  async signTransactions({
    transactions,
  }: {
    transactions: Transaction[]
  }): Promise<SignedTransaction[]> {
    const signer = this.getSigner()

    const network = this.getNetwork()
    if (!network) {
      throw new Error('Network not found')
    }

    const signedTransactions = await signTransactions(
      transactions,
      signer,
      network
    )
    return signedTransactions
  }

  async signAndSendTransactions({
    transactions,
  }: {
    transactions: Transaction[]
  }): Promise<string[]> {
    const signedTransactions = await this.signTransactions({ transactions })
    const network = this.getNetwork()

    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
    const results: Array<FinalExecutionOutcome> = []

    for (let i = 0; i < signedTransactions.length; i++) {
      results.push(await provider.sendTransaction(signedTransactions[i]))
    }

    return results.map((t) => t.transaction.hash as string)
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
    const _amount = parseAmount(amount, token)
    if (token.isNative) {
      return await this.signAndSendTransaction({
        receiverId: to,
        actions: [
          {
            type: 'Transfer',
            params: {
              deposit: _amount,
            },
          },
        ],
      })
    } else {
      const network = this.getNetwork()
      const provider = new providers.JsonRpcProvider({
        url: network.nodeUrl,
      })
      const actions: Action[] = []
      if (token.contractId !== 'usn') {
        const res = await provider.query<CodeResult>({
          request_type: 'call_function',
          account_id: token.contractId,
          method_name: 'storage_balance_of',
          args_base64: btoa(JSON.stringify({ account_id: to })),
          finality: 'optimistic',
        })
        const storageBalance = JSON.parse(Buffer.from(res.result).toString())

        const storageRes = await provider.query<CodeResult>({
          request_type: 'call_function',
          account_id: token.contractId,
          method_name: 'storage_balance_bounds',
          args_base64: '',
          finality: 'optimistic',
        })
        const storageBounds = JSON.parse(
          Buffer.from(storageRes.result).toString()
        )

        if (
          !storageBalance ||
          new Decimal(storageBalance?.total).lessThan(storageBounds.min)
        ) {
          actions.push({
            type: 'FunctionCall',
            params: {
              methodName: 'storage_deposit',
              args: {
                registration_only: true,
                account_id: to,
              },
              gas: FT_TRANSFER_GAS,
              deposit: storageBounds.min,
            },
          })
        }
      }

      actions.push({
        type: 'FunctionCall',
        params: {
          methodName: 'ft_transfer',
          args: {
            amount: _amount,
            receiver_id: to,
          },
          gas: FT_TRANSFER_GAS,
          deposit: '1',
        },
      })

      return await this.signAndSendTransaction({
        receiverId: token.contractId!,
        actions: actions,
      })
    }
  }

  static async createWalletFromMnemonic({
    mnemonic,
    accountId,
    networkType,
  }: {
    mnemonic: string
    accountId: string
    networkType: NetworkType
  }): Promise<Wallet> {
    const { privateKey, publicKey } = await NearWallet.parseMnemonic(mnemonic)
    if (!publicKey || !privateKey) {
      throw new Error(`Invalid mnemonic`)
    }
    const network = NETWORKS[networkType]
    if (!accountId) {
      accountId = await getNearAccountId(networkType, publicKey)
    } else if (networkType === NetworkType.TESTNET) {
      await createWallet(network.contractCreateAccountUrl, accountId, publicKey)
    } else if (networkType === NetworkType.MAINNET) {
      await createWallet(network.contractCreateAccountUrl, accountId, publicKey)
    }

    if (!accountId) {
      throw new Error('Invalid AccountId')
    }

    const nWallet = {
      chain,
      address: accountId,
      networkType,
      publicKey,
    }

    if (await NearWallet.existWallet(nWallet)) {
      return nWallet
    }

    const keyStore: SecureKeyStore = {
      ...nWallet,
      privateKey,
      mnemonic,
    }

    await NearWallet.createWallet(keyStore)

    return nWallet
  }

  static async getAccountIdsFromPublicKey(
    networkType: NetworkType,
    publicKey: string
  ) {
    return getNearAccountId(networkType, publicKey, true)
  }

  static async createWalletFromPrivateKey({
    privateKey,
    networkType,
  }: {
    privateKey: string
    networkType: NetworkType
  }): Promise<Wallet> {
    const keyPair = KeyPair.fromString(privateKey)
    const publicKey = keyPair.getPublicKey().toString()

    const accountId = await getNearAccountId(networkType, publicKey)

    const nWallet = {
      chain,
      address: accountId,
      networkType,
      publicKey,
    }

    if (await this.existWallet(nWallet)) {
      return nWallet
    }

    const keyStore: SecureKeyStore = {
      ...nWallet,
      privateKey,
    }
    await this.createWallet(keyStore)

    return nWallet
  }

  async getDAppList() {
    const { networkType, chain } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/dapps?network=${networkType}`
    )
  }

  async searchDApps(keyword: string) {
    const { networkType, chain } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/searchDApps?keyword=${keyword}&network=${networkType}`
    )
      .then((data) => data)
      .catch(() => [])
  }

  async getHotSearchDApps() {
    const { networkType, chain } = this.wallet
    return await fetcher(
      `${this.API}/api/${chain}/hotSearchDApps?network=${networkType}`
    )
      .then((data) => data)
      .catch(() => [])
  }

  async getMarket() {
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

  async claimLinkDrop(linkdrop: NearLinkDrop) {
    const { address } = this.wallet
    const signer = this.getSigner(linkdrop.fundingKey)

    const network = this.getNetwork()
    if (!network) {
      throw new Error('Network not found')
    }

    const signedTransactions = await signTransactions(
      [
        {
          signerId: linkdrop.fundingContract,
          receiverId: linkdrop.fundingContract,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'claim',
                args: {
                  account_id: address,
                },
                gas: LINKDROP_GAS,
                deposit: '0',
              },
            },
          ],
        },
      ],
      signer,
      network
    )

    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    return await provider.sendTransaction(signedTransactions[0])
  }

  async createAccount(params: { [key: string]: any }): Promise<string> {
    const { accountId, publicKey } = params
    if (await NearWallet.existAccountId(accountId, NetworkType.MAINNET)) {
      throw new Error('Account already exists')
    }
    return await this.signAndSendTransaction({
      receiverId: 'near',
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'create_account',
            args: {
              new_account_id: accountId,
              new_public_key: publicKey.replace(/^ed25519:/, ''),
            },
            gas: LINKDROP_GAS,
            deposit: MIN_BALANCE_TO_CREATE,
          },
        },
      ],
    })
  }

  static async parseMnemonic(
    mnemonic: string
  ): Promise<{ privateKey: string; publicKey: string }> {
    const seed: Buffer = await bip39.mnemonicToSeed(normalizeMnemonic(mnemonic))
    const { key } = derivePath(NEAR_DERIVED_PATH, seed.toString('hex'))
    const keyPair = nacl.sign.keyPair.fromSeed(key)
    const publicKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.publicKey))
    const privateKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.secretKey))
    return { privateKey, publicKey }
  }

  static async existAccountId(
    accountId: string,
    networkType: NetworkType
  ): Promise<boolean> {
    try {
      const network = NETWORKS[networkType]
      const address = accountId
      const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
      const account = await provider.query<CodeResult>({
        request_type: 'view_account',
        finality: 'final',
        account_id: address,
      })

      return !!account
    } catch (error) {
      return false
    }
  }

  async isExist(): Promise<boolean> {
    const { address, networkType } = this.wallet
    return await NearWallet.existAccountId(address, networkType as NetworkType)
  }

  static isLedgerSupported = () => true

  static isWCSupported = () => true

  isWCSupported(): boolean {
    return NearWallet.isWCSupported()
  }

  isLedgerSupported(): boolean {
    return NearWallet.isLedgerSupported()
  }

  injectedDAppScript = () => ''

  onDAppMessage(e: WebViewMessageEvent, webview: WebView): void {}

  async onConnectDApp(webview: WebView, params: any): Promise<void> {}

  async onRejectDApp(webview: WebView): Promise<void> {}

  async onDisconnectDApp(webview: WebView): Promise<void> {}

  async onSignDApp(webview: WebView, payload: any): Promise<void> {}

  formatPreviewSignParams(params: string): BasePreviewSignParams[] {
    const rawTxs = NearWallet.transformDAppTransaction(params)
    return NearWallet.transformRawTransactions(this.wallet, rawTxs)
  }

  static transformDAppTransaction(txs: string) {
    const rawTxs: RawTransaction[] = []
    if (txs) {
      txs
        .split(',')
        .map((str) => Buffer.from(str, 'base64'))
        .forEach((buffer) => {
          rawTxs.push(
            utils.serialize.deserialize(
              transactions.SCHEMA,
              transactions.Transaction,
              buffer
            )
          )
        })
    }
    return rawTxs
  }

  static transformRawTransactions = (
    wallet: Wallet,
    txs: RawTransaction[]
  ): Transaction[] => {
    return txs.map(({ signerId, receiverId, actions }) => {
      return {
        signerId: signerId || wallet.address,
        receiverId,
        actions: actions.map((t) => {
          if (t.enum !== 'functionCall') {
            return {
              type: capitalizeFirstLetter(t.enum),
              params: t[t.enum as keyof typeof t],
            } as Action
          }
          return {
            type: 'FunctionCall',
            params: {
              methodName: t.functionCall.methodName,
              args: JSON.parse(decodeUint8Array(t.functionCall.args)),
              gas: t.functionCall.gas.toString(),
              deposit: t.functionCall.deposit.toString(),
            },
          }
        }),
      }
    })
  }
}

export const fetchNearAccountIds = async (
  networkType: NetworkType,
  publicKey: string
) => {
  try {
    const pk = publicKey.startsWith('ed25519:')
      ? publicKey
      : `ed25519:${publicKey}`
    const network = NETWORKS[networkType]
    const results = await fetcher(
      `${NearWallet.API}/api/${chain}/accountIds?pk=${pk}&network=${networkType}`
    )
    if (!results.length) {
      const backupResults = await fetcher(
        `${network.kitwalletIndexer}/publicKey/${pk}/accounts`
      )
      return backupResults
    }
    return results
  } catch (error) {
    return []
  }
}

const getNearAccountId = async (
  networkType: NetworkType,
  publicKey: string,
  all = false
) => {
  const addr = buf2hex(PublicKey.fromString(publicKey).data)
  try {
    const accountIds = await fetchNearAccountIds(networkType, publicKey)
    if (accountIds.length === 0) {
      return all ? [addr] : addr
    } else {
      return all ? accountIds : accountIds[0]
    }
  } catch (error) {
    return all ? [addr] : addr
  }
}

const createWallet = async (
  contractCreateAccountUrl: string,
  accountId: string,
  publicKey: string
) => {
  try {
    await post(`${contractCreateAccountUrl}/account`, {
      newAccountId: accountId,
      newAccountPublicKey: publicKey,
    })
  } catch (error) {
    throw error
  }
}

const getAccessKey = (permission: AddKeyPermission) => {
  if (permission === 'FullAccess') {
    return transactions.fullAccessKey()
  }

  const { receiverId, methodNames = [] } = permission
  const allowance = permission.allowance
    ? new BN(permission.allowance)
    : new BN(parseNearAmount('0.25')!)

  return transactions.functionCallAccessKey(receiverId, methodNames, allowance)
}

export const createAction = (action: Action) => {
  switch (action.type) {
    case 'CreateAccount':
      return transactions.createAccount()
    case 'DeployContract': {
      const { code } = action.params

      return transactions.deployContract(code)
    }
    case 'FunctionCall': {
      const { methodName, args, gas, deposit } = action.params

      return transactions.functionCall(
        methodName,
        args,
        new BN(gas),
        new BN(deposit)
      )
    }
    case 'Transfer': {
      const { deposit } = action.params

      return transactions.transfer(new BN(deposit))
    }
    case 'Stake': {
      const { stake, publicKey } = action.params

      return transactions.stake(new BN(stake), utils.PublicKey.from(publicKey))
    }
    case 'AddKey': {
      const { publicKey, accessKey } = action.params

      return transactions.addKey(
        utils.PublicKey.from(publicKey),
        // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
        getAccessKey(accessKey.permission)
      )
    }
    case 'DeleteKey': {
      const { publicKey } = action.params

      return transactions.deleteKey(utils.PublicKey.from(publicKey))
    }
    case 'DeleteAccount': {
      const { beneficiaryId } = action.params

      return transactions.deleteAccount(beneficiaryId)
    }
    default:
      throw new Error('Invalid action type')
  }
}

export const signTransactions = async (
  txs: Array<Transaction>,
  signer: Signer,
  network: BaseNetwork
): Promise<SignedTransaction[]> => {
  const provider = new providers.JsonRpcProvider({
    url: network.nodeUrl,
  })

  const signedTransactions: Array<SignedTransaction> = []

  for (let i = 0; i < txs.length; i++) {
    const publicKey = await signer.getPublicKey(txs[i].signerId, network.type)

    const [block, accessKey] = await Promise.all([
      provider.block({ finality: 'final' }),
      provider.query<AccessKeyView>({
        request_type: 'view_access_key',
        finality: 'final',
        account_id: txs[i].signerId,
        public_key: publicKey.toString(),
      }),
    ])

    const actions = txs[i].actions.map((action) => createAction(action))

    const transaction = transactions.createTransaction(
      txs[i].signerId,
      publicKey,
      txs[i].receiverId,
      accessKey.nonce + i + 1,
      actions,
      utils.serialize.base_decode(block.header.hash)
    )

    const response = await transactions.signTransaction(
      transaction,
      signer,
      txs[i].signerId,
      network.type
    )

    signedTransactions.push(response[1])
  }

  return signedTransactions
}

async function getNFT(
  provider: providers.JsonRpcProvider,
  contractId: string,
  tokenId: string
) {
  const nftMetadataRes = await provider.query<CodeResult>({
    request_type: 'call_function',
    account_id: contractId,
    method_name: 'nft_metadata',
    args_base64: '',
    finality: 'optimistic',
  })
  const collection = JSON.parse(Buffer.from(nftMetadataRes.result).toString())

  const tokenRes = await provider.query<CodeResult>({
    request_type: 'call_function',
    account_id: contractId,
    method_name: 'nft_token',
    args_base64: btoa(
      JSON.stringify({
        token_id: tokenId,
      })
    ),
    finality: 'optimistic',
  })
  const item = JSON.parse(Buffer.from(tokenRes.result).toString())

  return {
    collection,
    item,
  }
}

export function getNFTMedia(
  collection: NFTContractMetadata,
  item: NFTItem,
  accountId?: string
) {
  let uri = ''
  if (item.metadata.media && item.metadata.media.startsWith('http')) {
    uri = item.metadata.media
  } else {
    uri = `${collection.base_uri}/${item.metadata.media}`
  }

  return {
    uri,
    isOwner: [item.owner_account_id, item?.owner_id].includes(accountId),
  }
}
