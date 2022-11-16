import { StyleSheet, TouchableOpacity } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { ButtonType } from 'types'
import Fonts from 'theme/Fonts'
import { Text } from 'components/Themed'
import { Circle } from 'react-native-animated-spinkit'

export default function Button({
  label,
  onPress,
  style,
  textColor,
  filled = true,
  size = 'large',
  icon = null,
  type = ButtonType.DEFAULT,
  disabled = false,
  primary = false,
  isLoading = false,
}: {
  label: string
  onPress: () => void
  textColor?: string
  filled?: boolean
  size?: 'small' | 'medium' | 'large'
  style?: any
  icon?: any
  type?: ButtonType
  disabled?: boolean
  primary?: boolean
  isLoading?: boolean
}) {
  const theme = useColorScheme()
  const bstyles = {
    wrap: {
      default: {
        borderColor: Colors[theme].borderColor,
      },
      primary: {
        backgroundColor: theme === 'dark' ? Colors.yellow : '#333',
        borderColor: theme === 'dark' ? Colors.yellow : '#333',
      },
      danger: {
        backgroundColor: '#FF4040',
        borderColor: '#FF4040',
      },
    },
    text: {
      default: textColor || Colors[theme].text,
      primary: textColor || (theme === 'dark' ? Colors.black : Colors.white),
      danger: textColor || Colors.white,
    },
  }
  return (
    <TouchableOpacity
      style={[
        styles.button,
        bstyles.wrap[primary ? ButtonType.PRIMARY : type],
        { opacity: disabled || isLoading ? 0.7 : 1 },
        styles[size],
        { width: filled ? '100%' : 160 },
        style,
      ]}
      onPress={() => {
        if (!isLoading && !disabled) {
          onPress()
        }
      }}
      disabled={disabled || isLoading}
      activeOpacity={0.9}
    >
      {isLoading && (
        <Circle
          size={styles[`${size}Text`].fontSize}
          style={{ marginRight: 10 }}
        />
      )}
      {icon}
      <Text
        style={[
          styles.buttonText,
          {
            color: bstyles.text[primary ? ButtonType.PRIMARY : type],
            marginLeft: icon ? 8 : 0,
          },
          styles[`${size}Text`],
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderColor: '#333',
    borderWidth: 2,
    borderRadius: 4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {},
  buttonText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    fontFamily: Fonts.heading,
  },
  buttonTextPrimary: {
    color: 'white',
  },
  small: {
    paddingVertical: 4,
  },
  medium: {
    paddingVertical: 8,
  },
  large: {
    paddingVertical: 12,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
})
