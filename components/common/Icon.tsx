import { TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'

export default function Icon({
  backgroundColor,
  onPress,
  isTransparent = false,
  icon = null,
  style = {},
}: {
  backgroundColor?: string
  onPress?: () => void
  isTransparent?: boolean
  icon?: any
  style?: any
}) {
  const theme = useColorScheme()

  if (!onPress) {
    return icon
  }
  return (
    <Pressable
      style={[
        styles.button,
        !isTransparent && {
          backgroundColor: backgroundColor || Colors[theme].link,
        },
        {
          marginHorizontal: isTransparent ? 0 : 10,
        },
        style,
      ]}
      onPress={onPress}
    >
      {icon}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
