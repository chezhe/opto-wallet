import { StackActions, useRoute } from '@react-navigation/native'
import ScreenHeader from 'components/common/ScreenHeader'
import { View } from 'components/Themed'
import RestoreForm from 'components/Wallet/RestoreForm'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { Chain, NetworkType, RootStackScreenProps, WalletSource } from 'types'
import useAuth from 'hooks/useAuth'
import ToastMessage from 'components/common/ToastMessage'
import Toast from 'utils/toast'
import ScreenLoading from 'components/common/ScreenLoading'
import { Portal } from 'react-native-portalize'
import WalletFactory from 'chain/WalletFactory'

enum RESTORE_STEP {
  RESTORE = 'RESTORE',
}

export default function Restore({
  navigation,
}: RootStackScreenProps<'Restore'>) {
  const [restoring, setRestoring] = useState(false)
  const [step, setStep] = useState(RESTORE_STEP.RESTORE)
  const { params } = useRoute()

  const isNew = (params as any).new as boolean
  const chain = ((params as any).chain as Chain) || Chain.NEAR

  const dispatch = useAppDispatch()
  const { pincode } = useAppSelector((state) => state.setting)

  const onConfirmed = async ({
    value,
    source,
    networkType,
  }: {
    value: string
    source: WalletSource
    networkType: NetworkType
  }) => {
    if (source === WalletSource.MNEMONIC) {
      const w = await WalletFactory.createWalletFromMnemonic(chain, {
        networkType,
        mnemonic: value,
      })
      dispatch({
        type: 'wallet/add',
        payload: w,
      })
    } else {
      const w = await WalletFactory.createWalletFromPrivateKey(chain, {
        networkType,
        privateKey: value,
      })
      dispatch({
        type: 'wallet/add',
        payload: w,
      })
    }
  }

  const onNext = async ({
    value,
    source,
    networkType,
  }: {
    value: string
    source: WalletSource
    networkType: NetworkType
  }) => {
    if (restoring) {
      return
    }
    setRestoring(true)
    try {
      if (!pincode) {
        await onConfirmed({
          value,
          source,
          networkType,
        })
        setTimeout(() => {
          navigation.navigate('SetupPINCode')
        }, 500)
      } else {
        await onConfirmed({
          value,
          source,
          networkType,
        })
        navigation.dispatch(StackActions.popToTop())
      }
      setRestoring(false)
    } catch (error) {
      setRestoring(false)
      Toast.error(error)
      console.log('Restore error', error)
    }
  }

  const auth = useAuth()

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Start" />
      <ToastMessage />

      {step === RESTORE_STEP.RESTORE && (
        <RestoreForm
          chain={chain}
          onNext={onNext}
          isNew={isNew}
          restoring={restoring}
        />
      )}
      <Portal>
        <ScreenLoading visible={restoring} title="Restoring" />
      </Portal>
    </View>
  )
}
