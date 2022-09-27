import { Text, View } from '../Themed'
import Box from '../common/Box'
import Button from '../common/Button'
import { i18n } from 'locale'
import Heading from 'components/common/Heading'
import Styles from 'theme/Styles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useState } from 'react'

export default function ConfirmModal({
  title,
  icon,
  iconWrapColor,
  content = null,
  subtitle,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  isLoading = false,
}: {
  title: string
  icon: any
  content?: any
  iconWrapColor: string
  subtitle: string
  onCancel: () => void
  onConfirm: () => void
  cancelLabel?: string
  confirmLabel?: string
  isLoading?: boolean
}) {
  const [isConfirming, setIsConfirming] = useState(false)
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
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
      <Box direction="column" gap="medium" pad="medium">
        <Heading level={2}>{i18n.t(title)}</Heading>
        {!!icon && (
          <View
            style={[
              Styles.center,
              styles.iconWrap,
              {
                backgroundColor: iconWrapColor,
              },
            ]}
          >
            {icon}
          </View>
        )}
        {!!subtitle && <Text style={styles.subtitle}>{i18n.t(subtitle)}</Text>}
        {content}
        <Box justify="space-between" gap="medium" style={{ marginTop: 30 }}>
          <Button
            filled={false}
            label={i18n.t(cancelLabel)}
            onPress={onCancel}
            disabled={isLoading || isConfirming}
          />
          <Button
            filled={false}
            label={i18n.t(confirmLabel)}
            isLoading={isLoading || isConfirming}
            onPress={async () => {
              setIsConfirming(true)
              await onConfirm()
              setIsConfirming(false)
            }}
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
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 320,
    opacity: 0.7,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
})
