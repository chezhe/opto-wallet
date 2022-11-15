import { FlatList, StyleSheet } from 'react-native'

import { Text, View } from 'components/Themed'
import { ButtonType, RootStackScreenProps } from 'types'
import useWallet from 'hooks/useWallet'
import { useEffect, useState } from 'react'
import NearWallet from 'chain/NearWallet'
import ScreenHeader from 'components/common/ScreenHeader'
import { i18n } from 'locale'
import Styles from 'theme/Styles'
import { AccountAuthorizedApp } from 'near-api-js/lib/account'
import useColorScheme from 'hooks/useColorScheme'
import Colors from 'theme/Colors'
import Button from 'components/common/Button'
import Box from 'components/common/Box'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import Toast from 'utils/toast'
import Fonts from 'theme/Fonts'
import { PAGE_SIZE } from 'configure/setting'

export default function AuthorizedApps({
  navigation,
}: RootStackScreenProps<'AuthorizedApps'>) {
  const [page, setPage] = useState(1)
  const { wallet, walletApi } = useWallet()
  const [apps, setApps] = useState<AccountAuthorizedApp[]>([])
  const [deauthorizingItem, setDeauthorizingItem] =
    useState<AccountAuthorizedApp>()
  const getAuthorizedApps = async () => {
    try {
      const _apps = await (walletApi as NearWallet)?.getAuthorizedApps()
      setApps(_apps)
    } catch (error) {}
  }

  useEffect(() => {
    if (walletApi) {
      getAuthorizedApps()
    }
  }, [walletApi])

  const theme = useColorScheme()

  const onDeauthorize = async (item: AccountAuthorizedApp) => {
    if (deauthorizingItem) {
      return
    }
    try {
      setDeauthorizingItem(item)
      await (walletApi as NearWallet)?.signAndSendTransaction({
        receiverId: wallet!.address,
        actions: [
          {
            type: 'DeleteKey',
            params: {
              publicKey: item.publicKey,
            },
          },
        ],
      })
      await getAuthorizedApps()
      setDeauthorizingItem(undefined)
    } catch (error) {
      Toast.error(error)
      setDeauthorizingItem(undefined)
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={`Apps ${apps.length ? `(${apps.length})` : ''}`} />
      <FlatList
        data={apps.slice(0, page * PAGE_SIZE)}
        style={Styles.scrollview}
        keyExtractor={(item, index) => item.publicKey}
        onMomentumScrollEnd={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y > 0) {
            setPage(page + 1)
          }
        }}
        renderItem={({ item, index }) => {
          return (
            <Box
              direction="column"
              gap="small"
              pad="medium"
              align="flex-start"
              style={{
                ...styles.card,
                backgroundColor: Colors[theme].cardBackground,
              }}
            >
              <Text style={styles.title}>{item.contractId || 'Unknown'}</Text>
              <Text style={styles.linkText}>{item.publicKey}</Text>
              <Box direction="row" align="center" justify="space-between" full>
                <Text>{i18n.t('Fee Allowance')}</Text>
                <Text>{`${formatNearAmount(item.amount)} NEAR`}</Text>
              </Box>
              <Box direction="row" align="center" justify="flex-end" full>
                <Button
                  label={i18n.t('Deauthorize')}
                  type={ButtonType.DANGER}
                  onPress={() => {
                    console.log('###item', item)

                    onDeauthorize(item)
                  }}
                  size="small"
                  filled={false}
                  isLoading={deauthorizingItem?.publicKey === item.publicKey}
                  disabled={!!deauthorizingItem}
                />
              </Box>
            </Box>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.heading,
  },
  card: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
})
