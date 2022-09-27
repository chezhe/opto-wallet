import dayjs from 'dayjs'
import { StyleSheet, Pressable } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { AccountId, NearTx, Token } from 'types'
import { ellipsis } from 'utils/format'
import { Text, View } from 'components/Themed'
import Fonts from 'theme/Fonts'
import { parseAction } from 'chain/near/utils'

export default function NearTxItem({
  item,
  onOpen,
  address,
  tokens,
}: {
  item: NearTx
  onOpen: (item: NearTx) => void
  address?: AccountId
  tokens: Token[]
}) {
  const { Icon, title, receiverId } = parseAction(item, address || '', tokens)
  const theme = useColorScheme()
  return (
    <Pressable onPress={() => onOpen(item)}>
      <View
        style={[styles.item, { backgroundColor: Colors[theme].cardBackground }]}
      >
        <View style={{ width: 24, height: 24, alignItems: 'center' }}>
          <Icon color={Colors.gray9} width={24} height={24} />
        </View>
        <View style={styles.detail}>
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.receiverId}>{receiverId}</Text>
            <View style={styles.row}>
              <Text style={[styles.actionDesc, { color: Colors[theme].link }]}>
                {ellipsis(item.hash, 16)}
              </Text>
              <Text style={styles.time}>
                {dayjs(Number(item.block_timestamp) / 1000000).format(
                  'HH:mm:ss'
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 4,
    borderRadius: 4,
  },
  detail: {
    flex: 1,
  },
  actionDesc: {
    fontSize: 14,
    fontFamily: Fonts.variable,
  },
  time: {
    fontSize: 12,
    textAlign: 'right',
    color: Colors.gray9,
    fontFamily: Fonts.variable,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    opacity: 0.7,
  },
  receiverId: {
    fontSize: 14,
    color: Colors.gray9,
    fontFamily: Fonts.variable,
    lineHeight: 24,
  },
})
