import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ImageSourcePropType } from 'react-native'
import { Notification } from 'expo-notifications'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined
  Token: { token: Token }
  Transfer: { receiver?: string; token?: Token }
  NotFound: undefined
  Notification: { noti?: iNotification }
  CategoryDApp: { category: Category }
  SearchDAppResult: { keyword: string }
  SearchDApp: undefined
  Scanner: { fromPage: string }
  WalletsManage: undefined
  WalletDetail: { wallet: Wallet }
  About: undefined
  Validator: { address: string; myPools?: StakePool[] }
  MyStaking: { pools: StakePool[] }
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
  Validators: undefined
  Networks: undefined
  ChainNetworks: { chain?: Chain }
  NewNetwork: { network?: CustomNetwork; chain: Chain }
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>

export type RootTabParamList = {
  Home: undefined
  Finance: undefined
  Setting: undefined
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
  BARNACLE = 'barnacle',
  DEBIO = 'debionetwork',
  DEIP = 'deip',
  FUSOTAO = 'fusotao',
  MYRIAD = 'myriad',
}

export type Token = {
  name: string
  symbol: string
  price: number
  balance: string
  icon: ImageSourcePropType
  decimals: number
  isNative?: boolean
  contractId?: string
  address?: string
  chain: Chain
  appchainId?: AppChainType
  networkType: NetworkType
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
  authorId: string
  categories: string[]
  createdAt: string
  dapp: URL
  github: URL
  logo: URL
  title: string
  oneliner: string
  website: URL
}

export type Category = {
  children: Category[]
  count: number
  indentation: number
  name: string
  url: URL
}

export type TxPreview = {
  from: Wallet
  to: string
  amount: string
  token: Token
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type TxArgs =
  | {
      gas: number
      deposit: string
      args_json: {
        text: string
      }
      args_base64: string
      method_name: string
    }
  | {
      access_key: {
        nonce: number
        permission: {
          permission_kind: string
          permission_details: {
            allowance: string
            receiver_id: AccountId
            method_names: string[]
          }
        }
      }
      public_key: string
    }

export type TxActivity = {
  block_hash: string
  block_timestamp: string
  hash: string
  action_index: number
  signer_id: AccountId
  receiver_id: string
  action_kind: string
  args: TxArgs
}

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

export type StakePool = {
  validator_id: string
  deposit?: string
}

export enum PUB {
  REFRESH_TOKENLIST = 'REFRESH_TOKENLIST',
  TOAST_MESSAGE = 'TOAST_MESSAGE',
  TOAST_HIDE = 'TOAST_HIDE',
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
  networkType: NetworkType
  publicKey: string
  appchainId?: AppChainType
  isLedger?: boolean
  customNetworkName?: string
}

export interface CustomNetwork {
  name: string
  nodeUrl: string
  type: NetworkType
  chain: Chain
}

export interface Contact {
  address: string
  chain: Chain
  alias: string
}

export interface SecureKeyStore {
  privateKey?: string
  publicKey: string
  chain: Chain
  networkType: NetworkType
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

export type NearTx = {
  block_hash: string
  block_timestamp: string
  hash: string
  action_index: number
  signer_id: AccountId
  receiver_id: string
  action_kind: string
  args: TxArgs
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

export interface SettingItem {
  icon: any
  title: string
  value?: any
  noChevron?: boolean
  onPress: () => void
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
  categories: string[]
}

type NumberStr = string

export interface NetworkBase {
  name: string
  nodeUrl: string
  icon?: ImageSourcePropType
  type: NetworkType
}

export interface NearNetwork extends NetworkBase {
  networkId: NetworkType
  helperUrl: string
  contractCreateAccountUrl: string
  lookupAccountIdSuffix: string
  suffix: NearAccountIdSuffix
  MIN_BALANCE_FOR_GAS: string
  MIN_BALANCE_TO_CREATE: string
  LINKDROP_GAS: string
}

export interface MarketItem {
  title: string
  subtitle: string
  url: string
  logo: string
}
