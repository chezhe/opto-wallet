import Box from 'components/common/Box'
import Heading from 'components/common/Heading'
import NumberPad from 'components/common/NumberPad'
import ScreenHeader from 'components/common/ScreenHeader'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import _ from 'lodash'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppDispatch } from 'store/hooks'
import Colors from 'theme/Colors'
import Styles from 'theme/Styles'
import { RootStackScreenProps } from 'types'
import Toast from 'utils/toast'

export default function ChangePINCode({
  navigation,
}: RootStackScreenProps<'ChangePINCode'>) {
  const [pinCode, setPINCode] = useState<number[]>([])
  const [repeatPinCode, setRepeatPINCode] = useState<number[]>([])
  const [isConfirming, setIsConfirming] = useState(false)

  const dispatch = useAppDispatch()
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()

  const onConfirmed = async () => {
    dispatch({
      type: 'setting/setupPINCode',
      payload: pinCode.join(''),
    })
    navigation.goBack()
    Toast.success(i18n.t('Updated'))
  }

  const onInputChange = (n: number) => {
    if (!isConfirming) {
      if (pinCode.length < 6) {
        const _code = [...pinCode, n]
        setPINCode(_code)
        if (_code.length === 6) {
          setIsConfirming(true)
        }
      }
    } else {
      if (repeatPinCode.length < 6) {
        const _code = [...repeatPinCode, n]

        setRepeatPINCode(_code)
        if (_code.length === 6 && _code.join('') === pinCode.join('')) {
          onConfirmed()
        }
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={i18n.t('Back')} />
      <View style={[Styles.page, Styles.center]}>
        <Box direction="column">
          <Heading>
            {i18n.t(isConfirming ? 'Confirm PIN Code' : 'New PIN Code')}
          </Heading>
        </Box>

        <Box direction="column" gap="medium" style={{ marginTop: 40 }}>
          <Box justify="space-around" full style={{ paddingHorizontal: 50 }}>
            {_.fill(Array(6), 0).map((_, i) => {
              const isActive =
                i < (isConfirming ? repeatPinCode : pinCode).length
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
            {repeatPinCode.length === 6 &&
            repeatPinCode.join('') !== pinCode.join('')
              ? i18n.t('PIN code does not match')
              : ''}
          </Text>
        </Box>
      </View>
      <NumberPad
        onInput={onInputChange}
        onDelete={() => {
          setPINCode(_.dropRight(pinCode))
        }}
      />
    </View>
  )
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
  },
})
