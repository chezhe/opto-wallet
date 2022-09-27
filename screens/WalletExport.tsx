import { useRoute } from '@react-navigation/native'
import * as ClipBoard from 'expo-clipboard'
import WalletAPI from 'chain/WalletAPI'
import ScreenHeader from 'components/common/ScreenHeader'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import Styles from 'theme/Styles'
import { Wallet, SecureKeyStore, Chain } from 'types'
import Toast from 'utils/toast'
import Box from 'components/common/Box'
import { Copy } from 'iconoir-react-native'

export default function WalletExport() {
  const { params } = useRoute()
  const wallet = (params as any)?.wallet as Wallet
  const [keyStore, setKeyStore] = useState<SecureKeyStore | undefined>()
  const theme = useColorScheme()

  useEffect(() => {
    async function getPrivateKey() {
      try {
        const result = await WalletAPI.exportWallet(wallet)
        if (result) {
          setKeyStore(result)
        }
      } catch (error) {
        Toast.error(error)
      }
    }

    getPrivateKey()
  }, [wallet])

  const copy = <Copy width={24} height={24} color={Colors[theme].link} />

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={i18n.t('Export Wallet')} />
      <View style={Styles.page}>
        {wallet.chain !== Chain.OCT && (
          <Box direction="column">
            <Box align="center" justify="space-between" margin="small" full>
              <Text style={styles.title}>{i18n.t('Public Key')}</Text>
              <Pressable
                onPress={async () => {
                  await ClipBoard.setStringAsync(wallet.publicKey)
                  Toast.success(i18n.t('Copied'))
                }}
              >
                {copy}
              </Pressable>
            </Box>
            <View
              style={[
                Styles.card,
                {
                  backgroundColor: Colors[theme].cardBackground,
                  marginBottom: 20,
                },
              ]}
            >
              <Text style={styles.priv}>{keyStore?.publicKey}</Text>
            </View>
          </Box>
        )}

        {!!keyStore?.mnemonic && (
          <Box direction="column">
            <Box align="center" justify="space-between" margin="small" full>
              <Text style={styles.title}>{i18n.t('Mnemonic')}</Text>
              <Pressable
                onPress={async () => {
                  await ClipBoard.setStringAsync(keyStore?.mnemonic!)
                  Toast.success(i18n.t('Copied'))
                }}
              >
                {copy}
              </Pressable>
            </Box>
            <View
              style={[
                Styles.card,
                {
                  backgroundColor: Colors[theme].cardBackground,
                  marginBottom: 20,
                  width: '100%',
                },
              ]}
            >
              <Text style={styles.priv}>{keyStore?.mnemonic}</Text>
            </View>
          </Box>
        )}

        {!!keyStore?.privateKey && (
          <Box direction="column">
            <Box align="center" justify="space-between" margin="small" full>
              <Text style={styles.title}>{i18n.t('Private Key')}</Text>
              <Pressable
                onPress={async () => {
                  await ClipBoard.setStringAsync(keyStore?.privateKey ?? '')
                  Toast.success(i18n.t('Copied'))
                }}
              >
                {copy}
              </Pressable>
            </Box>
            <View
              style={[
                Styles.card,
                {
                  backgroundColor: Colors[theme].cardBackground,
                  marginBottom: 20,
                },
              ]}
            >
              <Text style={styles.priv}>{keyStore?.privateKey}</Text>
            </View>
          </Box>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  priv: {
    fontSize: 16,
    fontFamily: Fonts.variable,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.heading,
  },
})
