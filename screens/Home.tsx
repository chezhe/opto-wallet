import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet } from 'react-native'
import * as PubSub from 'pubsub-js'
import Banner from 'components/Banner'
import { View } from 'components/Themed'
import { useClient } from 'hooks/useClient'
import { Chain, PUB, RootTabScreenProps, Token } from 'types'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { fetchDApp, fetchFixer } from 'utils/fetch'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import TokenItem from 'components/Asset/TokenItem'
import { Near } from 'near-api-js'
import { ApiPromise } from '@polkadot/api'
import { CURRENCY_SYMBOL } from 'configure/setting'
import { updateNearTokenList } from 'chain/near/token'
import { updateAppChainTokenList } from 'chain/polkadot/token'
import { filterWalletToken, sortWalletTokens } from 'chain/common'

export default function Home({ navigation }: RootTabScreenProps<'Home'>) {
  const wallet = useAppSelector((state) => state.wallet.current)

  const tokens = useAppSelector((state) => {
    return sortWalletTokens(
      state.asset.token.filter((t: Token) => filterWalletToken(t, wallet))
    )
  })

  const { currencyRates, currentCurrency, isExplorerEnabled } = useAppSelector(
    (state) => state.setting
  )

  const [isLoading, setIsLoading] = useState(false)

  const client = useClient()
  const dispatch = useAppDispatch()
  const networkType = wallet?.networkType
  const theme = useColorScheme()

  useEffect(() => {
    if (!wallet) {
      navigation.navigate('Start', { new: true })
    }
  }, [wallet])

  useEffect(() => {
    if (wallet && networkType) {
      if (client) {
        const fetchTokenList = async () => {
          try {
            if (wallet.chain === Chain.NEAR) {
              await updateNearTokenList({
                client: client as Near,
                wallet,
                dispatch,
              })
            } else if (wallet.chain === Chain.OCT) {
              await updateAppChainTokenList({
                client: client as ApiPromise,
                wallet,
                dispatch,
              })
            }
          } catch (error) {
            setIsLoading(false)
          }
        }

        fetchTokenList()
        const tick = setInterval(fetchTokenList, 30000)
        const token = PubSub.subscribe(PUB.REFRESH_TOKENLIST, fetchTokenList)

        return () => {
          token && PubSub.unsubscribe(token)
          tick && clearInterval(tick)
        }
      }
    }
  }, [wallet?.address, networkType, client])

  useEffect(() => {
    fetchFixer().then((rates) => {
      dispatch({
        type: 'setting/updateCurrencyRate',
        payload: { ...rates, USD: 1 },
      })
    })
    if (isExplorerEnabled && wallet?.chain) {
      fetchDApp(wallet?.chain)
        .then((res) => {
          dispatch({
            type: 'dapp/updateChainDapps',
            payload: {
              chain: wallet?.chain,
              dapps: res,
            },
          })
        })
        .catch(console.error)
    }
  }, [isExplorerEnabled, wallet?.chain])

  const insets = useSafeAreaInsets()
  const onSelect = (item: Token) => {
    if (item) {
      navigation.navigate('Token', { token: item })
    }
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.chain[wallet?.chain || Chain.NEAR],
        }}
      >
        <Banner />
        <FlatList
          data={tokens}
          keyExtractor={(item) => item.contractId || item?.symbol}
          renderItem={({ item }) => {
            return (
              <TokenItem
                item={item}
                onSelect={onSelect}
                rate={currencyRates[currentCurrency]}
                unit={CURRENCY_SYMBOL[currentCurrency]}
              />
            )
          }}
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            backgroundColor: Colors[theme].background,
          }}
          contentContainerStyle={{}}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                setIsLoading(true)
                if (!isLoading) {
                  PubSub.publish(PUB.REFRESH_TOKENLIST)
                }
                setTimeout(() => {
                  setIsLoading(false)
                }, 5000)
              }}
            />
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
