import { View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { useEffect, useRef, useState } from 'react'
import {
  TextInputProps,
  Animated,
  TextInput,
  StyleSheet,
  Easing,
  Platform,
} from 'react-native'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'

const INIT_Y = Platform.OS === 'android' ? 12 : 4

export default function AnimatedInput(
  props: TextInputProps & { animatedLeft?: number }
) {
  const [focused, setFocused] = useState(false)
  const phPosX = useRef(new Animated.Value(4)).current
  const phPosY = useRef(new Animated.Value(INIT_Y)).current
  const phOpacity = useRef(new Animated.Value(0)).current
  const phScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (focused || !!props.value) {
      Animated.parallel([
        Animated.timing(phPosX, {
          toValue: props.animatedLeft ?? -4,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
        Animated.timing(phPosY, {
          toValue: -22,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
        Animated.timing(phOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
        Animated.timing(phScale, {
          toValue: 1,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
      ]).start()
    } else if (!focused && !props.value) {
      Animated.parallel([
        Animated.timing(phPosX, {
          toValue: 4,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
        Animated.timing(phPosY, {
          toValue: INIT_Y,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
        Animated.timing(phOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
        Animated.timing(phScale, {
          toValue: 0,
          duration: 200,
          easing: Easing.poly(1),
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [props.value, focused])

  const theme = useColorScheme()
  const opacity = phOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  })
  const scale = phScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  })

  return (
    <View style={{ flex: 1 }}>
      <Animated.Text
        style={[
          styles.placeholder,
          {
            transform: [
              {
                translateY: phPosY,
              },
              {
                translateX: phPosX,
              },
              {
                scale,
              },
            ],
            color: Colors[theme].text,
            opacity,
          },
        ]}
      >
        {props.placeholder}
      </Animated.Text>
      <TextInput
        {...props}
        placeholder=""
        style={[props.style, { color: Colors[theme].text }, styles.input]}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus && props.onFocus(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur && props.onBlur(e)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: 18,
    padding: 8,
    flex: 1,
    fontFamily: Fonts.variable,
  },
  placeholder: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    position: 'absolute',
    opacity: 0.7,
    color: Colors.gray9,
  },
})
