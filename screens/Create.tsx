import { StackActions, useRoute } from '@react-navigation/native'
import ScreenHeader from 'components/common/ScreenHeader'
import { View } from 'components/Themed'
import GenMnemonic from 'components/Wallet/GenMnemonic'
import VerifyMnemonic from 'components/Wallet/VerifyMnemonic'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import useAuth from 'hooks/useAuth'
import SetupAccountId from 'components/Wallet/SetupAccountId'
import { Chain, NetworkType, NewWalletSetup, RootStackScreenProps } from 'types'
import Toast from 'utils/toast'
import { i18n } from 'locale'
import ToastMessage from 'components/common/ToastMessage'
import FundAccount from 'components/Wallet/FundAccount'
import ScreenLoading from 'components/common/ScreenLoading'
import WalletFactory from 'chain/WalletFactory'
import { Alert } from 'react-native'

enum CREATE_STEP {
  SETUP_ACCOUNTID = 'SETUP_ACCOUNTID',
  GEN_MNEMONIC = 'GEN_MNEMONIC',
  VERIFY_MNEMONIC = 'VERIFY_MNEMONIC',
  FUNDING_ACCOUNT = 'FUNDING_ACCOUNT',
}

export default function Create({ navigation }: RootStackScreenProps<'Create'>) {
  const [newWallet, setNewWallet] = useState<NewWalletSetup>({
    mnemonic: '',
    accountId: '',
    networkType: NetworkType.MAINNET,
  })
  const [creating, setCreating] = useState(false)

  const { params } = useRoute()
  const isNew = (params as any).new as boolean
  const chain = ((params as any).chain as Chain) || Chain.NEAR
  const steps = [CREATE_STEP.GEN_MNEMONIC, CREATE_STEP.VERIFY_MNEMONIC]

  const isCreateNearWallet = isNew || chain === Chain.NEAR
  if (isCreateNearWallet) {
    steps.splice(0, 0, CREATE_STEP.SETUP_ACCOUNTID)
  }
  const [step, setStep] = useState(
    isCreateNearWallet ? CREATE_STEP.SETUP_ACCOUNTID : CREATE_STEP.GEN_MNEMONIC
  )

  const dispatch = useAppDispatch()
  const { pincode } = useAppSelector((state) => state.setting)

  const isCreateNearMainnetAccountId =
    newWallet.networkType === NetworkType.MAINNET &&
    chain === Chain.NEAR &&
    newWallet.accountId

  const onConfirmed = async () => {
    const { networkType, accountId, mnemonic } = newWallet
    if (creating) {
      return
    }
    try {
      setCreating(true)
      const nWallet = await WalletFactory.createWalletFromMnemonic(chain, {
        networkType,
        accountId,
        mnemonic,
      })
      dispatch({
        type: 'wallet/add',
        payload: nWallet,
      })
      
      setCreating(false)
      if (pincode) {
        navigation.dispatch(StackActions.popToTop())
        setTimeout(() => {
          Toast.success(i18n.t('Wallet created successfully'))
        }, 1000)
      } else {
        navigation.navigate('SetupPINCode')
      }
    } catch (error) {
      setCreating(false)
      Toast.error(error)
    }
  }

  const onBack = () => {
    if (isCreateNearMainnetAccountId && step === CREATE_STEP.FUNDING_ACCOUNT) {
      Alert.alert(
        i18n.t('Warning'),
        i18n.t(
          "Your NEAR account hasn't been created yet, are you sure to go back?"
        ),
        [
          {
            text: i18n.t('Cancel'),
            onPress: () => {},
          },
          {
            text: i18n.t('Confirm'),
            onPress: async () => navigation.goBack(),
          },
        ],
        {
          cancelable: true,
        }
      )
    } else {
      navigation.goBack()
    }
  }

  const auth = useAuth()

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Start" onBack={onBack} />
      {step === CREATE_STEP.SETUP_ACCOUNTID && (
        <SetupAccountId
          onNext={({
            accountId,
            networkType,
          }: Pick<NewWalletSetup, 'accountId' | 'networkType'>) => {
            setStep(CREATE_STEP.GEN_MNEMONIC)
            setNewWallet({
              ...newWallet,
              accountId,
              networkType,
            })
          }}
        />
      )}
      {step === CREATE_STEP.GEN_MNEMONIC && (
        <GenMnemonic
          steps={steps}
          stepIndex={steps.indexOf(step) + 1}
          onNext={(mnemonic) => {
            setStep(CREATE_STEP.VERIFY_MNEMONIC)
            setNewWallet({
              ...newWallet,
              mnemonic,
            })
          }}
        />
      )}
      {step === CREATE_STEP.VERIFY_MNEMONIC && (
        <VerifyMnemonic
          steps={steps}
          stepIndex={steps.indexOf(step) + 1}
          onNext={() => {
            if (isCreateNearMainnetAccountId) {
              setStep(CREATE_STEP.FUNDING_ACCOUNT)
            } else {
              auth(onConfirmed)
            }
          }}
          onBack={() => setStep(CREATE_STEP.GEN_MNEMONIC)}
          mnemonic={newWallet.mnemonic}
          creating={creating}
        />
      )}
      {step === CREATE_STEP.FUNDING_ACCOUNT && (
        <FundAccount newWallet={newWallet} onConfirm={onConfirmed} />
      )}
      <ToastMessage />
      <ScreenLoading visible={creating} title="Creating" />
    </View>
  )
}
