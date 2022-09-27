import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { NearAccountIdSuffix, NetworkType } from 'types'

export const PAGE_SIZE = 20

export const NEAR_DECIMALS = 24

export const FT_TRANSFER_GAS = '30000000000000'

export const FT_MINIMUM_STORAGE_BALANCE = parseNearAmount('0.0125')

export const FT_TRANSFER_DEPOSIT = '1'

export const NEAR_SYMBOL = 'Ⓝ'

export const NEAR_DERIVED_PATH = "m/44'/397'/0'"
export const LEDGER_KEY_DERIVATION_PATH = "44'/397'/0'/0'/1'"

export const KEY_PREFIX = 'ed25519:'

export const MNEMONIC_STRENGTH = 128

export const MIN_BALANCE_FOR_GAS = '0.05'
export const MIN_BALANCE_TO_CREATE = parseNearAmount('0.1')!
export const LINKDROP_GAS = '100000000000000'

export const STAKING_GAS_BASE = '25000000000000' // 25 Tgas

export const NEAR_NETWORKS = {
  [NetworkType.TESTNET]: {
    name: NetworkType.TESTNET,
    networkId: NetworkType.TESTNET,
    type: NetworkType.TESTNET,
    nodeUrl: '', // replace with your own node url
    explorerUrl: 'https://explorer.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    indexerUrl: 'https://testnet-api.kitwallet.app',
    contractCreateAccountUrl: 'https://near-contract-helper.onrender.com',
    lookupAccountIdSuffix: 'lockup.m0',
    suffix: NearAccountIdSuffix.TESTNET,
    MIN_BALANCE_FOR_GAS: '0.05',
    MIN_BALANCE_TO_CREATE: '0.1',
    LINKDROP_GAS: '100000000000000',
  },
  [NetworkType.MAINNET]: {
    name: NetworkType.MAINNET,
    networkId: NetworkType.MAINNET,
    type: NetworkType.MAINNET,
    nodeUrl: '', // replace with your own node url
    explorerUrl: 'https://explorer.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    indexerUrl: 'https://api.kitwallet.app',
    contractCreateAccountUrl: 'https://near-contract-helper.onrender.com',
    lookupAccountIdSuffix: 'lockup.near',
    suffix: NearAccountIdSuffix.MAINNET,
    MIN_BALANCE_FOR_GAS: '0.05',
    MIN_BALANCE_TO_CREATE: '0.1',
    LINKDROP_GAS: '100000000000000',
  },
}

export const stakingMethods = {
  viewMethods: [
    'get_account_staked_balance',
    'get_account_unstaked_balance',
    'get_account_total_balance',
    'is_account_unstaked_balance_available',
    'get_total_staked_balance',
    'get_owner_id',
    'get_reward_fee_fraction',
    'get_farms',
    'get_farm',
    'get_active_farms',
    'get_unclaimed_reward',
    'get_pool_summary',
  ],
  changeMethods: [
    'ping',
    'deposit',
    'deposit_and_stake',
    'deposit_to_staking_pool',
    'stake',
    'stake_all',
    'unstake',
    'withdraw',
    'claim',
  ],
}
