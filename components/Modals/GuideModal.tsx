import FastImage from 'react-native-fast-image'
import { i18n } from 'locale'
import { StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import Button from 'components/common/Button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function GuideModal({
  guideFor,
  onClose,
}: {
  guideFor: 'dapp'
  onClose: () => void
}) {
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[
        {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          backgroundColor: Colors[theme].screenBackground,
        },
      ]}
    >
      <SheetHeader title={i18n.t('Guide')} />
      <View style={[styles.content, { paddingBottom: insets.bottom + 10 }]}>
        <FastImage
          source={{ uri: 'https://xoth.deno.dev/compatible.png' }}
          style={{ width: 240, height: 120, marginBottom: 10 }}
        />
        <Text style={styles.text}>
          {i18n.t('To connect Xoth wallet, choose Near Wallet or MyNearWallet')}
        </Text>
        <Button
          label={i18n.t('Got it')}
          primary
          filled={false}
          onPress={onClose}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 4,
    margin: 4,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
})
