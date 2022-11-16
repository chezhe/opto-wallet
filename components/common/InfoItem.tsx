import { StyleSheet, TextStyle } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'
import Box from './Box'

export default function InfoItem({
  title,
  value,
  larger = true,
  titleStyle = {},
  valueStyle = {},
}: {
  title: string
  value: string | string[] | number | number[]
  larger?: boolean
  titleStyle?: TextStyle
  valueStyle?: TextStyle
}) {
  const theme = useColorScheme()
  return (
    <View style={styles.item}>
      <Text
        style={[
          styles.key,
          {
            fontSize: larger ? 18 : 14,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>
      {Array.isArray(value) ? (
        <Box direction="column" align="flex-start">
          {value.map((t, idx) => {
            return (
              <Text
                key={`${t}${idx}`}
                style={[
                  styles.value,
                  { color: Colors[theme].link, fontSize: larger ? 20 : 16 },
                  valueStyle,
                ]}
              >
                {t}
              </Text>
            )
          })}
        </Box>
      ) : (
        <Text
          style={[
            styles.value,
            { color: Colors[theme].link, fontSize: larger ? 20 : 16 },
            valueStyle,
          ]}
        >
          {value}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  key: {
    fontSize: 14,
  },
  value: {
    fontFamily: Fonts.variable,
    color: Colors.link,
    lineHeight: 24,
    fontSize: 16,
  },
})
