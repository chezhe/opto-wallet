import { i18n } from 'locale'
import _ from 'lodash'
import { utils, transactions } from 'near-api-js'
import { Transaction as RawTransaction } from 'near-api-js/lib/transaction'
import { Image, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Transaction } from '@near-wallet-selector/core'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { ButtonType, NearSign, Project } from 'types'
import { NEAR_DECIMALS } from 'chain/near/constants'
import { formatBalance, formatUrlHost } from 'utils/format'
import Fonts from 'theme/Fonts'
import Button from 'components/common/Button'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import TransactionList from '../DApp/TransactionList'
import { calcTransaction, transformTransactions } from 'chain/near/utils'
import { useAppSelector } from 'store/hooks'
import Toast from 'utils/toast'

export default function SignModal({
  project,
  onClose,
  nearSign,
  setCurrentUrl,
  onConfirmSign,
  isSigning,
}: {
  isSigning: boolean
  project?: Project
  onClose: () => void
  nearSign?: NearSign
  setCurrentUrl: (url: string) => void
  onConfirmSign: (txs: Transaction[]) => void
}) {
  const wallet = useAppSelector((state) => state.wallet.current)
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
  let title = project?.title
  if (!title) {
    title = formatUrlHost(nearSign?.callbackUrl)
  }

  const _transactions: RawTransaction[] = []
  if (nearSign?.transactions) {
    nearSign?.transactions
      .split(',')
      .map((str) => Buffer.from(str, 'base64'))
      .forEach((buffer) => {
        _transactions.push(
          utils.serialize.deserialize(
            transactions.SCHEMA,
            transactions.Transaction,
            buffer
          )
        )
      })
  }

  const allActions = _transactions.flatMap((t) => t.actions)
  const { totalAmount, gasLimit } = calcTransaction(allActions)

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 20,
          backgroundColor: Colors[theme].modalBackground,
        },
      ]}
    >
      <SheetHeader title={title} />
      <View style={styles.content}>
        {!!project && (
          <Image source={{ uri: project.logo }} style={styles.projectLogo} />
        )}
        <View style={[styles.accessRow, { flexDirection: 'column' }]}>
          <Text style={styles.description}>
            {`- ${formatBalance(totalAmount, NEAR_DECIMALS)} NEAR`}
          </Text>
        </View>
        <TransactionList transactions={_transactions} />
        <View
          style={[
            styles.accessRow,
            { width: '100%', justifyContent: 'flex-start', paddingLeft: 8 },
          ]}
        >
          <Text style={styles.gasLimit}>
            {`Gas Limit: ${formatBalance(gasLimit, 12, 6)} TGas`}
          </Text>
        </View>
        {wallet?.isLedger && isSigning && (
          <Text style={styles.ledgerTip}>
            {i18n.t('Please confirm on your Ledger device')}
          </Text>
        )}
      </View>
      <View style={styles.buttonGroup}>
        <Button
          label={i18n.t('Cancel')}
          style={{ marginRight: 10 }}
          filled={false}
          disabled={isSigning}
          onPress={() => {
            const url = `${
              nearSign?.callbackUrl
            }?errorCode=userRejected&errorMessage=${encodeURIComponent(
              'User rejected transaction'
            )}&signMeta=${nearSign?.meta}`
            setCurrentUrl(url)
            onClose()
          }}
        />
        <Button
          label={i18n.t('Confirm')}
          type={ButtonType.PRIMARY}
          isLoading={isSigning}
          filled={false}
          onPress={() => {
            const txs = transformTransactions(wallet!, _transactions)
            onConfirmSign(txs)
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonGroup: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 5,
  },
  projectLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  description: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    marginLeft: 8,
    marginBottom: 10,
  },
  gasLimit: {
    fontSize: 14,
    fontFamily: Fonts.variable,
  },
  ledgerTip: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    color: Colors.red,
  },
})
