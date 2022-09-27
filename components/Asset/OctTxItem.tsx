import { Text, View } from 'components/Themed'
import dayjs from 'dayjs'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { ReceiveDollars, SendDollars } from 'iconoir-react-native'
import { Pressable, StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { Chain, OctTx, Token } from 'types'
import { formatBalance, formatWalletAddress } from 'utils/format'

export default function OctTxItem({
  item,
  onOpen,
  token,
  address,
}: {
  item: OctTx
  onOpen: (item: OctTx) => void
  token: Token
  address: string
}) {
  const isOut = address === item.fromId
  const theme = useColorScheme()
  return (
    <Pressable onPress={() => onOpen(item)}>
      <View
        style={[styles.item, { backgroundColor: Colors[theme].cardBackground }]}
      >
        <View style={{ width: 24, height: 24, alignItems: 'center' }}>
          {isOut ? (
            <SendDollars color={Colors.gray9} width={24} height={24} />
          ) : (
            <ReceiveDollars color={Colors.gray9} width={24} height={24} />
          )}
        </View>
        <View style={styles.detail}>
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.title}>
              {`${isOut ? '-' : '+'}${formatBalance(
                item.amount,
                token.decimals
              )} ${token.symbol}`}
            </Text>
            <Text style={styles.receiverId}>
              {formatWalletAddress({
                chain: Chain.OCT,
                address: isOut ? item.toId : item.fromId,
              })}
            </Text>
            <View style={styles.row}>
              <Text style={[styles.actionDesc, { color: Colors[theme].link }]}>
                {item.extrinsicId}
              </Text>
              <Text style={styles.time}>
                {dayjs(item.timestamp).format('HH:mm:ss')}
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
