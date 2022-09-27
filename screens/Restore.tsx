import { StackActions, useRoute } from '@react-navigation/native'
import ScreenHeader from 'components/common/ScreenHeader'
import { View } from 'components/Themed'
import RestoreForm from 'components/Wallet/RestoreForm'
import SetupPIN from 'components/Wallet/SetupPIN'
import { i18n } from 'locale'
import { useState } from 'react'
import { useAppDispatch } from 'store/hooks'
import { Chain, NetworkType, RootStackScreenProps } from 'types'
import useAuth from 'hooks/useAuth'
import ToastMessage from 'components/common/ToastMessage'
import Toast from 'utils/toast'
import WalletAPI from 'chain/WalletAPI'
import ScreenLoading from 'components/common/ScreenLoading'
import { CHAINS } from 'chain/common/constants'
import { Portal } from 'react-native-portalize'

enum RESTORE_STEP {
  RESTORE = 'RESTORE',
  SETUP_PIN = 'SETUP_PIN',
}

export default function Restore({
  navigation,
}: RootStackScreenProps<'Restore'>) {
  const [restoring, setRestoring] = useState(false)
  const [step, setStep] = useState(RESTORE_STEP.RESTORE)
  const [newWallet, setNewWallet] = useState({
    value: '',
    type: 0,
    networkType: NetworkType.MAINNET,
  })

  const { params } = useRoute()

  const isNew = (params as any).new as boolean
  const chain = (params as any).chain as Chain

  const dispatch = useAppDispatch()

  // 0 - mnemonic, 1 - private key
  const onConfirmed = async ({
    value,
    type,
    networkType,
  }: {
    value: string
    type: number
    networkType: NetworkType
  }) => {
    if (restoring) {
      return
    }
    setRestoring(true)
    try {
      if (type === 0) {
        if (chain) {
          const wallet = await WalletAPI.createWalletFromMnemonic(
            chain,
            value,
            { networkType }
          )
          dispatch({
            type: 'wallet/add',
            payload: wallet,
          })
        } else {
          const nWallet = await WalletAPI.createWalletFromMnemonic(
            Chain.NEAR,
            value,
            { networkType }
          )
          dispatch({
            type: 'wallet/add',
            payload: nWallet,
          })

          const chains = CHAINS.filter((t) => !t.default).map((t) => t.chain)
          chains.forEach((chain) => {
            WalletAPI.createWalletFromMnemonic(chain, value, {
              networkType,
            })
              .then((oWallet) => {
                dispatch({
                  type: 'wallet/justAdd',
                  payload: oWallet,
                })
              })
              .catch(Toast.error)
          })
        }
      } else {
        if (!isNew) {
          const wallet = await WalletAPI.createWalletFromPrivateKey(
            chain,
            value,
            {
              networkType,
            }
          )
          dispatch({
            type: 'wallet/add',
            payload: wallet,
          })
        }
      }

      setRestoring(false)
      navigation.dispatch(StackActions.popToTop())

      setTimeout(() => {
        Toast.success(i18n.t('Wallet restored successfully'))
      }, 1000)
    } catch (error) {
      setRestoring(false)
      Toast.error(error)
    }
  }

  const auth = useAuth()

  console.log('restoring', restoring)

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Start" />
      <ToastMessage />

      {step === RESTORE_STEP.RESTORE && (
        <RestoreForm
          chain={chain}
          onNext={({ value, type, networkType }) => {
            setNewWallet({ value, type, networkType })
            auth(
              () => {
                onConfirmed({
                  value,
                  type,
                  networkType,
                })
              },
              () => {
                setStep(RESTORE_STEP.SETUP_PIN)
              }
            )
          }}
          isNew={isNew}
          restoring={restoring}
        />
      )}

      {step === RESTORE_STEP.SETUP_PIN && (
        <SetupPIN
          onNext={() => {
            onConfirmed(newWallet)
          }}
          type="restore"
        />
      )}
      <Portal>
        <ScreenLoading visible={restoring} title="Restoring" />
      </Portal>
    </View>
  )
}
