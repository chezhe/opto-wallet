import { useRoute } from '@react-navigation/native'
import { i18n } from 'locale'
import { StyleSheet } from 'react-native'
import ScreenHeader from 'components/common/ScreenHeader'
import NearValidators from 'components/Staking/NearValidators'

import { View } from 'components/Themed'
import { RootStackScreenProps, StakePool } from 'types'

export default function MyStaking({
  navigation,
}: RootStackScreenProps<'MyStaking'>) {
  const { params } = useRoute()
  const pools = (params as any).pools as StakePool[]
  return (
    <View style={styles.container}>
      <ScreenHeader title={i18n.t('My staking')} />
      <NearValidators pools={pools} isMine myPools={pools} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
