import { i18n } from 'locale'
import {
  Brightness,
  Globe,
  HistoricShieldAlt,
  LotOfCash,
  Translate,
  UserCircleAlt,
  Wallet,
} from 'iconoir-react-native'
import { useRef, useState } from 'react'
import { StyleSheet, Image, ScrollView } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import ScreenHeader from 'components/common/ScreenHeader'
import LanguageModal from 'components/Modals/LanguageModal'
import CurrencyModal from 'components/Modals/CurrencyModal'
import SettingBlock from 'components/Settings/SettingBlock'
import ThemeModal from 'components/Modals/ThemeModal'
import { View } from 'components/Themed'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { Currency, RootTabScreenProps } from 'types'
import { capitalizeFirstLetter } from 'utils/format'
import icons from 'utils/icons'
import Fonts from 'theme/Fonts'

export default function Settings({
  navigation,
}: RootTabScreenProps<'Settings'>) {
  const languageRef = useRef<Modalize>(null)
  const themeRef = useRef<Modalize>(null)
  const currencyRef = useRef<Modalize>(null)
  const [languageChanged, setLanguageChanged] = useState(false)

  const themeSetting = useAppSelector((state) => state.setting.theme)
  const currency: Currency = useAppSelector(
    (state) => state.setting.currentCurrency || Currency.USD
  )

  const theme = useColorScheme()

  const dispatch = useAppDispatch()

  return (
    <View style={{ flex: 1, backgroundColor: Colors[theme].screenBackground }}>
      <ScreenHeader title={i18n.t('Settings')} isBackable={false} />
      <ScrollView
        style={[styles.container]}
        contentContainerStyle={styles.contentContainer}
      >
        <SettingBlock
          title="Wallet"
          items={[
            {
              icon: Wallet,
              title: 'Wallets',
              value: '',
              onPress: () => navigation.navigate('WalletsManage'),
            },
            {
              icon: HistoricShieldAlt,
              title: 'Security',
              value: '',
              onPress: () => navigation.navigate('Security'),
            },
            {
              icon: UserCircleAlt,
              title: 'Contacts',
              value: '',
              onPress: () => {
                navigation.navigate('ContactsManage')
              },
            },
            {
              icon: Globe,
              title: 'Networks',
              value: '',
              onPress: () => {
                navigation.navigate('Networks')
              },
            },
          ]}
        />

        <SettingBlock
          title="Display"
          items={[
            {
              icon: Translate,
              title: 'Language',
              value: i18n.t(i18n.locale),
              onPress: () => languageRef.current?.open(),
            },
            {
              icon: Brightness,
              title: 'Display',
              value: i18n.t(capitalizeFirstLetter(themeSetting)),
              onPress: () => themeRef.current?.open(),
            },
            {
              icon: LotOfCash,
              title: 'Currency',
              value: i18n.t(currency),
              onPress: () => currencyRef.current?.open(),
            },
          ]}
        />

        <SettingBlock
          title="About"
          items={[
            {
              icon: () => {
                return (
                  <Image
                    source={icons.LOGO}
                    style={[{ width: 24, height: 24 }]}
                  />
                )
              },
              title: 'Opto',
              value: '',
              onPress: () => navigation.navigate('About'),
            },
          ]}
        />
      </ScrollView>
      <Portal>
        <Modalize ref={languageRef} adjustToContentHeight>
          <LanguageModal
            onClose={() => {
              languageRef.current?.close()
              setLanguageChanged(!languageChanged)
              navigation.goBack()
            }}
          />
        </Modalize>
        <Modalize ref={themeRef} adjustToContentHeight>
          <ThemeModal onClose={() => themeRef.current?.close()} />
        </Modalize>
        <Modalize ref={currencyRef} adjustToContentHeight>
          <CurrencyModal onClose={() => currencyRef.current?.close()} />
        </Modalize>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  head: {
    fontSize: 40,
    fontFamily: Fonts.heading,
    marginBottom: 0,
  },
  blockTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    lineHeight: 30,
    color: Colors.gray9,
    marginBottom: 4,
    marginLeft: 10,
  },
  blockWrap: {
    borderRadius: 4,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
})
