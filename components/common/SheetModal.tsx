import { Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'
import SheetHeader from './SheetHeader'
import Radio from './Radio'
import { i18n } from 'locale'

export default function SheetModal({
  title,
  items,
  active,
  onSelect,
  onClose,
  isI18n,
}: {
  title: string
  items: string[]
  active: string
  onSelect: (item: string, idx: number | undefined) => void
  onClose: () => void
  isI18n?: boolean
}) {
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()

  return (
    <View
      style={[
        styles.content,
        {
          paddingBottom: insets.bottom + 20,
          backgroundColor: Colors[theme].screenBackground,
        },
      ]}
    >
      <SheetHeader title={title} />
      <View style={styles.buttonGroup}>
        {items.map((item: string, idx: number) => {
          const isActive = item === active
          return (
            <Pressable
              key={item}
              style={[
                styles.itemWrap,
                {
                  backgroundColor: Colors[theme].cardBackground,
                },
              ]}
              onPress={() => onSelect(item, idx)}
            >
              <View style={styles.itemRow}>
                <Radio checked={isActive} />
                <Text style={[styles.itemText, { color: Colors[theme].link }]}>
                  {isI18n ? i18n.t(item) : item}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonGroup: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  itemWrap: {
    width: '100%',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  itemRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemText: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    marginLeft: 10,
  },
})
