import Box from 'components/common/Box'
import Button from 'components/common/Button'
import Heading from 'components/common/Heading'
import InfoItem from 'components/common/InfoItem'
import SheetHeader from 'components/common/SheetHeader'
import { View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
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
          style={{ paddingHorizontal: 10 }}
        >
          <InfoItem title="From" value={txPreview?.from.address} />
          <InfoItem title="To" value={txPreview?.to} />
          <InfoItem title="Amount" value={txPreview?.amount} />
        </Box>

        <Box justify="space-between" gap="medium" style={{ marginTop: 30 }}>
          <Button
            filled={false}
            label={i18n.t('Cancel')}
            onPress={onCancel}
            disabled={isConfirming}
          />
          <Button
            filled={false}
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
})
