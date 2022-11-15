import { StackActions } from '@react-navigation/native'
import Box from 'components/common/Box'
import Heading from 'components/common/Heading'
import NumberPad from 'components/common/NumberPad'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import _ from 'lodash'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useAppDispatch } from 'store/hooks'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import Styles from 'theme/Styles'
import { RootStackScreenProps } from 'types'

export default function SetupPINCode({
  navigation,
}: RootStackScreenProps<'SetupPINCode'>) {
  const [pinCode, setPINCode] = useState<number[]>([])
  const [repeatPinCode, setRepeatPINCode] = useState<number[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const dispatch = useAppDispatch()
  const theme = useColorScheme()

  const onConfirmed = async () => {
    setIsConfirmed(true)
    dispatch({
      type: 'setting/setupPINCode',
      payload: pinCode.join(''),
    })
    navigation.dispatch(StackActions.popToTop())
    navigation.navigate('Root', { screen: 'Home' })
  }

  const onInputChange = (n: number) => {
    if (isConfirmed) {
      return
    }
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
        disabled={isConfirmed}
        onInput={onInputChange}
        onDelete={() => {
          if (isConfirming) {
            setRepeatPINCode(_.dropRight(repeatPinCode))
          } else {
            setPINCode(_.dropRight(pinCode))
          }
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
  numberPad: {
    width: '33.3%',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 30,
    fontFamily: Fonts.heading,
    textAlign: 'center',
  },
})
