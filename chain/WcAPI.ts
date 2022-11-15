import SignClient from '@walletconnect/sign-client'
import { PairingTypes, ProposalTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { i18n } from 'locale'
import {
  Chain,
  NetworkType,
  Wallet,
  WC_STATUS,
  WC_STATUS_CHANGE_EVENT,
} from 'types'
import Toast from 'utils/toast'
import * as PubSub from 'pubsub-js'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { Transaction } from 'near-api-js/lib/transaction'
import BaseWallet from './BaseWallet'
import NearWallet from './NearWallet'

interface BaseEventArgs {
  id: number
  topic: string
}

export default class WcAPI {
  static signClient: SignClient | null
  static pairing: PairingTypes.Struct | null
  static walletApi: BaseWallet | undefined
  static accounts: { accountId: string; publicKey: string }[] = []

  static async init(uri: string, walletApi: BaseWallet | undefined) {
    const client = await SignClient.init({
      projectId: '89bb6ff449d3f5ae2d3d6f6b8ae37f86',
    })

    client.on('session_proposal', WcAPI.onSessionProposal)
    client.on('session_delete', WcAPI.onSessionDelete)
    client.on('session_request', WcAPI.onSessionRequest)
    client.on('session_ping', (data) => console.log('ping', data))
    client.on('session_event', (data) => console.log('event', data))
    client.on('session_update', (data) => console.log('update', data))

    WcAPI.walletApi = walletApi
    WcAPI.signClient = client
    client
      .pair({ uri })
      .then((struct) => {
        console.log('paired', struct)
      })
      .catch(console.error)
  }

  static onSessionProposal(event: {
    id: number
    params: ProposalTypes.Struct
  }) {
    console.log('###onSessionProposal')

    if (
      WcAPI.signClient?.pairing.values.some(
        (t) => t.topic === event.params.pairingTopic
      )
    ) {
      PubSub.publish(WC_STATUS_CHANGE_EVENT, {
        type: WC_STATUS.PAIRED,
        payload: event.params,
      })
    }
  }

  static onSessionRequest({
    id,
    topic,
    params,
  }: {
    id: number
    topic: string
    params: {
      request: { method: string; params: any }
      chainId: string
    }
  }) {
    const { chainId, request } = params
    const { params: _params } = request

    if (
      ['near_signTransaction', 'near_signTransactions'].includes(request.method)
    ) {
      const [chainType, networkType] = chainId.split(':')
      const session = WcAPI.signClient?.session.get(topic)
      const address = session?.namespaces.near.accounts[0].split(':')[2]

      if (chainType.toUpperCase() !== Chain.NEAR) {
        return Toast.error(i18n.t('Chain not match'))
      }
      if (!address) {
        return Toast.error(i18n.t('Account not found'))
      }

      PubSub.publish(WC_STATUS_CHANGE_EVENT, {
        type: WC_STATUS.REQUEST,
        payload: {
          id,
          topic,
          wallet: {
            address,
            network: networkType as NetworkType,
          },
          method: request.method,
          txs: NearWallet.transformRawTransactions(
            WcAPI.walletApi?.wallet!,
            request.method === 'near_signTransaction'
              ? [Transaction.decode(Buffer.from(_params.transaction))]
              : _params.transactions.map((t: Record<string, any>) => {
                  if (t.type === 'Buffer') {
                    return Transaction.decode(Buffer.from(t.data))
                  }
                  return Transaction.decode(Buffer.from(Object.values(t)))
                })
          ),
        },
      })
    } else if (request.method === 'near_signOut') {
      WcAPI.signClient?.respond({
        topic,
        response: formatJsonRpcResult(id, true),
      })
      WcAPI.disconnect()
      Toast.success('Sign out success')
    } else if (request.method === 'near_signIn') {
      Toast.success('Sign in success')
      WcAPI.accounts = request.params.accounts

      WcAPI.walletApi
        ?.signAndSendTransaction({
          receiverId: WcAPI.accounts[0].accountId,
          actions: [
            {
              type: 'AddKey',
              params: {
                publicKey: WcAPI.accounts[0].publicKey,
                accessKey: {
                  nonce: 0,
                  permission: request.params.permission,
                },
              },
            },
          ],
        })
        .then((e) => {
          console.log('e', e)

          WcAPI.signClient?.respond({
            topic,
            response: formatJsonRpcResult(id, true),
          })
        })
        .catch((e) => {
          Toast.error(e)
        })
    } else if (request.method === 'near_getAccounts') {
      WcAPI.signClient?.respond({
        topic,
        response: formatJsonRpcResult(id, [
          {
            accountId: WcAPI.walletApi?.wallet.address,
            publicKey: WcAPI.walletApi?.wallet.publicKey,
          },
        ]),
      })
    } else if (request.method === 'near_verifyOwner') {
      const [, networkType] = chainId.split(':')
      const session = WcAPI.signClient?.session.get(topic)
      const address = session?.namespaces.near.accounts[0].split(':')[2]
      PubSub.publish(WC_STATUS_CHANGE_EVENT, {
        type: WC_STATUS.REQUEST,
        payload: {
          id,
          topic,
          wallet: {
            address,
            network: networkType as NetworkType,
          },
          method: request.method,
          txs: [],
          verifyOwner: _params,
        },
      })
      // this.walletApi?.verifyMessage(_params)
    }
  }

  static onSessionEvent({ id, topic }: BaseEventArgs) {
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
    console.log('onSessionEvent', id, topic)
  }

  static onSessionUpdate({ topic, id }: BaseEventArgs) {
    // React to session update
    console.log('onSessionUpdate', id, topic)
  }

  static onSessionDelete({ id, topic }: BaseEventArgs) {
    console.log('onSessionDelete', { id, topic })
    PubSub.publish(WC_STATUS_CHANGE_EVENT, { type: WC_STATUS.DISCONNECTED })
    WcAPI.signClient?.disconnect({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    })
    WcAPI.destory()
  }

  static onPairingDelete({ id, topic }: BaseEventArgs) {
    console.log('onPairingDelete', id, topic)
  }

  static async connect(w: Wallet, proposal: ProposalTypes.Struct) {
    if (!WcAPI.signClient) {
      throw new Error(i18n.t('Session not established yet'))
    }
    PubSub.publish(WC_STATUS_CHANGE_EVENT, {
      type: WC_STATUS.CONNECTING,
    })
    const { events, methods, chains } = proposal.requiredNamespaces.near

    const { acknowledged, topic } = await WcAPI.signClient.approve({
      id: proposal.id,
      namespaces: {
        near: {
          accounts: [`${chains[0]}:${w.address}`],
          events,
          methods,
        },
      },
    })
    console.log('acknowledged', topic)

    // await acknowledged()

    PubSub.publish(WC_STATUS_CHANGE_EVENT, {
      type: WC_STATUS.CONNECTED,
    })
  }

  static async reject(proposal: ProposalTypes.Struct) {
    if (!WcAPI.signClient) {
      throw new Error(i18n.t('Session not established yet'))
    }
    await WcAPI.signClient.reject({
      id: proposal.id,
      reason: getSdkError('USER_REJECTED'),
    })
    WcAPI.destory()
    PubSub.publish(WC_STATUS_CHANGE_EVENT, {
      type: WC_STATUS.REJECTED,
    })
  }

  static async approveRequest({
    id,
    topic,
    result,
  }: BaseEventArgs & { result: any }) {
    await WcAPI.signClient?.respond({
      topic,
      response: formatJsonRpcResult(id, result),
    })
  }

  static async rejectRequest({ id, topic }: BaseEventArgs) {
    WcAPI.signClient?.respond({
      topic,
      response: formatJsonRpcError(
        id,
        getSdkError('USER_REJECTED_METHODS').message
      ),
    })
  }

  static async disconnect() {
    if (!WcAPI.signClient) {
      throw new Error(i18n.t('Session not established yet'))
    }

    WcAPI.signClient.session.values.map(async (t) => {
      return await WcAPI.signClient?.disconnect({
        topic: t.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      })
    })

    WcAPI.destory()
    PubSub.publish(WC_STATUS_CHANGE_EVENT, { type: WC_STATUS.DISCONNECTED })
  }

  static destory() {
    WcAPI.signClient = null
    WcAPI.walletApi = undefined
  }
}
