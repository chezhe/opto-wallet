import {
  PixelRatio,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View as NativeView,
  Platform,
  Linking,
} from 'react-native'
import * as Sharing from 'expo-sharing'
import { useEffect, useRef, useState } from 'react'
import { i18n } from 'locale'
import QRCode from 'react-native-qrcode-svg'
import icons from 'utils/icons'
import { View, Text } from 'components/Themed'
import { useAppSelector } from 'store/hooks'
import { Chain, CreateAccount, NetworkType, NewWalletSetup } from 'types'
import useColorScheme from 'hooks/useColorScheme'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import Toast from 'utils/toast'
import Heading from 'components/common/Heading'
import ScreenLoading from 'components/common/ScreenLoading'
import { captureRef } from 'react-native-view-shot'
import Button from 'components/common/Button'
import NearWallet, { fetchNearAccountIds } from 'chain/NearWallet'
import WalletFactory from 'chain/WalletFactory'

export default function FundAccount({
  newWallet,
  onConfirm,
}: {
  newWallet: NewWalletSetup
  onConfirm: () => void
}) {
  const [qrCodeValue, setQrCodeValue] = useState<CreateAccount>()
  const [isCreating, setIsCreating] = useState(false)
  const wallets = useAppSelector((state) => {
    return state.wallet.list.filter(
      (w) => w.chain === Chain.NEAR && w.networkType === NetworkType.MAINNET
    )
  })
  const { links } = useAppSelector((state) => state.setting)
  const qrcodeRef = useRef<NativeView>(null)
  const theme = useColorScheme()

  useEffect(() => {
    NearWallet.parseMnemonic(newWallet.mnemonic).then(({ publicKey }) => {
      setQrCodeValue({
        publicKey,
        accountId: newWallet.accountId,
        action: 'create',
      })
    })
  }, [newWallet.accountId, newWallet.mnemonic])

  useEffect(() => {
    const checkStatus = async () => {
      if (!qrCodeValue || isCreating) {
        return
      }
      try {
        const accountIds = await fetchNearAccountIds(
          NetworkType.MAINNET,
          qrCodeValue.publicKey
        )
        if (accountIds.includes(qrCodeValue.accountId)) {
          Toast.close()
          clear()
          onConfirm()
        }
      } catch (error) {}
    }
    const tick = setInterval(checkStatus, 5000)
    const clear = () => {
      tick && clearInterval(tick)
    }
    return clear
  }, [qrCodeValue])

  const onCreateBy = async (creatorAddress: string) => {
    if (isCreating) {
      return
    }
    try {
      setIsCreating(true)
      if (!qrCodeValue) {
        throw new Error('Invalid mnemonic')
      }

      Toast.close()
      const w = wallets.find((t) => t.address === creatorAddress)!
      const walletApi = new NearWallet(w)
      await walletApi.createAccount(qrCodeValue)

      setIsCreating(false)

      onConfirm()
    } catch (error) {
      setIsCreating(false)
      Toast.error(error)
    }
  }

  const onShare = async () => {
    try {
      const targetPixelCount = 1080
      const pixelRatio = PixelRatio.get()
      const pixels = targetPixelCount / pixelRatio

      const qrcode = await captureRef(qrcodeRef, {
        result: 'tmpfile',
        height: pixels * 1.2,
        width: pixels,
        quality: 1,
        format: 'png',
      })

      if (Platform.OS === 'ios') {
        await Share.share({
          title: i18n.t('Help me activate new NEAR account'),
          url: qrcode,
        })
      } else {
        await Sharing.shareAsync(qrcode, {
          dialogTitle: newWallet.accountId,
        })
      }
      Toast.warning(i18n.t('DO NOT close while activating'), 1000 * 10)
    } catch (error) {
      Toast.error(error)
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={{ marginBottom: 20 }}>
        <Text style={[styles.tip, { fontWeight: 'bold' }]}>
          {i18n.t('Please fund at least min Ⓝ to active your new account', {
            min: '0.1',
          })}
        </Text>
      </View>

      <Heading level={2} style={{ textAlign: 'center' }}>
        {i18n.t('With existing accounts')}
      </Heading>
      <View style={styles.qrcodeContainer}>
        {wallets.length > 0 && (
          <View style={{ width: '90%' }}>
            {wallets.map((_w) => {
              return (
                <Pressable
                  key={_w.address}
                  style={[
                    styles.itemWrap,
                    {
                      backgroundColor: Colors[theme].cardBackground,
                    },
                  ]}
                  onPress={() => onCreateBy(_w.address)}
                >
                  <View style={styles.itemRow}>
                    <Text
                      style={[styles.itemText, { color: Colors[theme].link }]}
                    >
                      {WalletFactory.formatAddress(_w)}
                    </Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}
        {wallets.length === 0 && (
          <Text
            style={{
              fontSize: 18,
              color: Colors.gray9,
              textAlign: 'center',
              marginTop: 10,
            }}
          >
            {i18n.t("You don't have available accounts")}
          </Text>
        )}
      </View>

      <Heading level={2} style={{ textAlign: 'center' }}>
        {i18n.t('Share QR code')}
      </Heading>
      <View style={styles.qrcodeContainer}>
        <NativeView style={styles.qrcodeWrap} ref={qrcodeRef}>
          <QRCode
            size={260}
            logo={icons.LOGO}
            logoBackgroundColor="white"
            logoMargin={5}
            logoSize={40}
            value={JSON.stringify(qrCodeValue)}
            logoBorderRadius={10}
          />
          <Text style={styles.forme}>
            {i18n.t('Create NEAR account for me')}
          </Text>
          <Text style={styles.newAccountId}>{qrCodeValue?.accountId}</Text>
        </NativeView>
        <Text
          style={[
            styles.tip,
            { marginTop: 10, fontSize: 16, color: Colors.gray },
          ]}
        >
          {i18n.t(
            'Share the QR code with friends to activate your new account'
          )}
        </Text>
        <Button
          label={i18n.t('Share')}
          onPress={onShare}
          primary
          style={{ width: 200, marginTop: 10 }}
        />
        <Text
          style={{ color: Colors.link, fontSize: 16, marginTop: 10 }}
          onPress={() => Linking.openURL(links.twitter)}
        >
          Need help? Contact with @optowallet
        </Text>
      </View>

      <ScreenLoading visible={isCreating} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  qrcodeContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 15,
  },
  qrcodeWrap: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  tip: {
    fontSize: 18,
    textAlign: 'center',
  },
  itemWrap: {
    width: '100%',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemText: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    marginLeft: 10,
  },
  newAccountId: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    textAlign: 'center',
    marginTop: 4,
    color: Colors.main,
  },
  forme: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: Colors.black,
  },
})
