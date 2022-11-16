import { useNavigation } from '@react-navigation/native'
import { sortWalletTokens } from 'chain/common'
import { CURRENCY_SYMBOL } from 'configure/setting'
import useColorScheme from 'hooks/useColorScheme'
import useWallet from 'hooks/useWallet'
import { useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import { PUB, Token } from 'types'
import TokenItem from './TokenItem'

export default function TokenList({
  isUpdatingTokenList,
}: {
  isUpdatingTokenList: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)

  const { walletApi } = useWallet()
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
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

  const onSelect = (item: Token) => {
    if (item) {
      navigation.navigate('TokenDetail', { token: item })
    }
  }
  return (
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
  )
}
