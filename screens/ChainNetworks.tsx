import { useRoute } from '@react-navigation/native'
import WalletFactory from 'chain/WalletFactory'
import Box from 'components/common/Box'
import Button from 'components/common/Button'
import ScreenHeader from 'components/common/ScreenHeader'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { Pressable, ScrollView, StyleSheet } from 'react-native'
import { useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import Styles from 'theme/Styles'
import { Chain, NetworkType, RootStackScreenProps } from 'types'
import { formatNodeUrl } from 'utils/format'

export default function ChainNetworks({
  navigation,
}: RootStackScreenProps<'ChainNetworks'>) {
  const theme = useColorScheme()
  const { params } = useRoute()
  const chainType = (params as any).chain as Chain
  const customNetworks = useAppSelector((state) =>
    (state.setting.networks || []).filter((t) => t.chain === chainType)
  )

  const chain = WalletFactory.getChains().find(
    (chain) => chain.chain === chainType
  )

  if (!chain) {
    return null
  }

  return (
    <View style={Styles.fill}>
      <ScreenHeader title={chainType} />
      <ScrollView style={Styles.scrollview}>
        <Box direction="column" gap="small" full>
          <Box direction="column" gap="small" full>
            {Object.keys(chain?.defaultNetworks).map((networkType) => {
              const nt = networkType as NetworkType
              return (
                <View
                  key={networkType}
                  style={[
                    styles.networkWrap,
                    {
                      backgroundColor: Colors[theme].cardBackground,
                    },
                  ]}
                >
                  <Text style={styles.networkName}>{networkType}</Text>
                  <Text style={styles.nodeUrl}>
                    {formatNodeUrl(chain?.defaultNetworks[nt]!.nodeUrl)}
                  </Text>
                </View>
              )
            })}
          </Box>

          <Box direction="column" gap="small" full>
            <Box
              key="custom-networks"
              direction="column"
              align="flex-start"
              full
            >
              <Text style={styles.title}>{i18n.t('Custom Networks')}</Text>
              {customNetworks.map((network) => {
                return (
                  <Pressable
                    key={network.nodeUrl}
                    style={{ width: '100%', marginBottom: 10 }}
                    onPress={() =>
                      navigation.navigate('NewNetwork', {
                        chain: chainType,
                        network,
                      })
                    }
                  >
                    <View
                      style={[
                        styles.networkWrap,
                        {
                          backgroundColor: Colors[theme].cardBackground,
                        },
                      ]}
                    >
                      <Text style={styles.networkName}>{network.name}</Text>
                      <Text style={styles.nodeUrl}>{network.nodeUrl}</Text>
                    </View>
                  </Pressable>
                )
              })}
            </Box>
            {WalletFactory.isCustomNetworkSupported(chainType) && (
              <Button
                key="add-custom-network"
                label={i18n.t('Add Custom Network')}
                primary
                style={{ marginTop: 20 }}
                onPress={() =>
                  navigation.navigate('NewNetwork', { chain: chainType })
                }
              />
            )}
          </Box>
        </Box>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  networkWrap: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: 4,
    paddingRight: 10,
    padding: 10,
  },
  networkName: {
    fontSize: 20,
    fontFamily: Fonts.heading,
  },
  nodeUrl: {
    fontSize: 14,
    color: Colors.gray9,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    marginTop: 20,
    marginBottom: 10,
  },
})
