import FastImage from 'react-native-fast-image'
import { i18n } from 'locale'
import { Pressable, StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import Button from 'components/common/Button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import icons from 'utils/icons'
import Box from 'components/common/Box'
import Radio from 'components/common/Radio'
import { useState } from 'react'
import { useAppDispatch } from 'store/hooks'

export default function TourModal({
  tourFor,
  onClose,
}: {
  tourFor: 'dapp'
  onClose: () => void
}) {
  const [checked, setChecked] = useState(false)
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const tourDict = {
    dapp: {
      icon: icons.DAPP_CONNECT_GUIDE,
      title: i18n.t(
        'To connect Opto wallet, choose NEAR Wallet or MyNearWallet'
      ),
    },
  }

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
        {tourDict[tourFor]?.icon && (
          <FastImage
            source={tourDict[tourFor].icon}
            style={{ width: 300, height: 240, marginBottom: 10 }}
          />
        )}
        <Text style={styles.text}>{tourDict[tourFor]?.title}</Text>
        <Pressable
          onPress={() => setChecked(!checked)}
          style={{ marginBottom: 20 }}
        >
          <Box direction="row" align="center" gap="small">
            <Radio checked={checked} />
            <Text style={styles.tip}>{i18n.t('Do not show again')}</Text>
          </Box>
        </Pressable>
        <Button
          label={i18n.t('Got it')}
          primary
          filled={false}
          onPress={() => {
            if (checked) {
              dispatch({
                type: 'setting/toured',
                payload: tourFor,
              })
            }
            onClose()
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
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
  tip: {
    fontSize: 16,
  },
})
