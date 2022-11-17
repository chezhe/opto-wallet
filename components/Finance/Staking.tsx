import Box from 'components/common/Box'
import { ComingSoon } from 'components/common/Placeholder'
import { Text } from 'components/Themed'
import useWallet from 'hooks/useWallet'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { CircleFade } from 'react-native-animated-spinkit'
import Fonts from 'theme/Fonts'
import { MarketItem, MarketSection } from 'types'
import icons from 'utils/icons'
import MarketItemCard from './MarketItemCard'

export default function Staking() {
  const { walletApi } = useWallet()
  const [stakings, setStakings] = useState<MarketSection[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (walletApi && stakings.length === 0) {
      setIsLoading(true)
      walletApi
        .getStaking()
        .then((res) => {
          setStakings(res)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  }, [walletApi, stakings.length, walletApi?.wallet.address])

  const onGoProject = (item: MarketItem) => {}

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      {stakings.map((section) => {
        return (
          <Box
            direction="column"
            gap="small"
            key={section.title}
            full
            align="flex-start"
            style={{ marginBottom: 20 }}
          >
            <Text style={styles.stitle}>{section.title}</Text>
            <Box direction="column" gap="small" full>
              {section.items.map((t) => {
                return (
                  <MarketItemCard
                    key={t.website}
                    item={t}
                    onPress={onGoProject}
                  />
                )
              })}
            </Box>
          </Box>
        )
      })}
      {isLoading && (
        <Box align="center" justify="center" full style={{ paddingTop: 50 }}>
          <CircleFade size={100} color="#999" />
        </Box>
      )}
      {!isLoading && stakings?.length === 0 && (
        <ComingSoon source={icons.MARKET} />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  stitle: {
    fontSize: 20,
    fontFamily: Fonts.heading,
  },
})
