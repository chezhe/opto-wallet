import { StackActions, useRoute } from '@react-navigation/native'
import ScreenHeader from 'components/common/ScreenHeader'
import { View } from 'components/Themed'
import GenMnemonic from 'components/Wallet/GenMnemonic'
import SetupPIN from 'components/Wallet/SetupPIN'
import VerifyMnemonic from 'components/Wallet/VerifyMnemonic'
import { useState } from 'react'
import { useAppDispatch } from 'store/hooks'
import useAuth from 'hooks/useAuth'
import SetupAccountId from 'components/Wallet/SetupAccountId'
import { Chain, NetworkType, NewWalletSetup, RootStackScreenProps } from 'types'
import Toast from 'utils/toast'
import WalletAPI from 'chain/WalletAPI'
import { i18n } from 'locale'
import ToastMessage from 'components/common/ToastMessage'
import FundAccount from 'components/Wallet/FundAccount'
import ScreenLoading from 'components/common/ScreenLoading'
import { CHAINS } from 'chain/common/constants'

enum CREATE_STEP {
  SETUP_ACCOUNTID = 'SETUP_ACCOUNTID',
  GEN_MNEMONIC = 'GEN_MNEMONIC',
  VERIFY_MNEMONIC = 'VERIFY_MNEMONIC',
  SETUP_PIN = 'SETUP_PIN',
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
  const chain = (params as any).chain as Chain
  const steps = [CREATE_STEP.GEN_MNEMONIC, CREATE_STEP.VERIFY_MNEMONIC]

  const isCreateNearWallet = !isNew && (!chain || chain === Chain.NEAR)
  if (isCreateNearWallet) {
    steps.splice(0, 0, CREATE_STEP.SETUP_ACCOUNTID)
  }
  const [step, setStep] = useState(
    isCreateNearWallet ? CREATE_STEP.SETUP_ACCOUNTID : CREATE_STEP.GEN_MNEMONIC
  )

  const dispatch = useAppDispatch()

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
      if (chain) {
        const wallet = await WalletAPI.createWalletFromMnemonic(
          chain,
          mnemonic,
          {
            networkType,
            accountId,
          }
        )

        dispatch({
          type: 'wallet/add',
          payload: wallet,
        })
      } else {
        const nWallet = await WalletAPI.createWalletFromMnemonic(
          Chain.NEAR,
          mnemonic,
          { networkType, accountId }
        )
        dispatch({
          type: 'wallet/add',
          payload: nWallet,
        })

        const chains = CHAINS.filter((t) => !t.default).map((t) => t.chain)
        chains.forEach((chain) => {
          WalletAPI.createWalletFromMnemonic(chain, mnemonic, {
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
      setCreating(false)
      navigation.dispatch(StackActions.popToTop())
      setTimeout(() => {
        Toast.success(i18n.t('Wallet created successfully'))
      }, 1000)
    } catch (error) {
      setCreating(false)
      Toast.error(error)
    }
  }

  const auth = useAuth()

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Start" />
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
              auth(onConfirmed, () => setStep(CREATE_STEP.SETUP_PIN))
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
      {step === CREATE_STEP.SETUP_PIN && <SetupPIN onNext={onConfirmed} />}
      <ToastMessage />
      <ScreenLoading visible={creating} title="Creating" />
    </View>
  )
}
