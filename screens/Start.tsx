import { StackActions, useRoute } from '@react-navigation/native'
import Box from 'components/common/Box'
import Heading from 'components/common/Heading'
import ScreenHeader from 'components/common/ScreenHeader'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { KeyAltPlus, QuestionMarkCircle, Wallet } from 'iconoir-react-native'
import { useEffect, useRef, useState } from 'react'
import {
  BackHandler,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import Styles, { ICON_WRAP_SIZE } from 'theme/Styles'
import { Chain, RootStackScreenProps } from 'types'
import icons from 'utils/icons'
import * as WebBrowser from 'expo-web-browser'
import WalletFactory from 'chain/WalletFactory'
import { Portal } from 'react-native-portalize'
import { Modalize } from 'react-native-modalize'
import QRScanModal from 'components/Modals/QRScanModal'
import { isImportSecretKeyURL } from 'utils/nearUrl'
import NearUrlModal from 'components/DApp/NearUrlModal'
import Toast from 'utils/toast'
import { useAppSelector } from 'store/hooks'

export default function Start({ navigation }: RootStackScreenProps<'Start'>) {
  const { params } = useRoute()
  const isNew = (params as any).new as boolean
  const chain = (params as any).chain as Chain

  const qrscanRef = useRef<Modalize>(null)
  const [nearUrl, setNearUrl] = useState<string>('')

  const { pincode, links } = useAppSelector((state) => state.setting)
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
  const { width } = useWindowDimensions()

  useEffect(() => {
    if (isNew) {
      const unsub = BackHandler.addEventListener('hardwareBackPress', () => {
        return false
      })

      return () => unsub && unsub.remove()
    }
  }, [isNew])

  const onScanned = (data: string) => {
    qrscanRef.current?.close()
    if (isImportSecretKeyURL(data)) {
      setNearUrl(data)
    } else {
      Toast.error(i18n.t('Invalid URL'))
    }
  }

  const onImported = () => {
    if (!!pincode) {
      navigation.dispatch(StackActions.popToTop())
    } else {
      navigation.navigate('SetupPINCode')
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: isNew ? insets.top : 0,
        backgroundColor: Colors[theme].background,
      }}
    >
      {!isNew && <ScreenHeader title={i18n.t('Back')} />}
      <ImageBackground
        source={icons.BOTTOM_LOGO}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Heading>{i18n.t('Welcome to')}</Heading>
          <Heading>Opto Wallet</Heading>

          <Box
            direction="column"
            backgroundColor={Colors.e3}
            style={{
              marginTop: 120,
              borderRadius: 10,
            }}
          >
            <Pressable
              style={{ width: '100%' }}
              onPress={() =>
                navigation.navigate('Create', {
                  chain,
                  new: isNew,
                })
              }
            >
              <Box gap="medium" pad="medium">
                <View
                  style={[Styles.iconWrap, { backgroundColor: Colors.green }]}
                >
                  <Wallet
                    width={ICON_WRAP_SIZE * 0.6}
                    height={ICON_WRAP_SIZE * 0.6}
                    color={Colors.white}
                  />
                </View>
                <View>
                  <Heading level={3} style={{ color: Colors.link }}>
                    {i18n.t('Create')}
                  </Heading>
                  <Text style={styles.subtitle}>
                    {i18n.t('I want to create a new wallet')}
                  </Text>
                </View>
              </Box>
            </Pressable>

            <View
              style={{
                height: 1,
                width: width - 40,
                backgroundColor: Colors.main,
              }}
            />

            <Pressable
              style={{ width: '100%' }}
              onPress={() =>
                navigation.navigate('Restore', { new: isNew, chain })
              }
            >
              <Box gap="medium" pad="medium">
                <View
                  style={[Styles.iconWrap, { backgroundColor: Colors.purple }]}
                >
                  <KeyAltPlus
                    width={ICON_WRAP_SIZE * 0.6}
                    height={ICON_WRAP_SIZE * 0.6}
                    color={Colors.white}
                  />
                </View>
                <View>
                  <Heading level={3} style={{ color: Colors.link }}>
                    {i18n.t('Restore')}
                  </Heading>
                  <Text style={styles.subtitle}>
                    {i18n.t('I have mnemonic or private key')}
                  </Text>
                </View>
              </Box>
            </Pressable>
          </Box>

          {(isNew || WalletFactory.isLedgerSupported(chain)) && (
            <ExtendButton
              onPress={() => {
                qrscanRef.current?.open()
              }}
              title={i18n.t('Migrate from')}
              imageSrc={icons.NEAR_WALLET}
              marginTop={50}
              onHelp={() => {
                if (links.migrateFromNearWallet) {
                  WebBrowser.openBrowserAsync(links.migrateFromNearWallet)
                }
              }}
            />
          )}

          {(isNew || WalletFactory.isLedgerSupported(chain)) && (
            <ExtendButton
              onPress={() => {
                navigation.navigate('ConnectLedger', { chain })
              }}
              title={i18n.t('Connect to')}
              imageSrc={icons.LEDGER}
              onHelp={() => {
                if (links.connectToLedger) {
                  WebBrowser.openBrowserAsync(links.connectToLedger)
                }
              }}
            />
          )}
        </ScrollView>
      </ImageBackground>
      <NearUrlModal url={nearUrl} onSetCurrentUrl={onImported} />
      <Portal>
        <Modalize
          ref={qrscanRef}
          adjustToContentHeight
          closeOnOverlayTap
          handlePosition="inside"
        >
          <QRScanModal
            onCancel={() => qrscanRef.current?.close()}
            onConfirm={onScanned}
          />
        </Modalize>
      </Portal>
    </View>
  )
}

function ExtendButton({
  onPress,
  title,
  imageSrc,
  marginTop = 10,
  onHelp,
}: {
  onPress: () => void
  title: string
  imageSrc: ImageSourcePropType
  marginTop?: number
  onHelp?: () => void
}) {
  return (
    <Pressable style={{ marginTop }} onPress={onPress}>
      <Box
        direction="row"
        align="center"
        justify="center"
        gap="medium"
        backgroundColor={Colors.e3}
        pad="medium"
        full
        style={{ borderRadius: 10 }}
      >
        <Text style={{ color: Colors.black, fontSize: 20 }}>{title}</Text>
        <Image source={imageSrc} style={styles.ledger} />
        <QuestionMarkCircle
          width={24}
          height={24}
          color={Colors.link}
          style={{ position: 'absolute', right: -4, margin: 16 }}
          onPress={onHelp}
        />
      </Box>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  subtitle: {
    color: Colors.gray,
  },
  ledger: {
    height: 30,
    width: 90,
  },
})
