import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import * as PubSub from 'pubsub-js'
import Banner from 'components/Banner'
import { View } from 'components/Themed'
import { PUB, RootTabScreenProps, Token } from 'types'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { fetchFixer } from 'utils/fetch'
import Colors from 'theme/Colors'
import { sortWalletTokens } from 'chain/common'
import useWallet from 'hooks/useWallet'
import UpgradeModal from 'components/Modals/UpgradeModal'
import AssetsTab from 'components/Assets/Index'

export default function Home({ navigation }: RootTabScreenProps<'Home'>) {
  const { wallet, walletApi } = useWallet()

  const tokens = useAppSelector((state) => {
    return sortWalletTokens(
      state.asset.tokens.filter(
        (t: Token) => walletApi?.filterWalletToken(t) ?? false
      )
    )
  })

  const [isUpdatingTokenList, setIsUpdatingTokenList] = useState(false)

  const dispatch = useAppDispatch()

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
        <AssetsTab isUpdatingTokenList={isUpdatingTokenList} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
