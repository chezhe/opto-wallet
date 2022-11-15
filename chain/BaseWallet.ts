import * as SecureStore from 'expo-secure-store'
import WebView from 'react-native-webview'
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes'
import {
  BaseTx,
  Chain,
  DApp,
  BaseNetwork,
  SecureKeyStore,
  Token,
  Wallet,
  ChainMeta,
  MarketSection,
  BasePreviewSignParams,
  CombineNetworkType,
  NFTsByCollection,
} from 'types'

export default abstract class BaseWallet {
  wallet: Wallet
  static API = 'https://opto-api.deno.dev'
  API = BaseWallet.API
  static meta: ChainMeta

  constructor(w: Wallet) {
    this.wallet = w
  }

  static async createWallet(keyStore: SecureKeyStore) {
    await SecureStore.setItemAsync(keyStore.address, JSON.stringify(keyStore))
  }

  async exportWallet() {
    return await BaseWallet.exportWalletBy(this.wallet)
  }

  static async exportWalletBy(w: Pick<Wallet, 'address'>) {
    const keyStoreStr = await SecureStore.getItemAsync(w.address)

    if (!keyStoreStr) {
      throw new Error('Wallet not found')
    }
    return JSON.parse(keyStoreStr)
  }

  static async existWallet(w: Pick<Wallet, 'address'>): Promise<boolean> {
    try {
      await BaseWallet.exportWalletBy(w)
      return true
    } catch (error) {
      return false
    }
  }

  static async deleteWallet(w: Pick<Wallet, 'address'>): Promise<void> {
    await SecureStore.deleteItemAsync(w.address)
  }

  formattedAddress(): string {
    const addr = this.wallet.address
    const tail = addr.length - 4
    return addr.substring(0, 8) + '...' + addr.substring(tail)
  }

  static formatAddress(addr: string): string {
    throw new Error('Not implemented')
  }

  abstract isValidAddress(
    addr: string,
    networkType: CombineNetworkType
  ): Promise<boolean>

  abstract getTokenList(localTokens: Token[]): Promise<{
    address: string
    networkType: CombineNetworkType
    tokens: Token[]
    nativeToken: {
      balance: string
      price: number
      chain: Chain
      networkType?: CombineNetworkType
    }
  }>

  abstract getNFTList(): Promise<NFTsByCollection[]>

  abstract getTokenTxList(t: Token): Promise<BaseTx[][]>

  abstract transfer({
    to,
    amount,
    token,
  }: {
    to: string
    amount: string
    token: Token
  }): Promise<string>

  static createWalletFromMnemonic(params: {
    mnemonic: string
    [key: string]: any
  }): Promise<Wallet> {
    throw new Error('Not implemented')
  }

  static createWalletFromPrivateKey(params: {
    privateKey: string
    [key: string]: any
  }): Promise<Wallet> {
    throw new Error('Not implemented')
  }

  filterWalletToken(t: Token) {
    const w = this.wallet
    if (!w || !t) {
      return false
    }

    if (w.chain === t.chain) {
      return !!(
        t.isNative ||
        (t.networkType === w.networkType && t.address === w.address)
      )
    }

    return false
  }

  signTransaction(tx: any, pk?: string): Promise<any> {
    throw new Error('Not implemented')
  }

  signTransactions(txs: any): Promise<any[]> {
    throw new Error('Not implemented')
  }

  signMessage(msg: string): Promise<any> {
    throw new Error('Not implemented')
  }

  verifyMessage(msg: string): Promise<any> {
    throw new Error('Not implemented')
  }

  async isExist(): Promise<boolean> {
    throw new Error('Not implemented')
  }

  abstract signAndSendTransaction(tx: any): Promise<string>

  abstract signAndSendTransactions(txs: any): Promise<string[]>

  static isLedgerSupported = () => false

  static isWCSupported = () => false

  abstract isWCSupported(): boolean

  abstract getDAppList(): Promise<DApp[]>

  getHotSearchDApps(): Promise<DApp[]> {
    return Promise.resolve([])
  }

  abstract searchDApps(keyword: string): Promise<DApp[]>

  abstract getNetworks(): BaseNetwork[]

  abstract getNetwork(): BaseNetwork

  abstract isDefaultNetwork(type: string): boolean

  abstract createAccount(params: { [key: string]: any }): Promise<string>

  abstract getMarket(): Promise<MarketSection[]>

  abstract getStaking(): Promise<MarketSection[]>

  abstract injectedDAppScript(): string

  abstract onDAppMessage(e: WebViewMessageEvent, webview: WebView): void

  abstract onConnectDApp(webview: WebView, params: any): Promise<void>

  abstract onRejectDApp(webview: WebView): Promise<void>

  abstract onDisconnectDApp(webview: WebView): Promise<void>

  abstract onSignDApp(webview: WebView, payload: any): Promise<void>

  abstract formatPreviewSignParams(params: any): BasePreviewSignParams[]
}
