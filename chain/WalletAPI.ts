import * as SecureStore from 'expo-secure-store'
import * as bip39 from 'bip39'
import { sha256 } from 'js-sha256'
import {
  NEAR_NETWORKS,
  FT_TRANSFER_DEPOSIT,
  FT_TRANSFER_GAS,
} from 'chain/near/constants'
import { initNear } from 'hooks/useClient'
import {
  Chain,
  SecureKeyStore,
  NetworkType,
  Wallet,
  TxPreview,
  NearLogin,
  PUB,
  AppChainType,
} from 'types'
import * as PubSub from 'pubsub-js'
import { parseAmount } from 'utils/format'
import { i18n } from 'locale'
import { buf2hex, createWallet, parseNearMnemonic } from './near/utils'
import { KeyPair, PublicKey } from 'near-api-js/lib/utils'
import { cryptoIsReady } from '@polkadot/util-crypto'
import type { Action, Transaction } from '@near-wallet-selector/core'
import { providers, Signer } from 'near-api-js'
import type { FinalExecutionOutcome } from 'near-api-js/lib/providers'
import { signTransactions } from './near/signTx'
import { CodeResult } from 'near-api-js/lib/providers/provider'
import { WalletKeyStore } from './near/WalletKeyStore'
import { fetchNearAccountIds } from './near/token'
import { getNetwork } from './common/network'

export default class WalletAPI {
  static async createWalletFromMnemonic(
    chain: Chain,
    mnemonic: string,
    params: {
      accountId?: string
      networkType: NetworkType
    } = {
      networkType: NetworkType.MAINNET,
    }
  ) {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error(i18n.t('Invalid mnemonic'))
    }

    let nWallet: Wallet | undefined
    let privateKey = ''
    let { accountId, networkType } = params
    if (chain === Chain.NEAR) {
      const { secretKey, publicKey } = await parseNearMnemonic(mnemonic)
      if (!publicKey || !secretKey) {
        throw new Error(i18n.t(`Invalid mnemonic`))
      }
      const _network = NEAR_NETWORKS[networkType]
      if (!accountId) {
        const accountIds = await fetchNearAccountIds(networkType, publicKey)

        if (accountIds.length === 0) {
          accountId = buf2hex(PublicKey.fromString(publicKey).data)
        } else {
          accountId = accountIds[0]
        }
      } else if (networkType === NetworkType.TESTNET) {
        await createWallet(_network, accountId, publicKey)
      } else if (networkType === NetworkType.MAINNET) {
        await createWallet(_network, accountId, publicKey)
      }
      if (!accountId) {
        throw new Error('Invalid AccountId')
      }

      nWallet = {
        chain,
        address: accountId,
        networkType,
        publicKey,
      }
      privateKey = secretKey
    } else if (chain === Chain.OCT) {
      if (!cryptoIsReady()) {
        return
      }
      const initPolkaProvider = require('./polkadot/initPolkaProvider').default
      const api = await initPolkaProvider()
      const Keyring = require('@polkadot/api').Keyring
      const keyring = new Keyring({ type: 'sr25519' })
      const newPair = keyring.addFromUri(mnemonic)
      nWallet = {
        chain,
        networkType,
        address: newPair.address,
        publicKey: newPair.publicKey.toString(),
        appchainId: AppChainType.ATOCHA,
      }
      await api.disconnect()
    }

    if (!nWallet) {
      throw new Error('Invalid mnemonic')
    }
    const _keyStore = await this.exportWallet(nWallet)
    if (_keyStore) {
      return nWallet
    }

    const keyStore: SecureKeyStore = {
      ...nWallet,
      privateKey,
      mnemonic,
    }
    await this.createWallet(keyStore)

    return nWallet
  }

  static async createWalletFromPrivateKey(
    chain: Chain,
    privateKey: string,
    params: {
      accountId?: string
      networkType: NetworkType
    } = {
      networkType: NetworkType.MAINNET,
    }
  ) {
    let nWallet: Wallet | undefined
    const { networkType } = params
    if (chain === Chain.NEAR) {
      const keyPair = KeyPair.fromString(privateKey)
      const publicKey = keyPair.getPublicKey().toString()

      const accountIds = await fetchNearAccountIds(networkType, publicKey)

      let accountId
      if (accountIds.length === 0) {
        accountId = buf2hex(PublicKey.fromString(publicKey).data)
      } else {
        accountId = accountIds[0]
      }
      nWallet = {
        chain: Chain.NEAR,
        address: accountId,
        networkType,
        publicKey,
      }
    } else if (chain === Chain.OCT) {
      if (!cryptoIsReady()) {
        return
      }
      const initPolkaProvider = require('./polkadot/initPolkaProvider').default
      const api = await initPolkaProvider()
      const Keyring = require('@polkadot/api').Keyring
      const keyring = new Keyring({ type: 'sr25519' })
      const newPair = keyring.addFromUri(privateKey)
      nWallet = {
        chain: Chain.OCT,
        networkType,
        address: newPair.address,
        publicKey: newPair.publicKey.toString(),
        appchainId: AppChainType.ATOCHA,
      }
      await api.disconnect()
    }

    if (!nWallet) {
      throw new Error(i18n.t('Invalid private key'))
    }

    const _keyStore = await this.exportWallet(nWallet)
    if (_keyStore) {
      return nWallet
    }

    const keyStore: SecureKeyStore = {
      ...nWallet,
      privateKey,
    }
    await this.createWallet(keyStore)

    return nWallet
  }

  static async createWallet(keyStore: SecureKeyStore) {
    await SecureStore.setItemAsync(keyStore.address, JSON.stringify(keyStore))
  }

  static async deleteWallet(wallet: Wallet) {
    await SecureStore.deleteItemAsync(wallet.address)
  }

  static async transfer({ from, to, amount, token }: TxPreview) {
    const _amount = parseAmount(amount, token)
    const network = getNetwork(from)
    if (!network) {
      throw new Error('Network not found')
    }

    if (from.chain === Chain.OCT) {
      if (!cryptoIsReady()) {
        return
      }
      const initPolkaProvider = require('./polkadot/initPolkaProvider').default
      const api = await initPolkaProvider(network.nodeUrl)

      const keyStore = await this.exportWallet(from)
      if (!keyStore) {
        throw new Error('KeyStore not found')
      }

      const Keyring = require('@polkadot/api').Keyring
      const keyring = new Keyring({ type: 'sr25519' })
      const pair = keyring.addFromUri(keyStore.mnemonic!)
      await api.tx.balances.transfer(to, _amount).signAndSend(pair)
    } else if (from.chain === Chain.NEAR) {
      if (token.isNative) {
        await WalletAPI.signAndSendTransaction({
          wallet: from,
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
        const account = await this.getNearAccount(from, false)
        const contractId = token.contractId!
        const storageBalance = await account.viewFunction(
          contractId,
          'storage_balance_of',
          { account_id: to }
        )

        const transferActions: Action[] = []
        if (!storageBalance || storageBalance?.total === '0') {
          const provider = new providers.JsonRpcProvider({
            url: network.nodeUrl,
          })
          const res = await provider.query<CodeResult>({
            request_type: 'call_function',
            account_id: contractId,
            method_name: 'storage_balance_bounds',
            args_base64: '',
            finality: 'optimistic',
          })
          const bounds = JSON.parse(Buffer.from(res.result).toString())
          transferActions.push({
            type: 'FunctionCall',
            params: {
              methodName: 'storage_deposit',
              args: {
                registration_only: true,
                account_id: to,
              },
              gas: FT_TRANSFER_GAS,
              deposit: bounds.min,
            },
          })
        }
        transferActions.push({
          type: 'FunctionCall',
          params: {
            methodName: 'ft_transfer',
            args: {
              amount: _amount,
              receiver_id: to,
            },
            gas: FT_TRANSFER_GAS,
            deposit: FT_TRANSFER_DEPOSIT,
          },
        })

        await WalletAPI.signAndSendTransaction({
          wallet: from,
          receiverId: contractId,
          actions: transferActions,
        })
      }
    }

    PubSub.publish(PUB.REFRESH_TOKENLIST)
  }

  static async connect(w: Wallet, login: NearLogin) {
    if (w.chain !== Chain.NEAR) {
      throw new Error('Please switch to a NEAR wallet')
    } else if (w.isLedger) {
      return `ed25519:${w.publicKey}`
    }

    return w.publicKey
  }

  static getSigner(): Signer {
    return {
      createKey: (accountId: string, networkId?: string) => {
        throw new Error('Not implemented')
      },
      getPublicKey: async (address: string, networdId?: string) => {
        const _keyStore = await WalletAPI.exportWallet({ address })
        if (!_keyStore) {
          throw new Error(i18n.t('Wallet not found'))
        }
        return PublicKey.fromString(_keyStore.publicKey)
      },
      signMessage: async (
        message: Uint8Array,
        address: string,
        networkId?: string
      ) => {
        const hash = new Uint8Array(sha256.array(message))
        const _keyStore = await WalletAPI.exportWallet({ address })
        if (!_keyStore) {
          throw new Error(i18n.t('Wallet not found'))
        }
        const _keyPair = KeyPair.fromString(_keyStore.privateKey)
        const signature = _keyPair.sign(hash)
        return signature
      },
    }
  }

  static async signAndSendTransaction({
    wallet,
    receiverId,
    actions,
  }: {
    wallet: Wallet
    receiverId: string
    actions: Action[]
  }) {
    return WalletAPI.signAndSendTransactions({
      wallet,
      transactions: [
        {
          signerId: wallet.address,
          receiverId,
          actions,
        },
      ],
    })
  }

  static async signAndSendTransactions({
    wallet,
    transactions,
  }: {
    wallet: Wallet
    transactions: Transaction[]
  }) {
    let signer = null
    if (wallet.isLedger) {
      throw new Error('Not implemented')
    } else {
      signer = WalletAPI.getSigner()
    }
    const network = getNetwork(wallet)
    if (!network) {
      throw new Error('Network not found')
    }

    const signedTransactions = await signTransactions(
      transactions,
      signer,
      network
    )

    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })
    const results: Array<FinalExecutionOutcome> = []

    for (let i = 0; i < signedTransactions.length; i++) {
      results.push(await provider.sendTransaction(signedTransactions[i]))
    }

    return results.map((t) => {
      return t.transaction.hash
    })
  }

  static async getNearAccount(w: Wallet, isThrow: boolean = true) {
    const _keyStore = await this.exportWallet(w)
    if (!_keyStore && isThrow) {
      throw new Error(i18n.t('Wallet not found'))
    }
    const keyStore = new WalletKeyStore(_keyStore)
    const network = getNetwork(w)
    if (!network) {
      throw new Error('Network not found')
    }
    const near = await initNear(network, keyStore)
    const account = await near.account(w.address)
    return account
  }

  static async exportWallet(wallet: Pick<Wallet, 'address'>) {
    const keyStoreStr = await SecureStore.getItemAsync(wallet.address)

    if (keyStoreStr) {
      return JSON.parse(keyStoreStr)
    }
    return null
  }

  static async isWalletExisted(address: string) {
    const result = await SecureStore.getItemAsync(address)
    return result !== null
  }
}
