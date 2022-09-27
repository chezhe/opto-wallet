import Box from 'components/common/Box'
import { Empty } from 'components/common/Placeholder'
import { Text, View } from 'components/Themed'
import { NEAR_NETWORKS } from 'chain/near/constants'
import dayjs from 'dayjs'
import * as WebBrowser from 'expo-web-browser'
import useTokenTx from 'hooks/useTokenTx'
import _ from 'lodash'
import { StyleSheet } from 'react-native'
import { Plane } from 'react-native-animated-spinkit'
import { useAppSelector } from 'store/hooks'
import Fonts from 'theme/Fonts'
import { Chain, NearTx, OctTx, Token } from 'types'
import NearTxItem from './NearTxItem'
import OctTxItem from './OctTxItem'

export default function TxList({ token }: { token: Token }) {
  const wallet = useAppSelector((state) => state.wallet.current)
  const { txs, isLoading } = useTokenTx(wallet!, token)

  if (!wallet) {
    return null
  }

  if (isLoading) {
    return (
      <Box align="center" justify="center" full style={{ paddingTop: 50 }}>
        <Plane size={100} color="#999" />
      </Box>
    )
  }

  if (txs.length === 0) {
    return (
      <Box align="center" justify="center">
        <Empty title="No transactions" />
      </Box>
    )
  }

  if (wallet.chain === Chain.NEAR) {
    const groupTxs = _.groupBy(txs, (tx: NearTx) =>
      dayjs(Number(tx.block_timestamp) / 1000000).format('MMM DD, YYYY')
    )
    const onOpen = (item: NearTx) => {
      WebBrowser.openBrowserAsync(
        `${NEAR_NETWORKS[wallet.networkType].explorerUrl}/transactions/${
          item.hash
        }`
      )
    }

    return (
      <View>
        {Object.keys(groupTxs).map((key) => {
          return (
            <View key={key}>
              <Text style={styles.date}>{key}</Text>
              <View>
                {groupTxs[key].map((tx: any, idx) => {
                  return (
                    <NearTxItem
                      key={`${tx.hash}-${idx}`}
                      item={tx}
                      onOpen={onOpen}
                      address={wallet?.address}
                      tokens={[token]}
                    />
                  )
                })}
              </View>
            </View>
          )
        })}
      </View>
    )
  } else if (wallet.chain === Chain.OCT) {
    const groupTxs = _.groupBy(
      txs.sort((a: OctTx, b: OctTx) =>
        dayjs(a.timestamp).isAfter(b.timestamp) ? -1 : 1
      ),
      (tx: OctTx) => dayjs(tx.timestamp).format('MMM DD, YYYY')
    )
    const onOpen = (item: OctTx) => {}

    return (
      <View>
        {Object.keys(groupTxs).map((key) => {
          return (
            <View key={key}>
              <Text style={styles.date}>{key}</Text>
              <View>
                {groupTxs[key]
                  .sort((a: OctTx, b: OctTx) =>
                    dayjs(a.timestamp).isAfter(b.timestamp) ? -1 : 1
                  )
                  .map((tx: any, idx) => {
                    return (
                      <OctTxItem
                        key={`${tx.hash}-${idx}`}
                        item={tx}
                        onOpen={onOpen}
                        address={wallet?.address}
                        token={token}
                      />
                    )
                  })}
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  date: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    marginVertical: 10,
  },
})
