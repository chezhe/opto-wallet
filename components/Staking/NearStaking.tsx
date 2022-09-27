import { useNavigation } from '@react-navigation/native'
import { BN } from 'bn.js'
import { i18n } from 'locale'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { ScrollView, StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { Chain, StakePool } from 'types'
import { NEAR_SYMBOL } from 'chain/near/constants'
import Fonts from 'theme/Fonts'
import Box from 'components/common/Box'
import Button from 'components/common/Button'
import InfoItem from 'components/common/InfoItem'
import { useAppSelector } from 'store/hooks'
import useSWR from 'swr'
import API from 'configure/api'
import { fetcher } from 'utils/fetch'

export default function NearStaking() {
  const wallet = useAppSelector((state) => state.wallet.current)
  const isNearWallet = wallet?.chain === Chain.NEAR
  const { data: myPools } = useSWR<StakePool[]>(
    isNearWallet
      ? `${API.indexer}/api/stakingDeposits?accountId=${wallet?.address}&network=${wallet?.networkType}`
      : null,
    fetcher
  )

  const { data: blockStat } = useSWR<{ validatingNodes: number }>(
    isNearWallet
      ? `${API.indexer}/api/blockStat?network=${wallet?.networkType}`
      : null,
    fetcher
  )

  let total = new BN('0')
  if (Array.isArray(myPools)) {
    myPools.forEach((pool) => {
      total = total.add(new BN(pool.deposit || '0'))
    })
  }

  const theme = useColorScheme()
  const navigation = useNavigation()

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      <Box
        direction="column"
        pad="large"
        align="flex-start"
        gap="small"
        backgroundColor={Colors[theme].cardBackground}
        style={{ borderRadius: 10 }}
      >
        <InfoItem
          title={i18n.t('Validating Nodes')}
          value={`${blockStat?.validatingNodes ?? 0}`}
          larger
          valueStyle={{
            fontFamily: Fonts.heading,
            color: Colors.green,
            fontSize: 36,
            lineHeight: 40,
          }}
        />

        <InfoItem
          title={i18n.t('Total staked')}
          value={`${formatNearAmount(total.toString())} ${NEAR_SYMBOL}`}
          larger
        />

        <Box direction="row" justify="space-around" full>
          <Button
            label={i18n.t('Stake')}
            style={{ width: 140, paddingVertical: 8 }}
            onPress={() => {
              navigation.navigate('Validators')
            }}
            primary
          />
          <Button
            label={i18n.t('Manage')}
            style={{ width: 140, paddingVertical: 8 }}
            onPress={() => {
              navigation.navigate('MyStaking', {
                pools: myPools || [],
              })
            }}
          />
        </Box>
      </Box>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
    padding: 15,
    paddingHorizontal: 20,
    margin: 20,
    marginTop: 0,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    lineHeight: 24,
  },
})
