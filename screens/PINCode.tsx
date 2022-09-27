import { useRoute } from '@react-navigation/native'
import Box from 'components/common/Box'
import NumberPad from 'components/common/NumberPad'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import _ from 'lodash'
import { useState } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { Portal } from 'react-native-portalize'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import Styles from 'theme/Styles'
import { RootStackScreenProps } from 'types'

export default function PINCode({
  navigation,
}: RootStackScreenProps<'PINCode'>) {
  const _pincode = useAppSelector((state) => state.setting.pincode)
  const [pinCode, setPINCode] = useState<number[]>([])
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()

  const { params } = useRoute()
  const onConfirmed = (params as any)?.onConfirmed as () => void

  const onInputChange = (n: number) => {
    if (pinCode.length < 6) {
      const _code = [...pinCode, n]
      setPINCode(_code)
      if (_pincode === _code.join('')) {
        setTimeout(() => {
          navigation.goBack()
          onConfirmed && onConfirmed()
        }, 50)
      }
    }
  }

  const screen = (
    <View style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <SheetHeader
        title={i18n.t('Confirm PIN Code')}
        style={{ paddingTop: Platform.OS === 'android' ? insets.top : 10 }}
      />
      <View style={[Styles.page, Styles.center]}>
        <Box justify="space-around" full style={{ paddingHorizontal: 30 }}>
          {[0, 1, 2, 3, 4, 5].map((_, i) => {
            const isActive = i < pinCode.length
            return (
              <View
                key={i}
                style={[
                  styles.pin,
                  {
                    borderColor: Colors[theme].text,
                  },
                  isActive && { backgroundColor: Colors[theme].text },
                ]}
              />
            )
          })}
        </Box>

        <Text style={styles.match}>
          {pinCode.length === 6 && _pincode !== pinCode.join('')
            ? i18n.t('PIN code does not match')
            : ''}
        </Text>
      </View>

      <NumberPad
        onInput={onInputChange}
        onDelete={() => {
          setPINCode(_.dropRight(pinCode))
        }}
      />
    </View>
  )
  if (Platform.OS === 'android') {
    return <Portal>{screen}</Portal>
  }
  return screen
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
  },
  input: {
    color: 'transparent',
  },
  tip: {
    fontSize: 16,
    textAlign: 'center',
  },
  pin: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 12,
  },
  match: {
    color: Colors.red,
    fontSize: 14,
    marginTop: 30,
  },
})
