import { StackActions, useRoute } from '@react-navigation/native'
import { useEffect, useRef, useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Portal } from 'react-native-portalize'
import {
  AddCircledOutline,
  NavArrowDown,
  UserCircleAlt,
} from 'iconoir-react-native'

import Button from 'components/common/Button'
import ScreenHeader from 'components/common/ScreenHeader'
import TokenLogo from 'components/common/TokenLogo'
import { Text, View } from 'components/Themed'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useAppSelector } from 'store/hooks'
import { formatBalance } from 'utils/format'
import Fonts from 'theme/Fonts'
import Toast from 'utils/toast'
import { i18n } from 'locale'
import {
  ButtonType,
  Contact,
  Currency,
  RootStackScreenProps,
  Token,
  TxPreview,
} from 'types'
import TokenItem from 'components/Asset/TokenItem'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Box from 'components/common/Box'
import AnimatedInput from 'components/common/AnimatedInput'
import ContactItem from 'components/Setting/ContactItem'
import { Modalize } from 'react-native-modalize'
import TxPreviewModal from 'components/Modals/TxPreviewModal'
import WalletAPI from 'chain/WalletAPI'
import useAuth from 'hooks/useAuth'
import { CURRENCY_SYMBOL, DEFAULT_CURRENCY_RATE } from 'configure/setting'
import {
  filterWalletToken,
  isValidAmount,
  isValidReceiverAddress,
  sortWalletTokens,
} from 'chain/common'

export default function Transfer({
  navigation,
}: RootStackScreenProps<'Transfer'>) {
  const wallet = useAppSelector((state) => state.wallet.current)
  const currencyRates = useAppSelector(
    (state) => state.setting.currencyRates || DEFAULT_CURRENCY_RATE
  )
  const currency = useAppSelector(
    (state) => state.setting.currentCurrency || Currency.USD
  )

  const tokens = useAppSelector((state) => {
    return sortWalletTokens(
      state.asset.token.filter((t: Token) => filterWalletToken(t, wallet))
    )
  })

  const tokenListRef = useRef<BottomSheet>(null)
  const contactListRef = useRef<BottomSheet>(null)
  const confirmTxRef = useRef<Modalize>(null)

  const { params } = useRoute()
  const _receiver = (params as any)?.receiver
  const _token = (params as any)?.token
  const [receiver, setReceiver] = useState(_receiver ?? '')
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState(_token || tokens[0])
  const [addressFocus, setAddressFocus] = useState(false)
  const [amountFocus, setAmountFocus] = useState(false)
  const [txPreview, setTxPreview] = useState<TxPreview>()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isValidAddress, setIsValidAddress] = useState(false)

  const theme = useColorScheme()
  const insets = useSafeAreaInsets()

  const onSelect = (item: Token) => {
    setSelectedToken(item)
    setAmount('')
    tokenListRef.current?.close()
  }

  const contacts = useAppSelector((state) =>
    (state.setting.contacts || []).filter((t) => t.chain === wallet?.chain)
  )
  const contact = contacts.find((c) => c.address === receiver)

  useEffect(() => {
    isValidReceiverAddress(receiver, wallet).then(setIsValidAddress)
  }, [receiver])

  const onPreview = async () => {
    Keyboard.dismiss()
    if (!isValidReceiverAddress(receiver, wallet)) {
      return Toast.error(i18n.t('Invalid receiver ID'))
    }
    if (!isValidAmount(amount, selectedToken)) {
      return Toast.error(i18n.t('Invalid amount'))
    }
    if (!wallet) {
      return Toast.error(i18n.t('No account found'))
    }
    setTxPreview({
      from: wallet,
      to: receiver,
      amount,
      token: selectedToken,
    })
    confirmTxRef.current?.open()
  }

  const onConfirmTx = async () => {
    if (!txPreview) {
      return
    }
    try {
      setIsConfirming(true)
      await WalletAPI.transfer(txPreview)
      navigation.dispatch(StackActions.popToTop())
      setTimeout(() => {
        Toast.success('Transfering')
      }, 1000)
      setIsConfirming(false)
    } catch (error) {
      setIsConfirming(false)
      Toast.error(error)
    }
  }

  const auth = useAuth()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[theme].screenBackground },
      ]}
    >
      <ScreenHeader title={i18n.t('Transfer')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Box direction="column" gap="xlarge" full>
          <Box direction="column">
            <Box justify="flex-end" full>
              <Text style={{ color: Colors[theme].link, fontSize: 14 }}>
                {contact?.alias}
              </Text>
            </Box>

            <Box
              full
              align="center"
              style={{
                paddingVertical: 4,
                borderBottomWidth: 1,
                borderBottomColor: addressFocus
                  ? Colors[theme].text
                  : isValidAddress
                  ? Colors[theme].borderColor
                  : Colors.red,
              }}
            >
              <AnimatedInput
                placeholder={i18n.t('Address')}
                autoCapitalize="none"
                style={{}}
                value={receiver}
                onChangeText={(_text) => setReceiver(_text.trim())}
                onFocus={() => {
                  tokenListRef.current?.close()
                  contactListRef.current?.close()
                  setAddressFocus(true)
                }}
                onBlur={() => setAddressFocus(false)}
                placeholderTextColor={Colors.gray9}
                numberOfLines={3}
                multiline
                autoCorrect={false}
              />
              <Pressable
                onPress={() => {
                  Keyboard.dismiss()
                  tokenListRef.current?.close()
                  contactListRef.current?.expand()
                }}
              >
                <UserCircleAlt
                  width={30}
                  height={30}
                  color={Colors[theme].link}
                />
              </Pressable>
            </Box>
          </Box>

          <Box direction="column">
            <Box justify="flex-end" full>
              <Pressable
                onPress={() => {
                  setAmount(
                    formatBalance(
                      selectedToken?.balance,
                      selectedToken.decimals,
                      selectedToken.decimals
                    )
                  )
                }}
              >
                <Text
                  style={{
                    color: Colors[theme].link,
                    fontSize: 14,
                    fontFamily: Fonts.symbol,
                  }}
                >
                  {`${i18n.t('Balance')}: ${formatBalance(
                    selectedToken?.balance,
                    selectedToken?.decimals
                  )} ${selectedToken.symbol}`}
                </Text>
              </Pressable>
            </Box>
            <Box
              full
              align="center"
              style={{
                paddingVertical: 4,
                borderBottomWidth: 1,
                borderBottomColor: amountFocus
                  ? Colors[theme].text
                  : Colors[theme].borderColor,
              }}
            >
              <AnimatedInput
                placeholder={i18n.t('Amount')}
                autoCapitalize="none"
                style={{}}
                value={amount}
                keyboardType="numeric"
                onChangeText={(_text) => setAmount(_text.trim())}
                onFocus={() => {
                  setAmountFocus(true)
                  tokenListRef.current?.close()
                  contactListRef.current?.close()
                }}
                onBlur={() => setAmountFocus(false)}
                placeholderTextColor={Colors.gray9}
                autoCorrect={false}
              />
              <Pressable
                onPress={() => {
                  Keyboard.dismiss()
                  contactListRef.current?.close()
                  tokenListRef.current?.expand()
                }}
              >
                <View style={styles.tokenWrap}>
                  <TokenLogo size={30} token={selectedToken} />
                  <NavArrowDown
                    color={Colors[theme].link}
                    width={28}
                    height={28}
                  />
                </View>
              </Pressable>
            </Box>
          </Box>

          <Button
            label={i18n.t('Next')}
            type={ButtonType.PRIMARY}
            disabled={!isValidAmount(amount, selectedToken) || !isValidAddress}
            onPress={onPreview}
          />
        </Box>
      </ScrollView>

      <Modalize
        ref={confirmTxRef}
        adjustToContentHeight
        withHandle={false}
        closeOnOverlayTap={false}
      >
        <TxPreviewModal
          isConfirming={isConfirming}
          txPreview={txPreview}
          onCancel={() => {
            confirmTxRef.current?.close()
          }}
          onConfirm={() => {
            auth(onConfirmTx)
          }}
        />
      </Modalize>
      <Portal>
        <BottomSheet
          ref={tokenListRef}
          index={-1}
          enablePanDownToClose
          keyboardBehavior="fillParent"
          snapPoints={['60%']}
          backgroundStyle={{ backgroundColor: Colors[theme].cardBackground }}
        >
          <BottomSheetFlatList
            data={tokens}
            keyExtractor={(item: Token) => item.contractId || item.symbol}
            renderItem={({ item }) => {
              return (
                <TokenItem
                  item={item}
                  onSelect={onSelect}
                  rate={currencyRates[currency]}
                  unit={CURRENCY_SYMBOL[currency]}
                />
              )
            }}
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
          />
        </BottomSheet>
        <BottomSheet
          ref={contactListRef}
          index={-1}
          enablePanDownToClose
          keyboardBehavior="fillParent"
          snapPoints={['60%']}
          backgroundStyle={{ backgroundColor: Colors[theme].modalBackground }}
        >
          <BottomSheetFlatList
            data={contacts}
            keyExtractor={(item: Contact) => item.address}
            ListHeaderComponent={
              <Box direction="row" justify="flex-end">
                <Pressable
                  onPress={() => {
                    contactListRef.current?.close()
                    navigation.navigate('NewContact', {})
                  }}
                  hitSlop={20}
                >
                  <AddCircledOutline
                    width={24}
                    height={24}
                    color={Colors.link}
                  />
                </Pressable>
              </Box>
            }
            renderItem={({ item }) => {
              return (
                <ContactItem
                  item={item}
                  isQRCodeVisible={false}
                  onSelect={() => {
                    setReceiver(item.address)
                    contactListRef.current?.close()
                  }}
                />
              )
            }}
            contentContainerStyle={{
              paddingBottom: insets.bottom,
              paddingHorizontal: 20,
            }}
          />
        </BottomSheet>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formWrap: {
    borderRadius: 4,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontFamily: Fonts.variable,
  },
  suffix: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    position: 'absolute',
    opacity: 0.7,
  },
  paste: {
    fontSize: 20,
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontFamily: Fonts.heading,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 15,
  },
  icon: {
    width: 30,
    height: 30,
  },
  tokenWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowEnd: {
    marginBottom: 8,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: '100%',
  },
})
