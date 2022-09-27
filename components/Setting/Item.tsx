import { i18n } from 'locale'
import { NavArrowRight } from 'iconoir-react-native'
import { ReactElement } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'

export function ConfigItem({
  title,
  icon,
  value,
  onPress,
  noBorder = false,
  noChevron = false,
}: {
  title: string
  value?: any
  icon?: ReactElement
  onPress: () => void
  noBorder?: boolean
  noChevron?: boolean
}) {
  const theme = useColorScheme()
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View
        style={[
          styles.rowWrap,
          {
            borderBottomWidth: !noBorder ? 0.5 : 0,
            borderBottomColor: Colors[theme].borderColor,
          },
        ]}
      >
        <View style={styles.row}>
          <View>{icon}</View>
          <Text style={styles.key}>{i18n.t(title)}</Text>
        </View>

        <View style={styles.row}>
          {typeof value === 'string' ? (
            <Text style={[styles.value, { color: Colors[theme].link }]}>
              {value}
            </Text>
          ) : (
            value
          )}

          {!noChevron && <NavArrowRight color="#999" width={24} height={24} />}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  key: {
    fontSize: 18,
    marginLeft: 10,
  },
  value: {
    fontSize: 18,
    color: Colors.link,
    fontFamily: Fonts.variable,
  },
})
