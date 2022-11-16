import {
  AddUser,
  Bank,
  CloudUpload,
  DeleteCircledOutline,
  KeyAltPlus,
  KeyAltRemove,
  MediaImage,
  PageFlip,
  QuestionMark,
  ReceiveDollars,
  SendDollars,
} from 'iconoir-react-native'

import Box from 'components/common/Box'
import { Empty } from 'components/common/Placeholder'
import { Text, View } from 'components/Themed'
import dayjs from 'dayjs'
import * as WebBrowser from 'expo-web-browser'
import _ from 'lodash'
import { Pressable, StyleSheet } from 'react-native'
import { CircleFade } from 'react-native-animated-spinkit'
import Fonts from 'theme/Fonts'
import { BaseTx, Token, TxType } from 'types'
import useWallet from 'hooks/useWallet'
import { useEffect, useState } from 'react'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { ellipsis } from 'utils/format'
import TxNFT from './TxNFT'
import icons from 'utils/icons'

const TxIcon = {
  [TxType.IN]: ReceiveDollars,
  [TxType.OUT]: SendDollars,
  [TxType.FUNCTION_CALL]: PageFlip,
  [TxType.CREATE_ACCOUNT]: AddUser,
  [TxType.DELETE_KEY]: KeyAltRemove,
  [TxType.ADD_KEY]: KeyAltPlus,
  [TxType.STAKE]: Bank,
  [TxType.DEPLOY_CONTRACT]: CloudUpload,
  [TxType.UNKNOWN]: QuestionMark,
  [TxType.NFT]: MediaImage,
}

export default function TxList({ token }: { token: Token }) {
  const { wallet, walletApi } = useWallet()
  const [txs, setTxs] = useState<BaseTx[][]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (walletApi) {
      setIsLoading(true)
      walletApi
        .getTokenTxList(token)
        .then((txs) => {
          setTxs(txs)
          setIsLoading(false)
        })
        .catch((err) => {
          console.log('err', err)

          setIsLoading(false)
        })
    }
  }, [walletApi])

  const theme = useColorScheme()
  if (!wallet) {
    return null
  }

  if (isLoading) {
    return (
      <Box align="center" justify="center" full style={{ paddingTop: 50 }}>
        <CircleFade size={100} color="#999" />
      </Box>
    )
  }

  if (txs.length === 0) {
    return (
      <Box align="center" justify="center">
        <Empty title="No transactions" source={icons.MARKET} />
      </Box>
    )
  }

  const groupTxs = _.groupBy(txs, (tx) =>
    dayjs(tx[0].time).format('MMM DD, YYYY')
  )
  const onOpen = (item: BaseTx) => {
    WebBrowser.openBrowserAsync(item.link)
  }

  return (
    <View>
      {Object.keys(groupTxs).map((key) => {
        return (
          <View key={key}>
            <Text style={styles.date}>{key}</Text>
            <View>
              {groupTxs[key]
                .sort((a, b) => {
                  return dayjs(a[0].time).isAfter(dayjs(b[0].time)) ? -1 : 1
                })
                .map((items: BaseTx[], idx) => {
                  return (
                    <View key={idx}>
                      {items.map((item, idx) => {
                        const Icon = TxIcon[item.type]
                        return (
                          <Pressable
                            key={`${item.hash}-${idx}`}
                            onPress={() => onOpen(item)}
                          >
                            <View
                              style={[
                                styles.item,
                                {
                                  backgroundColor: Colors[theme].cardBackground,
                                },
                              ]}
                            >
                              {item.failed ? (
                                <DeleteCircledOutline
                                  width={24}
                                  height={24}
                                  color={Colors.red}
                                />
                              ) : (
                                <Icon
                                  color={Colors.gray9}
                                  width={24}
                                  height={24}
                                />
                              )}
                              <View style={styles.detail}>
                                <View style={{ marginLeft: 16 }}>
                                  <View style={styles.row}>
                                    <Box
                                      direction="column"
                                      align="flex-start"
                                      gap="xsmall"
                                    >
                                      <Text style={styles.title}>
                                        {item.title}
                                      </Text>
                                      {!!item.subtitle && (
                                        <Text style={styles.receiverId}>
                                          {item.subtitle}
                                        </Text>
                                      )}
                                      <Text
                                        style={[
                                          styles.actionDesc,
                                          { color: Colors[theme].link },
                                        ]}
                                      >
                                        {ellipsis(item.hash, 16)}
                                      </Text>
                                      <Text style={styles.time}>
                                        {dayjs(item.time).format('HH:mm:ss')}
                                      </Text>
                                    </Box>
                                    {item.nft && (
                                      <TxNFT
                                        {...item.nft}
                                        isAvatar={[
                                          'app.nravatar.near',
                                          'app.nravatar.testnet',
                                        ].includes(item.subtitle)}
                                      />
                                    )}
                                  </View>
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        )
                      })}
                    </View>
                  )
                })}
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  date: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    marginVertical: 10,
  },
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
    alignItems: 'center',
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
  },
})
