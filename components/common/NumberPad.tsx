import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { StyleSheet, TouchableHighlight, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import icons from 'utils/icons'
import Box from './Box'

export default function NumberPad({
  disabled = false,
  onInput,
  onDelete,
}: {
  disabled?: boolean
  onInput: (n: number) => void
  onDelete: () => void
}) {
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
  return (
    <Box
      direction="row"
      align="center"
      justify="center"
      style={{ flexWrap: 'wrap', paddingBottom: insets.bottom }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => {
        return (
          <TouchableHighlight
            key={t}
            style={styles.numberPad}
            onPress={() => onInput(t)}
            underlayColor={Colors[theme].borderColor}
            disabled={disabled}
          >
            <Text style={[styles.number, { opacity: disabled ? 0.7 : 1 }]}>
              {t}
            </Text>
          </TouchableHighlight>
        )
      })}
      <View style={styles.numberPad} />
      <TouchableHighlight
        style={styles.numberPad}
        underlayColor={Colors[theme].borderColor}
        onPress={() => onInput(0)}
        disabled={disabled}
      >
        <Text style={[styles.number, { opacity: disabled ? 0.7 : 1 }]}>
          {'0'}
        </Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.numberPad}
        underlayColor={Colors[theme].borderColor}
        onPress={onDelete}
        disabled={disabled}
      >
        <Image source={icons.BACKSPACE} style={styles.backspace} />
      </TouchableHighlight>
    </Box>
  )
}

const styles = StyleSheet.create({
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
  backspace: {
    width: 30,
    height: 30,
  },
})
