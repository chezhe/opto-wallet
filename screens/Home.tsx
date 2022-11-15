import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet } from 'react-native'
import * as PubSub from 'pubsub-js'
import Banner from 'components/Banner'
import { View } from 'components/Themed'
import { PUB, RootTabScreenProps, Token } from 'types'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { fetchFixer } from 'utils/fetch'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import TokenItem from 'components/Asset/TokenItem'
import { CURRENCY_SYMBOL } from 'configure/setting'
import { sortWalletTokens } from 'chain/common'
import useWallet from 'hooks/useWallet'
import UpgradeModal from 'components/Modals/UpgradeModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Home({ navigation }: RootTabScreenProps<'Home'>) {
  const { wallet, walletApi } = useWallet()

  const tokens = useAppSelector((state) => {
    return sortWalletTokens(
      state.asset.tokens.filter(
        (t: Token) => walletApi?.filterWalletToken(t) ?? false
      )
    )
  })

  const { currencyRates, currentCurrency } = useAppSelector(
    (state) => state.setting
  )

  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingTokenList, setIsUpdatingTokenList] = useState(false)

  const dispatch = useAppDispatch()
  const theme = useColorScheme()

  useEffect(() => {
    if (!wallet) {
      navigation.navigate('Start', { new: true })
    }
  }, [wallet])

  useEffect(() => {
    if (wallet && walletApi && wallet.address === walletApi.wallet.address) {
      const updateTokenList = async () => {
        try {
          const payload = await walletApi?.getTokenList(tokens)
          const { address, networkType } = payload
          if (
            address === wallet.address &&
            networkType === wallet.networkType
          ) {
            dispatch({ type: 'asset/updateTokenList', payload })
          }
        } catch (error) {
          console.log(error)
        }
      }
      const fetchTokenList = async () => {
        try {
          setIsUpdatingTokenList(true)
          await updateTokenList()
          setIsUpdatingTokenList(false)
        } catch (error) {
          setIsUpdatingTokenList(false)
        }
      }

      walletApi
        ?.getDAppList()
        .then((res) => {
          dispatch({
            type: 'dapp/updateChainDapps',
            payload: {
              chain: wallet?.chain,
              dapps: res,
            },
          })
        })
        .catch(() => {})

      fetchTokenList()
      const tick = setInterval(updateTokenList, 30000)
      const token = PubSub.subscribe(PUB.REFRESH_TOKENLIST, updateTokenList)

      return () => {
        token && PubSub.unsubscribe(token)
        tick && clearInterval(tick)
      }
    }
  }, [walletApi?.wallet.address])

  useEffect(() => {
    fetchFixer().then((rates) => {
      dispatch({
        type: 'setting/updateCurrencyRate',
        payload: { ...rates, USD: 1 },
      })
    })
  }, [])

  const onSelect = (item: Token) => {
    if (item) {
      navigation.navigate('TokenDetail', { token: item })
    }
  }

  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          backgroundColor: wallet?.chain
            ? Colors.chain[wallet?.chain]
            : Colors.black,
        }}
      >
        <Banner isLoading={isUpdatingTokenList} />
        <UpgradeModal />
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
                isLoading={isUpdatingTokenList}
              />
            )
          }}
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            backgroundColor: Colors[theme].background,
          }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 50,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              tintColor={Colors.main}
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
})
