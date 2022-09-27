import { useRoute } from '@react-navigation/native'
import { i18n } from 'locale'
import { Account, Contract } from 'near-api-js'
import { formatNearAmount, parseNearAmount } from 'near-api-js/lib/utils/format'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import Button from 'components/common/Button'
import InfoItem from 'components/common/InfoItem'
import ScreenHeader from 'components/common/ScreenHeader'
import { View, Text } from 'components/Themed'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useNear } from 'hooks/useClient'
import { useAppSelector } from 'store/hooks'
import { ButtonType, RootStackScreenProps, StakePool, Token } from 'types'
import {
  NEAR_DECIMALS,
  NEAR_SYMBOL,
  stakingMethods,
  STAKING_GAS_BASE,
} from 'chain/near/constants'
import { formatBalance } from 'utils/format'
import Fonts from 'theme/Fonts'
import Toast from 'utils/toast'
import AnimatedInput from 'components/common/AnimatedInput'
import useAuth from 'hooks/useAuth'
import WalletAPI from 'chain/WalletAPI'
import { BN } from 'bn.js'
import { isValidAmount } from 'chain/common'

export default function Validator({
  navigation,
}: RootStackScreenProps<'Validator'>) {
  const { params } = useRoute()
  const validatorId = (params as any)?.address as string
  const myPools = (params as any)?.myPools as StakePool[]
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const theme = useColorScheme()

  const wallet = useAppSelector((state) => state.wallet.current)
  const nearToken = useAppSelector((state) =>
    state.asset.token.find((t: Token) => {
      return t.isNative
    })
  )

  const near = useNear()

  useEffect(() => {
    async function fetchValidator() {
      if (near) {
        try {
          const account = new Account(near?.connection, wallet?.address ?? '')
          const contract = new Contract(account, validatorId, stakingMethods)
          const fee = await (contract as any).get_reward_fee_fraction()
          setFee(+((fee.numerator / fee.denominator) * 100).toFixed(2))
        } catch (error) {
          console.log(error)
        }
      }
    }
    fetchValidator()
  }, [wallet, validatorId, near])

  const isDeposited = myPools.find((t) => t.validator_id === validatorId)

  const auth = useAuth()

  const onWithdraw = async () => {
    try {
      setWithdrawing(true)
      await WalletAPI.signAndSendTransaction({
        wallet: wallet!,
        receiverId: validatorId,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'unstake',
              args: {
                amount: parseNearAmount(amount),
              },
              gas: new BN(STAKING_GAS_BASE).mul(new BN(5)).toString(),
              deposit: '0',
            },
          },
        ],
      })
      setWithdrawing(false)
      Toast.success(i18n.t('Withdraw successfully'))
      navigation.goBack()
    } catch (error) {
      setWithdrawing(false)
      Toast.error(error)
    }
  }

  const onDeposit = async () => {
    try {
      setDepositing(true)
      await WalletAPI.signAndSendTransaction({
        wallet: wallet!,
        receiverId: validatorId,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'deposit_and_stake',
              args: {},
              gas: new BN(STAKING_GAS_BASE).mul(new BN(5)).toString(),
              deposit: parseNearAmount(amount)!,
            },
          },
        ],
      })
      setDepositing(false)
      Toast.success(i18n.t('Deposit successfully'))
      navigation.goBack()
    } catch (error) {
      setDepositing(false)
      Toast.error(error)
    }
  }

  const isDisabled = depositing || withdrawing

  return (
    <View style={styles.container}>
      <ScreenHeader title={i18n.t('Validator')} />
      <ScrollView style={styles.content}>
        <InfoItem title={i18n.t('Validator')} value={validatorId} />
        <InfoItem title={i18n.t('Fee')} value={`${fee}%`} />
        {!!isDeposited && (
          <InfoItem
            title={i18n.t('Deposited')}
            value={`${formatNearAmount(isDeposited.deposit!)} ${NEAR_SYMBOL}`}
          />
        )}
        <View style={styles.flexEnd}>
          <Text>
            {`${i18n.t('Balance')}: ${formatBalance(
              nearToken?.balance,
              NEAR_DECIMALS
            )}`}
          </Text>
        </View>
        <View style={[styles.row]}>
          <AnimatedInput
            keyboardType="numeric"
            autoCapitalize="none"
            placeholder={i18n.t('Amount')}
            value={amount}
            style={[styles.input, { color: Colors[theme].text }]}
            onChangeText={(text) => setAmount(text.trim())}
            autoCorrect={false}
            editable={!isDisabled}
          />
        </View>
        <View style={styles.buttonGroup}>
          {!!isDeposited && (
            <Button
              label={i18n.t('Withdraw')}
              filled={false}
              style={{ marginHorizontal: 10 }}
              disabled={isDisabled}
              isLoading={withdrawing}
              onPress={() => {
                if (!isValidAmount(amount)) {
                  throw new Error(i18n.t('Invalid amount'))
                }
                auth(onWithdraw)
              }}
            />
          )}
          <Button
            label={i18n.t('Deposit')}
            type={ButtonType.PRIMARY}
            style={!!isDeposited ? { width: 150, marginHorizontal: 10 } : {}}
            disabled={isDisabled}
            isLoading={depositing}
            onPress={() => {
              if (!isValidAmount(amount)) {
                throw Toast.error(i18n.t('Invalid amount'))
              }
              auth(onDeposit)
            }}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontFamily: Fonts.variable,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 10,
    borderBottomColor: Colors.gray9,
    borderBottomWidth: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  flexEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})
