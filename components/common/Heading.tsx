import { Text } from 'components/Themed'
import { StyleSheet, TextStyle } from 'react-native'
import Fonts from 'theme/Fonts'

export default function Heading({
  children,
  level = 1,
  style = {},
}: {
  children: any
  level?: 1 | 2 | 3 | 4
  style?: TextStyle
}) {
  return <Text style={[styles.h, styles[`h${level}`], style]}>{children}</Text>
}

const styles = StyleSheet.create({
  h: {
    fontFamily: Fonts.heading,
  },
  h1: {
    fontSize: 30,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
  },
  h4: {
    fontSize: 14,
    lineHeight: 18,
  },
})
