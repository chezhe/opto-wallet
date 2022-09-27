import {
  PixelRatio,
  Share,
  StyleSheet,
  View as NativeView,
  Platform,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import * as Clipboard from 'expo-clipboard'
import { captureRef } from 'react-native-view-shot'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sharing from 'expo-sharing'
import { Text, View } from 'components/Themed'
import Icon from 'components/common/Icon'
import Toast from 'utils/toast'
import useColorScheme from 'hooks/useColorScheme'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import icons from 'utils/icons'
import { Check, Copy, ShareAndroid, InfoEmpty } from 'iconoir-react-native'
import { useRef, useState } from 'react'
import { Wallet } from 'types'
import Heading from 'components/common/Heading'

export default function AddressQRModal({
  wallet,
  onClose,
  onManage,
  isMine,
}: {
  wallet: Pick<Wallet, 'address' | 'alias'> | undefined
  onClose: () => void
  onManage?: () => void
  isMine?: boolean
}) {
  const [isCopied, setIsCopied] = useState(false)
  const qrcodeRef = useRef(null)

  const onShare = async () => {
    try {
      const targetPixelCount = 1080
      const pixelRatio = PixelRatio.get()
      const pixels = targetPixelCount / pixelRatio

      const qrcode = await captureRef(qrcodeRef, {
        result: 'tmpfile',
        height: pixels,
        width: pixels,
        quality: 1,
        format: 'png',
      })

      if (Platform.OS === 'ios') {
        await Share.share({
          title: wallet?.address,
          url: qrcode,
        })
      } else {
        await Sharing.shareAsync(qrcode, {
          dialogTitle: wallet?.address,
        })
      }
      onClose()
    } catch (error) {
      Toast.error(error)
    }
  }

  const theme = useColorScheme()
  const insets = useSafeAreaInsets()
  if (!wallet) {
    return null
  }
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[theme].modalBackground,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      <View style={styles.content}>
        {!!wallet?.alias && <Heading>{wallet?.alias}</Heading>}
        <Text style={styles.title}>{wallet?.address}</Text>
        <NativeView style={styles.qrcodeWrap} ref={qrcodeRef}>
          <QRCode
            size={260}
            logo={icons.ABOUT}
            logoBackgroundColor="transparent"
            logoMargin={5}
            logoSize={50}
            value={wallet?.address ?? ''}
          />
        </NativeView>
        <View style={styles.buttonGroup}>
          <Icon
            backgroundColor={isCopied ? '#00C781' : undefined}
            icon={
              isCopied ? (
                <Check
                  width={25}
                  height={25}
                  color={Colors[theme].screenBackground}
                />
              ) : (
                <Copy
                  width={25}
                  height={25}
                  color={Colors[theme].screenBackground}
                />
              )
            }
            onPress={async () => {
              try {
                setIsCopied(true)
                await Clipboard.setStringAsync(wallet?.address ?? '')
                setTimeout(() => {
                  setIsCopied(false)
                }, 1000)
              } catch (error) {
                setIsCopied(false)
                Toast.error(error)
              }
            }}
          />
          <Icon
            icon={
              <ShareAndroid
                width={25}
                height={25}
                color={Colors[theme].screenBackground}
              />
            }
            onPress={onShare}
          />
          {isMine && (
            <Icon
              icon={
                <InfoEmpty
                  width={25}
                  height={25}
                  color={Colors[theme].screenBackground}
                />
              }
              onPress={() => {
                onClose()
                onManage && onManage()
              }}
            />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 15,
  },
  content: {
    alignItems: 'center',
    width: '90%',
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    color: Colors.link,
    fontFamily: Fonts.variable,
    width: 300,
    textAlign: 'center',
  },
  qrcodeWrap: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  gloss: {
    color: Colors.gray9,
    marginTop: 20,
    fontSize: 14,
  },
})
