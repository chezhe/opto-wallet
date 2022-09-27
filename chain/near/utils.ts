import {
  AddUser,
  Bank,
  CloudUpload,
  KeyAltPlus,
  KeyAltRemove,
  PageFlip,
  QuestionMark,
  ReceiveDollars,
  SendDollars,
} from 'iconoir-react-native'
import { Account, Near } from 'near-api-js'
import type {
  Transaction as RawTransaction,
  Action,
} from 'near-api-js/lib/transaction'
import { NEAR_DERIVED_PATH, NEAR_DECIMALS } from './constants'
import { post } from '../../utils/fetch'
import { decodeUint8Array, formatBalance } from '../../utils/format'
import * as bip39 from 'bip39'
import nacl from 'tweetnacl'
import { derivePath } from 'near-hd-key'
import bs58 from 'bs58'
import {
  LOGIN_ACCESS_TYPES,
  NearLogin,
  NearSign,
  NearNetwork,
  Token,
  TxActivity,
  Wallet,
} from 'types'
import type { Transaction } from '@near-wallet-selector/core'
import { normalizeMnemonic } from 'chain/common'
import URLParse from 'url-parse'
import { BN } from 'bn.js'
import { i18n } from 'locale'

export function buf2hex(buffer: Uint8Array): string {
  return [...buffer].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export const createWallet = async (
  network: NearNetwork,
  accountId: string,
  publicKey: string
) => {
  try {
    await post(`${network.contractCreateAccountUrl}/account`, {
      newAccountId: accountId,
      newAccountPublicKey: publicKey,
    })
  } catch (error) {
    throw error
  }
}

export const accountExists = async (near: Near, accountId: string) => {
  if (!near) {
    return false
  }
  try {
    await (await getAccount(near, accountId)).state()
    return true
  } catch (error) {
    return false
  }
}

export const getAccount = async (near: Near, accountId: string) => {
  try {
    const account = new Account(near.connection, accountId)
    return account
  } catch (error) {
    throw error
  }
}

export const parseNearMnemonic = async (mnemonic: string) => {
  const seed: Buffer = await bip39.mnemonicToSeed(normalizeMnemonic(mnemonic))
  const { key } = derivePath(NEAR_DERIVED_PATH, seed.toString('hex'))
  const keyPair = nacl.sign.keyPair.fromSeed(key)
  const publicKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.publicKey))
  const secretKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.secretKey))
  return { secretKey, publicKey }
}

export const transformTransactions = (
  wallet: Wallet,
  txs: RawTransaction[]
): Transaction[] => {
  return txs.map(({ signerId, receiverId, actions }) => {
    return {
      signerId: signerId || wallet.address,
      receiverId,
      actions: actions.map((t) => {
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

export const calcTransaction = (actions: Action[]) => {
  const gasLimit = actions
    .filter((a) => Object.keys(a)[0] === 'functionCall')
    .map((a) => a.functionCall.gas)
    .reduce((totalGas, gas) => totalGas.add(gas), new BN(0))
    .toString()

  const totalAmount = actions
    .map(
      (a) =>
        (a.transfer && a.transfer.deposit) ||
        (a.functionCall && a.functionCall.deposit) ||
        0
    )
    .reduce((totalAmount, amount) => totalAmount.add(new BN(amount)), new BN(0))
    .toString()

  return {
    gasLimit,
    totalAmount,
  }
}

export const parseAction = (
  item: TxActivity,
  account: string,
  tokens: Token[]
) => {
  let Icon = QuestionMark
  let title = 'Unknown'
  let receiverId = item.receiver_id
  switch (item.action_kind) {
    case 'ADD_KEY':
      Icon = KeyAltPlus
      title = i18n.t('Added key')
      if ((item.args as any).access_key) {
        // receiverId = (item.args as any).access_key?.permission
        //   .permission_details.receiver_id
      }
      break
    case 'DELETE_KEY':
      Icon = KeyAltRemove
      title = i18n.t('Deleted key')
      if ((item.args as any).access_key) {
        // receiverId = (item.args as any).access_key?.permission
        //   .permission_details.receiver_id
      }
      break
    case 'STAKE':
      Icon = Bank
      title = i18n.t('Staked')
      break
    case 'FUNCTION_CALL':
      Icon = PageFlip
      title = `${i18n.t('Called method')} ${(item.args as any).method_name}`
      if (
        item.args &&
        ['ft_transfer', 'ft_transfer_call'].includes(
          (item.args as any).method_name
        )
      ) {
        Icon = item.signer_id === account ? SendDollars : ReceiveDollars
        const token = tokens.find((t) => t.contractId === item.receiver_id)
        if (token) {
          title = `${item.signer_id === account ? '-' : '+'} ${formatBalance(
            (item.args as any).args_json.amount,
            token.decimals
          )} ${token.symbol}`
          receiverId = (item.args as any).args_json.receiver_id
        }
      }
      break
    case 'DEPLOY_CONTRACT':
      Icon = CloudUpload
      title = i18n.t('Deployed contract')
      break
    case 'TRANSFER':
      Icon = item.signer_id === account ? SendDollars : ReceiveDollars
      title = `${item.signer_id === account ? '-' : '+'} ${formatBalance(
        (item.args as any).deposit,
        NEAR_DECIMALS
      )} NEAR`
      receiverId =
        item.signer_id === account ? item.receiver_id : item.signer_id
      break
    case 'CREATE_ACCOUNT':
      Icon = AddUser
      title = i18n.t('Created account')
      break
    default:
      break
  }
  return {
    Icon,
    title,
    receiverId,
  }
}
