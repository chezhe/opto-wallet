import { Portal } from 'react-native-portalize'
import { useEffect, useRef, useState } from 'react'
import { Modalize } from 'react-native-modalize'
import * as Clipboard from 'expo-clipboard'
import { i18n } from 'locale'
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Image,
} from 'react-native'
import {
  Bell,
  Dollar,
  NavArrowDown,
  QrCode,
  Wallet,
} from 'iconoir-react-native'
import { Text, View } from './Themed'
import { calcTotal } from 'utils/format'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import {
  Chain,
  Currency,
  CurrencyRate,
  LEDGER_STATUS,
  LEDGER_STATUS_CHANGE_EVENT,
  Token,
} from 'types'
import { useNavigation } from '@react-navigation/native'
import Icon from './common/Icon'
import Fonts from 'theme/Fonts'
import useColorScheme from 'hooks/useColorScheme'
import Colors from 'theme/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WalletsByChain from './Assets/WalletsByChain'
import AddressQRModal from './Modals/AddressQRModal'
import Toast from 'utils/toast'
import Box from './common/Box'
import NetworksModal from './Modals/NetworksModal'
import Scanner from './Scanner'
import icons from 'utils/icons'
import { CURRENCY_SYMBOL, DEFAULT_CURRENCY_RATE } from 'configure/setting'
import useWallet from 'hooks/useWallet'
import { Skeleton } from 'moti/skeleton'
import WcAPI from 'chain/WcAPI'
import Avatar from './common/Avatar'

export default function Banner({ isLoading }: { isLoading: boolean }) {
  const { wallet, walletApi } = useWallet()
  const tokens = useAppSelector((state) => {
    return state.asset.tokens.filter((t: Token) => {
      return walletApi?.filterWalletToken(t) ?? false
    })
  })
  const currencyRates: CurrencyRate = useAppSelector(
    (state) => state.setting.currencyRates || DEFAULT_CURRENCY_RATE
  )
  const currency: Currency = useAppSelector(
    (state) => state.setting.currentCurrency || Currency.USD
  )
  const notis = useAppSelector((state) => state.noti.list)
  const hasRedBage = notis.filter((t) => !t.isRead).length !== 0

  const receiveRef = useRef<Modalize>()
  const accountsRef = useRef<Modalize>()
  const networksRef = useRef<Modalize>(null)
  const [ledgerStatus, setLedgerStatus] = useState(LEDGER_STATUS.DISCONNECTED)

  const navigation = useNavigation()
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()

  const { height } = useWindowDimensions()

  const dispatch = useAppDispatch()

  const modalHeight = height - 280 + (Platform.OS === 'android' ? 30 : 0)

  useEffect(() => {
    const onLedgerEvent = (
      msg: string,
      { status }: { status: LEDGER_STATUS }
    ) => {
      setLedgerStatus(status)
    }

    const ledgerEvent = PubSub.subscribe(
      LEDGER_STATUS_CHANGE_EVENT,
      onLedgerEvent
    )

    return () => {
      ledgerEvent && PubSub.unsubscribe(ledgerEvent)
    }
  }, [])

  const avNetworks = walletApi?.getNetworks() || []
  const network = walletApi?.getNetwork()

  const onAvatarLoaded = (avatar: string) => {
    dispatch({
      type: 'wallet/setAvatar',
      payload: {
        avatar,
        address: wallet?.address,
      },
    })
  }

  return (
    <View style={[styles.banner]}>
      <View style={[styles.header, { top: insets.top }]}>
        <Pressable onPress={() => accountsRef?.current?.open()}>
          {wallet ? (
            <Avatar
              wallet={wallet}
              size={40}
              placeholder={
                <Icon
                  isTransparent
                  icon={<Wallet width={28} height={28} color={Colors.white} />}
                  onPress={() => accountsRef?.current?.open()}
                />
              }
              onAvatarLoaded={onAvatarLoaded}
              style={{ margin: 5 }}
            />
          ) : (
            <Icon
              isTransparent
              icon={<Wallet width={28} height={28} color={Colors.white} />}
              onPress={() => accountsRef?.current?.open()}
            />
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            if (avNetworks.length > 1) {
              networksRef.current?.open()
            }
          }}
        >
          <Box
            border
            style={{
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderColor: Colors.white,
            }}
          >
            <Text style={styles.networkName}>
              {wallet?.customNetworkName ?? network?.name}
            </Text>
            {avNetworks.length > 1 && (
              <NavArrowDown width={20} height={20} color={Colors.white} />
            )}
          </Box>
        </Pressable>

        <Icon
          isTransparent
          icon={
            <View style={{ position: 'relative' }}>
              <Bell width={24} height={24} color={Colors.white} />
              {hasRedBage && <View style={styles.badge}></View>}
            </View>
          }
          onPress={() => {
            navigation.navigate('Notification', {})
          }}
        />
      </View>
      <View style={styles.balanceWrap}>
        <Box direction="row" gap="small">
          {wallet?.isLedger && (
            <Image
              source={icons.LEDGER_WHITE}
              style={{ width: 16, height: 16 }}
            />
          )}
          <Pressable
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(wallet?.address ?? '')
                Toast.success(i18n.t('Copied'))
              } catch (error) {
                Toast.error(error)
              }
            }}
          >
            <Text style={[styles.account, { color: Colors.white }]}>
              {walletApi?.formattedAddress()}
            </Text>
          </Pressable>
        </Box>

        <View style={{ height: 10 }} />

        <Skeleton
          width={200}
          height={35}
          show={isLoading}
          radius="square"
          colorMode={theme}
        >
          <Text style={styles.total}>
            {i18n.numberToCurrency(
              Number(calcTotal(tokens, currencyRates[currency])),
              {
                unit: CURRENCY_SYMBOL[currency],
              }
            )}
          </Text>
        </Skeleton>
      </View>
      <View style={styles.buttonGroup}>
        <Icon
          icon={
            <Dollar
              width={24}
              height={24}
              color={Colors[theme].screenBackground}
              strokeWidth={2}
            />
          }
          onPress={() => {
            navigation.navigate('Transfer', {})
          }}
        />

        <Icon
          icon={
            <QrCode
              width={24}
              height={24}
              color={Colors[theme].screenBackground}
              strokeWidth={2}
            />
          }
          onPress={() => receiveRef.current?.open()}
        />

        <Scanner />

        {!!wallet?.isLedger && (
          <Icon
            icon={
              <Image
                source={
                  ledgerStatus === LEDGER_STATUS.CONNECTED
                    ? icons.CONNECTED_LEDGER
                    : icons.LEDGER_LOGO
                }
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                }}
              />
            }
            onPress={() => {
              if (ledgerStatus === LEDGER_STATUS.CONNECTED) {
                navigation.navigate('LedgerDevice')
              } else {
                navigation.navigate('ConnectLedger', { chain: wallet.chain })
              }
            }}
          />
        )}
      </View>
      <Portal>
        <Modalize ref={networksRef} adjustToContentHeight>
          <NetworksModal
            avNetworks={avNetworks}
            onClose={() => networksRef.current?.close()}
          />
        </Modalize>

        <Modalize
          ref={receiveRef}
          adjustToContentHeight
          closeOnOverlayTap
          handlePosition="inside"
          handleStyle={{ backgroundColor: Colors.gray9 }}
        >
          <AddressQRModal
            wallet={wallet}
            onClose={() => receiveRef.current?.close()}
            isMine
            onManage={() => {
              navigation.navigate('WalletDetail', { wallet: wallet! })
            }}
          />
        </Modalize>
        <Modalize ref={accountsRef} adjustToContentHeight withHandle={false}>
          <View style={{ flex: 1, height: modalHeight }}>
            <WalletsByChain
              onSelect={(w) => {
                if (WcAPI.walletApi) {
                  return Toast.error(
                    i18n.t("Can't switch wallet when WalletConnect in use")
                  )
                }
                dispatch({
                  type: 'wallet/setCurrent',
                  payload: w,
                })
                accountsRef?.current?.close()
              }}
              onAdd={(chain: Chain) => {
                accountsRef?.current?.close()
                navigation.navigate('Start', {
                  new: false,
                  chain,
                })
              }}
            />
          </View>
        </Modalize>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    paddingTop: 90,
  },
  balanceWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 20,
  },
  total: {
    fontSize: 30,
    color: Colors.white,
    fontFamily: Fonts.heading,
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  account: {
    fontSize: 18,
    fontFamily: Fonts.variable,
  },
  header: {
    width: '100%',
    position: 'absolute',
    paddingVertical: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  button: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingTop: 2,
    paddingBottom: 1,
    borderRadius: 4,
  },
  wallet: {
    fontSize: 16,
    fontFamily: Fonts.variable,
    color: Colors.white,
  },
  networkName: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.variable,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.red,
    position: 'absolute',
    right: 0,
  },
  networkWrap: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    margin: 7,
  },
})
