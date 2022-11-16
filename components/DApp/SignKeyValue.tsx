import { StyleSheet, TextStyle } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'
import Box from 'components/common/Box'
import { isBN } from 'bn.js'

export default function SignKeyValue({
  title,
  value,
  titleStyle = {},
  valueStyle = {},
}: {
  title: string
  value: string | string[] | Record<string, string | string[]>
  titleStyle?: TextStyle
  valueStyle?: TextStyle
}) {
  const theme = useColorScheme()
  if (value === '' || value === null || value === undefined) {
    return null
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <View>
        <Text style={[styles.key, titleStyle]}>{title}</Text>
        <View style={styles.embed}>
          {Object.keys(value).map((key) => {
            return <SignKeyValue key={key} title={key} value={value[key]} />
          })}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.item}>
      <Text style={[styles.key, titleStyle]}>{title}</Text>
      {Array.isArray(value) ? (
        isBN(value) ? (
          <Box direction="column" align="flex-start">
            <Text
              style={[
                styles.value,
                { color: Colors[theme].link, fontSize: 18 },
                valueStyle,
              ]}
            >
              {value.toString()}
            </Text>
          </Box>
        ) : (
          <Box direction="column" align="flex-start">
            {value.map((t, idx) => {
              if (['string', 'boolean'].includes(typeof t)) {
                return (
                  <Text
                    key={`${t}${idx}`}
                    style={[
                      styles.value,
                      { color: Colors[theme].link, fontSize: 18 },
                      valueStyle,
                    ]}
                  >
                    {typeof t === 'boolean' ? `${t ? 'true' : 'false'}` : t}
                  </Text>
                )
              }
              return <SignKeyValue key={idx} title="" value={t} />
            })}
          </Box>
        )
      ) : (
        <Text
          style={[
            styles.value,
            { color: Colors[theme].link, fontSize: 18 },
            valueStyle,
          ]}
        >
          {typeof value === 'boolean' ? `${value ? 'true' : 'false'}` : value}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  key: {
    fontSize: 16,
  },
  value: {
    fontFamily: Fonts.variable,
    color: Colors.link,
    lineHeight: 24,
    fontSize: 16,
  },
  embed: {
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray9,
    paddingLeft: 10,
    marginTop: 0,
  },
})
