import { useNavigation } from '@react-navigation/native'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { StakePool } from 'types'
import { NEAR_SYMBOL, PAGE_SIZE } from 'chain/near/constants'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'
import Box from 'components/common/Box'
import { Plane } from 'react-native-animated-spinkit'

export default function NearValidators({
  pools,
  isMine,
  isLoading,
  myPools = [],
}: {
  pools: StakePool[]
  isMine?: boolean
  isLoading?: boolean
  myPools?: StakePool[]
}) {
  const [page, setPage] = useState(1)
  const theme = useColorScheme()
  const navigation = useNavigation()
  if (isLoading) {
    return (
      <Box
        pad="large"
        align="center"
        justify="center"
        style={{ paddingTop: 50 }}
      >
        <Plane size={100} color="#999" />
      </Box>
    )
  }
  return (
    <FlatList
      data={pools.slice(0, PAGE_SIZE * page)}
      keyExtractor={(t, idx) => `${t.validator_id}-${idx}`}
      renderItem={({ item }: { item: StakePool }) => {
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate('Validator', {
                address: item.validator_id,
                myPools,
              })
            }}
          >
            <View
              style={[
                styles.pool,
                { backgroundColor: Colors[theme].cardBackground },
              ]}
            >
              <Text style={[styles.title, { color: Colors[theme].link }]}>
                {item.validator_id}
              </Text>
              {isMine && (
                <Text style={styles.deposit}>
                  {`Deposited: ${formatNearAmount(
                    item.deposit!
                  )} ${NEAR_SYMBOL}`}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )
      }}
      style={[]}
      contentContainerStyle={styles.content}
      onMomentumScrollEnd={({ nativeEvent }) => {
        if (nativeEvent.contentOffset.y > 0) {
          setPage(page + 1)
        }
      }}
    />
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  pool: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 4,
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.variable,
  },
  deposit: {
    fontFamily: Fonts.heading,
    marginTop: 10,
  },
})
