import { i18n } from 'locale'
import { StyleSheet, TouchableOpacity } from 'react-native'

import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { Token } from 'types'
import { calcValue, formatBalance } from 'utils/format'
import TokenLogo from 'components/common/TokenLogo'
import { Text, View } from 'components/Themed'

export default function TokenItem({
  item,
  onSelect,
  rate = 1,
  unit = '$',
}: {
  item: Token
  onSelect: (item: Token) => void
  rate?: number
  unit?: string
}) {
  const theme = useColorScheme()
  if (!item) {
    return null
  }
  return (
    <TouchableOpacity
      key={item.symbol}
      activeOpacity={0.7}
      onPress={() => onSelect(item)}
    >
      <View style={[styles.item]}>
        <TokenLogo size={50} token={item} />

        <View
          style={[
            styles.itemRight,
            {
              borderColor: Colors[theme].borderColor,
            },
          ]}
        >
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.tokenName}>{item.symbol}</Text>
            <Text style={styles.tokenPrice}>
              {i18n.numberToCurrency(Number((item.price * rate).toFixed(2)), {
                unit,
              })}
            </Text>
          </View>

          <View>
            <Text style={styles.tokenBalance}>
              {`${formatBalance(item.balance, item.decimals)}`}
            </Text>

            <Text style={styles.tokenValue}>
              {i18n.numberToCurrency(calcValue(item, rate), {
                unit,
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 15,
    paddingRight: 20,
    marginLeft: 8,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 20,
  },
  tokenValue: {
    fontSize: 16,
    textAlign: 'right',
    color: '#666',
    lineHeight: 20,
  },
  tokenPrice: {
    color: '#666',
  },
})
