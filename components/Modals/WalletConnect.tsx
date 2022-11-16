import { ProposalTypes, SignClientTypes } from '@walletconnect/types'
import WcAPI from 'chain/WcAPI'
import Box from 'components/common/Box'
import { Text } from 'components/Themed'
import useAuth from 'hooks/useAuth'
import { i18n } from 'locale'
import { VerifiedBadge } from 'iconoir-react-native'
import { useEffect, useRef, useState } from 'react'
import { Image, Pressable } from 'react-native'
import { Fold } from 'react-native-animated-spinkit'
import { Modalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import {
  WCEventPayload,
  WCRequest,
  WC_STATUS,
  WC_STATUS_CHANGE_EVENT,
} from 'types'
import { formatUrlHost } from 'utils/format'
import icons from 'utils/icons'
import Toast from 'utils/toast'
import ConfirmModal from './ConfirmModal'
import useWallet from 'hooks/useWallet'
import { SignedTransaction } from 'near-api-js/lib/transaction'
import SignParamsList from 'components/DApp/SignParamsList'

export default function WalletConnect({
  wcUri,
  onReset,
}: {
  wcUri: string
  onReset: () => void
}) {
  const { wallet, walletApi } = useWallet()
  const [proposal, setProposal] = useState<ProposalTypes.Struct>()
  const [wcRequest, setWcRequest] = useState<WCRequest>()
  const [wcStatus, setWcStatus] = useState(WC_STATUS.UNKNOWN)

  const wcRef = useRef<Modalize>(null)

  const onClose = () => wcRef.current?.close()
  const onOpen = () => wcRef.current?.open()

  const onDisconnect = () => {
    setWcStatus(WC_STATUS.UNKNOWN)
    onReset()
    setProposal(undefined)
    setWcRequest(undefined)
    onClose()
  }

  useEffect(() => {
    if (wcUri && walletApi) {
      setTimeout(() => {
        onOpen()
      }, 100)
      setWcStatus(WC_STATUS.INITING)
      WcAPI.init(wcUri, walletApi)
        .then(() => {})
        .catch((err) => {
          console.error(err)
          Toast.error(err)
        })
      const onWCEvent = (msg: string, { type, payload }: WCEventPayload) => {
        setWcStatus(type)
        switch (type) {
          case WC_STATUS.PAIRED:
            setProposal(payload)
            break
          case WC_STATUS.CONNECTED:
            onClose()
            break
          case WC_STATUS.DISCONNECTED:
            onDisconnect()
            Toast.error(i18n.t('Disconnected from DApp'))
            break
          case WC_STATUS.REQUEST:
            onOpen()
            setWcRequest(payload)
            break
          default:
            break
        }
      }
      const wcEvent = PubSub.subscribe(WC_STATUS_CHANGE_EVENT, onWCEvent)

      return () => {
        wcEvent && PubSub.unsubscribe(wcEvent)
      }
    }
  }, [wcUri, walletApi])

  const auth = useAuth()

  let content = null
  let cancelLabel = 'Cancel'
  let confirmLabel = 'Confirm'
  const isLoading = [
    WC_STATUS.CONNECTING,
    WC_STATUS.UNKNOWN,
    WC_STATUS.INITING,
    WC_STATUS.TXING,
  ].includes(wcStatus)
  if (isLoading) {
    let tip = ''
    if (wcStatus === WC_STATUS.TXING) {
      confirmLabel = 'Confirming'
      tip = wallet?.isLedger
        ? i18n.t('Please confirm on your Ledger device')
        : ''
    } else if (wcStatus === WC_STATUS.UNKNOWN) {
      confirmLabel = 'Pairing'
    } else if (wcStatus === WC_STATUS.INITING) {
      confirmLabel = 'Initing'
    }
    content = (
      <Box
        direction="column"
        pad="large"
        align="center"
        justify="center"
        gap="medium"
      >
        <Fold size={100} color={Colors.gray9} />
        {!!tip && (
          <Text
            style={{
              fontSize: 16,
              fontFamily: Fonts.heading,
              textAlign: 'center',
              color: Colors.red,
            }}
          >
            {tip}
          </Text>
        )}
      </Box>
    )
  } else if (wcStatus === WC_STATUS.PAIRED) {
    content = (
      <Connection metadata={proposal?.proposer.metadata} connected={false} />
    )
    cancelLabel = 'Reject'
    confirmLabel = 'Connect'
  } else if (wcStatus === WC_STATUS.CONNECTED) {
    content = <Connection metadata={proposal?.proposer.metadata} connected />
    confirmLabel = 'Disconnect'
  } else if (wcStatus === WC_STATUS.REQUEST) {
    if (wcRequest?.method === 'near_verifyOwner') {
      content = (
        <SignParamsList previewSignParams={[wcRequest?.verifyOwner || {}]} />
      )
    } else {
      content = <SignParamsList previewSignParams={wcRequest?.txs || []} />
    }
  }

  const onCancel = async () => {
    try {
      if ([WC_STATUS.UNKNOWN, WC_STATUS.INITING].includes(wcStatus)) {
        onReset()
        WcAPI.destory()
      } else if (wcStatus === WC_STATUS.PAIRED) {
        WcAPI.reject(proposal!)
        onReset()
        setWcStatus(WC_STATUS.UNKNOWN)
      } else if (wcStatus === WC_STATUS.REQUEST && wcRequest) {
        setWcStatus(WC_STATUS.CONNECTED)
        await WcAPI.rejectRequest({
          id: wcRequest?.id,
          topic: wcRequest?.topic,
        })
        setWcRequest(undefined)
      }
      onClose()
    } catch (error) {
      Toast.error(error)
    }
  }

  const onConfirm = async () => {
    try {
      if (wcStatus === WC_STATUS.CONNECTED) {
        WcAPI.disconnect()
        onDisconnect()
      } else if (wcStatus === WC_STATUS.PAIRED) {
        WcAPI.connect(wallet!, proposal!)
      } else if (wcStatus === WC_STATUS.REQUEST && wcRequest) {
        setWcStatus(WC_STATUS.TXING)
        auth(async () => {
          try {
            const method = wcRequest.method
            if (method === 'near_verifyOwner') {
              const result = await walletApi?.verifyMessage(
                wcRequest.verifyOwner?.message!
              )
              await WcAPI.approveRequest({
                id: wcRequest.id,
                topic: wcRequest.topic,
                result,
              })
            } else {
              const signedTxs = await walletApi!.signTransactions({
                transactions: wcRequest.txs,
              })
              if (method === 'near_signTransaction') {
                await WcAPI.approveRequest({
                  id: wcRequest.id,
                  topic: wcRequest.topic,
                  result: Array.from(
                    (signedTxs[0] as SignedTransaction).encode()
                  ),
                })
              } else if (method === 'near_signTransactions') {
                await WcAPI.approveRequest({
                  id: wcRequest?.id,
                  topic: wcRequest.topic,
                  result: signedTxs.map((t: SignedTransaction) =>
                    Array.from(t.encode())
                  ),
                })
              } else {
                throw new Error(`Unsupported method, ${method}`)
              }
            }
            setWcRequest(undefined)
            setWcStatus(WC_STATUS.CONNECTED)
            onClose()
            Toast.success(i18n.t('Transaction has been signed'))
          } catch (error) {
            onClose()
            setWcStatus(WC_STATUS.CONNECTED)
            Toast.error(error)
          }
        })
      }
    } catch (error) {
      Toast.error(error)
    }
  }

  return (
    <Box>
      {!!wcUri && (
        <Pressable
          style={{
            marginHorizontal: 10,
          }}
          onPress={() => wcRef.current?.open()}
        >
          <Image
            source={icons.WC}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
          />
        </Pressable>
      )}
      <Portal>
        <Modalize
          ref={wcRef}
          adjustToContentHeight
          closeOnOverlayTap={false}
          withHandle={false}
        >
          <ConfirmModal
            title="WalletConnect"
            icon={null}
            iconWrapColor={Colors.green}
            subtitle=""
            isLoading={isLoading}
            content={content}
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        </Modalize>
      </Portal>
    </Box>
  )
}

function Connection({
  metadata,
  connected,
}: {
  metadata?: SignClientTypes.Metadata
  connected?: boolean
}) {
  if (!metadata) {
    return null
  }
  return (
    <Box direction="column" align="center" gap="medium">
      <Image
        source={
          metadata.icons[0]
            ? {
                uri: metadata.icons[0],
              }
            : icons.WC
        }
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          borderWidth: 1,
        }}
      />
      <Text style={{ width: 200, textAlign: 'center' }}>
        <Text style={{ fontSize: 18, fontFamily: Fonts.heading }}>
          {metadata.name}
        </Text>
        {connected ? '' : ' wants to connect to your wallet'}
      </Text>
      <Box direction="row" gap="small">
        <VerifiedBadge width={24} height={24} color={Colors.link} />
        <Text style={{ color: Colors.link, fontSize: 18 }}>
          {formatUrlHost(metadata.url)}
        </Text>
      </Box>
    </Box>
  )
}
