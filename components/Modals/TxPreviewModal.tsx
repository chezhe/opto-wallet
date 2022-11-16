import Box from 'components/common/Box'
import Button from 'components/common/Button'
import Heading from 'components/common/Heading'
import InfoItem from 'components/common/InfoItem'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import useWallet from 'hooks/useWallet'
import { i18n } from 'locale'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { TxPreview } from 'types'

export default function TxPreviewModal({
  isConfirming,
  txPreview,
  onCancel,
  onConfirm,
}: {
  isConfirming: boolean
  txPreview: TxPreview | undefined
  onCancel: () => void
  onConfirm: () => void
}) {
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
  const { wallet } = useWallet()

  if (!txPreview) {
    return null
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: Colors[theme].modalBackground,
        },
      ]}
    >
      <SheetHeader title={i18n.t('Transfer Preview')} />
      <Box direction="column" gap="medium" pad="large">
        <Box
          direction="column"
          align="flex-start"
          full
          style={{
            ...styles.infoWrap,
            borderColor: Colors[theme].borderColor,
          }}
        >
          <InfoItem title="From" value={txPreview?.from.address} />
          <InfoItem title="To" value={txPreview?.to} />
          <InfoItem
            title="Amount"
            value={`${txPreview?.amount} ${txPreview?.token.symbol}`}
          />
        </Box>

        {wallet?.isLedger && isConfirming && (
          <Text style={styles.ledgerTip}>
            {i18n.t('Please confirm on your Ledger device')}
          </Text>
        )}

        <Box justify="space-between" gap="medium" style={{ marginTop: 10 }}>
          {!isConfirming && (
            <Button
              filled={false}
              label={i18n.t('Cancel')}
              onPress={onCancel}
              disabled={isConfirming}
            />
          )}
          <Button
            filled={isConfirming}
            label={i18n.t('Confirm')}
            onPress={onConfirm}
            disabled={isConfirming}
            isLoading={isConfirming}
            primary
          />
        </Box>
      </Box>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  ledgerTip: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    color: Colors.red,
    marginTop: 8,
  },
  infoWrap: {
    paddingHorizontal: 10,
    borderWidth: 2,
    padding: 10,
    width: '100%',
  },
})
