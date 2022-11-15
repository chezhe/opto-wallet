import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ImageSourcePropType } from 'react-native'
import { Notification } from 'expo-notifications'
import type { Transaction } from '@near-wallet-selector/core'
import { SuiMoveObject } from '@mysten/sui.js'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined
  TokenDetail: { token: Token }
  DAppView: { project?: Project; url?: string }
  Transfer: { receiver?: string; token?: Token }
  NotFound: undefined
  Notification: { noti?: iNotification }
  SearchDAppResult: { keyword: string }
  SearchDApp: undefined
  Scanner: { fromPage: string }
  WalletsManage: undefined
  WalletDetail: { wallet: Wallet }
  About: undefined
  Security: undefined
  NewContact: { contact?: Contact }
  PINCode: { onConfirmed: () => void }
  ContactsManage: undefined
  Start: { new?: boolean; chain?: Chain }
  Create: { new?: boolean; chain?: Chain }
  Restore: { new?: boolean; chain?: Chain }
  WalletExport: { wallet: Wallet }
  ChangePINCode: undefined
  Finance: undefined
  ConnectLedger: { chain: Chain }
  LedgerDevice: undefined
  Networks: undefined
  ChainNetworks: { chain?: Chain }
  NewNetwork: { network?: CustomNetwork; chain: Chain }
  NFTDetail: { nft: NFTItem; metadata: NFTContractMetadata }
  AuthorizedApps: undefined
  SetupPINCode: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>

export type RootTabParamList = {
  Home: undefined
  Finance: undefined
  Explore: undefined
  Settings: undefined
}

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >

export type NearPrice = {
  cny: number
  eur: number
  last_updated_at: number
  usd: number
}

export enum AppChainType {
  ATOCHA = 'atocha',
  DEBIO = 'debionetwork',
  FUSOTAO = 'fusotao',
  MYRIAD = 'myriad',
  DISCOVOL = 'discovol',
}

export type Token = {
  name: string
  symbol: string
  price: number
  balance: string
  icon: ImageSourcePropType | string
  decimals: number
  isNative?: boolean
  contractId?: string
  address?: string
  chain: Chain
  networkType: CombineNetworkType
  moveObjects?: SuiMoveObject[]
}

export type NFT = {
  base_uri: string
  icon: string
  name: string
  reference: string
  reference_hash: string
  symbol: string
  items: any[]
  id: string
}

type URL = string
export type AccountId = string

export type Project = {
  dapp: URL
  logo: URL
  title: string
  oneliner?: string
  website: URL
}

export interface DApp {
  authorId: string
  dapp: URL
  logo: URL
  title: string
  oneliner: string
  website: URL
}

export type TxPreview = {
  from: Wallet
  to: string
  amount: string
  token: Token
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export enum LOGIN_ACCESS_TYPES {
  FULL_ACCESS = 'fullAccess',
  LIMITED_ACCESS = 'limitedAccess',
}

export type NearLogin = {
  loginAccessType: LOGIN_ACCESS_TYPES
  failureUrl?: string
  successUrl?: string
  contractId?: string
  invalidContractId?: string
  publicKey?: string
}

export type NearSign = {
  transactions?: string
  meta?: string
  callbackUrl?: string
}

export type NearLinkDrop = {
  fundingContract: string
  fundingKey: string
}

export enum PUB {
  REFRESH_TOKENLIST = 'REFRESH_TOKENLIST',
  TOAST_MESSAGE = 'TOAST_MESSAGE',
  TOAST_HIDE = 'TOAST_HIDE',
  ON_DAPP_CONNECT = 'ON_DAPP_CONNECT',
  ON_DAPP_DISCONNECT = 'ON_DAPP_DISCONNECT',
  ON_DAPP_SIGN = 'ON_DAPP_SIGN',
}

export enum WC_STATUS {
  UNKNOWN = 'UNKNOWN',
  INITING = 'INITING',
  PAIRED = 'PAIRED',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  REJECTED = 'REJECTED',
  REQUEST = 'REQUEST',
  CONNECTING = 'CONNECTING',
  TXING = 'TXING',
}

export enum LEDGER_STATUS {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

export const LEDGER_STATUS_CHANGE_EVENT = 'LEDGER_STATUS_CHANGE_EVENT'
export const WC_STATUS_CHANGE_EVENT = 'WC_STATUS_CHANGE_EVENT'

export enum NetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export type CombineNetworkType = NetworkType | AppChainType

export enum ButtonType {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  DANGER = 'danger',
}

export enum NearAccountIdSuffix {
  MAINNET = '.near',
  TESTNET = '.testnet',
}

export type iNotification = {
  noti: Notification
  isRead: boolean
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  CNY = 'CNY',
  JPY = 'JPY',
}

export type CurrencyRate = {
  [key in Currency]?: number
}

export interface ToastPayload {
  type: ToastType
  message: string
  duration: number
}

export enum Chain {
  NEAR = 'NEAR',
  OCT = 'OCT',
}

export enum WalletSource {
  MNEMONIC = 'MNEMONIC',
  PRIVATE_KEY = 'PRIVATE_KEY',
}

export interface Wallet {
  address: string
  chain: Chain
  alias?: string
  networkType: CombineNetworkType
  publicKey: string
  isLedger?: boolean
  customNetworkName?: string
  avatar?: string
}

export interface CustomNetwork {
  name: string
  nodeUrl: string
  type: NetworkType
  chain: Chain
  [key: string]: any
}

export interface Contact {
  address: string
  chain: Chain
  alias: string
  networkType: CombineNetworkType
  avatar?: string
}

export interface SecureKeyStore {
  privateKey?: string
  publicKey: string
  chain: Chain
  networkType: CombineNetworkType
  mnemonic?: string
  address: string
}

export interface NewWalletSetup {
  mnemonic: string
  accountId: string
  networkType: NetworkType
}

export interface AppChain {}

export interface OctTx {
  amount: string
  extrinsicId: string
  fromId: string
  id: string
  timestamp: string
  toId: string
}

export interface AppChainNode {
  id: AppChainType
  icon: ImageSourcePropType
  name: string
  rpc: {
    mainnet?: string
    testnet?: string
  }
}

export interface CreateAccount {
  accountId: string
  publicKey: string
  action?: string
}

export interface WCEventPayload {
  type: WC_STATUS
  payload: any
}

export interface WCRequestParams {
  chainId: string
  request: {
    method: 'near_signAndSendTransaction' | 'near_signAndSendTransactions'
    params: {
      transactions: Transaction[]
    }
  }
}

export interface WCRequest {
  id: number
  topic: string
  wallet: Wallet
  method: string
  txs: Transaction[]
  verifyOwner?: { accountId: string; message: string }
}

export interface SettingItem {
  icon: any
  title: string
  value?: any
  noChevron?: boolean
  onPress: () => void
}

export interface LedgerDevice {
  id: string
  isConnectable: boolean
  localName: string
  manufacturerData: any
  name: string
  mtu: number
  overflowServiceUUIDs: any
  rssi: number
  serviceData: any
  serviceUUIDs: string[]
  solicitedServiceUUIDs: any
  txPowerLevel: any
}

export interface EditorChoiceDapp {
  title: string
  oneliner: string
  logo: string
  website: string
  banner: string
}

export interface ChainDapps {
  edited: EditorChoiceDapp[]
  catalogues: {
    title: string
    subtitle: string
    items: Project[]
  }[]
}

type NumberStr = string

export interface BaseNetwork {
  name: string
  nodeUrl: string
  type: CombineNetworkType
  [key: string]: string | number
}

export interface MarketItem extends Project {
  subtitle: string
  url: string
}

export interface MarketSection {
  title: string
  items: MarketItem[]
}

export enum TxType {
  IN = 'IN',
  OUT = 'OUT',
  ADD_KEY = 'ADD_KEY',
  DELETE_KEY = 'DELETE_KEY',
  STAKE = 'STAKE',
  FUNCTION_CALL = 'FUNCTION_CALL',
  DEPLOY_CONTRACT = 'DEPLOY_CONTRACT',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  NFT = 'NFT',
  UNKNOWN = 'UNKNOWN',
}

export interface BaseTx {
  type: TxType
  title: string
  subtitle: string
  hash: string
  time: string | number
  link: string
  failed?: boolean
  nft?: {
    contractId: string
    tokenId: string
  }
}

export interface ChainMeta {
  icon: ImageSourcePropType
  chain: Chain
  defaultNetworks: {
    [key in CombineNetworkType]?: BaseNetwork
  }
  defaultNetworkType: CombineNetworkType
  sources: WalletSource[]
  default?: boolean
  nativeTokens: Token[]
}

export interface BasePreviewSignParams {
  [key: string]: any
}

export interface NFTItem {
  token_id: string
  owner_account_id: string
  owner_id?: string
  metadata: {
    title: string
    description: string
    media: string
    media_hash: string
    copies: number
    extra: string
    reference: string
    reference_hash: string
  }
}

export interface NFTContractMetadata {
  spec: string
  name: string
  symbol: string
  icon: string
  base_uri: string
  reference: string
  reference_hash: string
  contract_account_id: string
}

export interface NFTsByCollection {
  nfts: NFTItem[]
  contract_metadata: NFTContractMetadata
  block_timestamp_nanos: string
  block_height: string
}
