import { i18n } from 'locale'
import { NavArrowRight } from 'iconoir-react-native'
import { StyleSheet, Pressable } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import Fonts from 'theme/Fonts'
import { View, Text } from 'components/Themed'
import { SettingItem } from 'types'
import Box from 'components/common/Box'

export default function SettingBlock({
  title,
  items,
}: {
  title: string
  items: SettingItem[]
}) {
  const theme = useColorScheme()
  return (
    <View style={{ width: '100%' }}>
      {!!title && <Text style={styles.blockTitle}>{i18n.t(title)}</Text>}

      <View
        style={[
          styles.blockWrap,
          {
            backgroundColor: Colors[theme].cardBackground,
          },
        ]}
      >
        {items.map((item, idx) => {
          const Icon = item.icon
          const noBorder = idx === items.length - 1
          return (
            <Pressable
              key={idx}
              style={[styles.rowWrap]}
              onPress={item.onPress}
            >
              <Icon
                width={25}
                height={25}
                color={Colors[theme].text}
                strokeWidth={1.5}
              />
              <View
                style={[
                  styles.row,
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderBottomWidth: noBorder ? 0 : StyleSheet.hairlineWidth,
                    borderBottomColor: Colors[theme].borderColor,
                    justifyContent: 'space-between',
                    marginLeft: 4,
                  },
                ]}
              >
                <Text style={styles.key}>
                  {i18n.t(item.title, { defaultValue: item.title })}
                </Text>

                <Box direction="row" align="center" justify="center">
                  {typeof item.value === 'string' ? (
                    <Text style={[styles.value, { color: Colors[theme].link }]}>
                      {item.value}
                    </Text>
                  ) : (
                    item.value
                  )}

                  {!item.noChevron && (
                    <NavArrowRight
                      color={Colors.gray9}
                      width={24}
                      height={24}
                    />
                  )}
                </Box>
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  blockWrap: {
    borderRadius: 4,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  blockTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    lineHeight: 30,
    color: Colors.gray9,
    marginBottom: 4,
    marginLeft: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
