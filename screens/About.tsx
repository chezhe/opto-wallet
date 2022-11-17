import { i18n } from 'locale'
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as StoreReview from 'expo-store-review'
import * as Updates from 'expo-updates'
import * as Device from 'expo-device'

import ScreenHeader from 'components/common/ScreenHeader'
import { Text, View } from 'components/Themed'
import { RootStackScreenProps, SettingItem } from 'types'
import Colors from 'theme/Colors'
import {
  AppNotification,
  Copy,
  Discord,
  Erase,
  GitHub,
  Glasses,
  Keyframes,
  Lifebelt,
  Planet,
  RoundFlask,
  SeaAndSun,
  StarOutline,
  Telegram,
  Twitter,
  UploadSquareOutline,
} from 'iconoir-react-native'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import Toast from 'utils/toast'
import { useEffect, useState } from 'react'
import SettingBlock from 'components/Settings/SettingBlock'
import ScreenLoading from 'components/common/ScreenLoading'
import icons from 'utils/icons'
import Fonts from 'theme/Fonts'
import Box from 'components/common/Box'
import { getBuildVersion } from 'utils/helper'
import * as WebBrowser from 'expo-web-browser'
import { MotiImage } from 'moti'
import { MotiPressable } from 'moti/interactions'

export default function About({ navigation }: RootStackScreenProps<'About'>) {
  const { isDevMode, pushToken, isLabEnabled, links } = useAppSelector(
    (state) => state.setting
  )

  const [isUpdateAvaliable, setIsUpdateAvaliable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (Device.isDevice) {
      Updates.checkForUpdateAsync()
        .then((update) => {
          setIsUpdateAvaliable(update.isAvailable)
        })
        .catch(console.error)
    }
  }, [])

  const onManualUpdate = async () => {
    try {
      Alert.alert(
        i18n.t('Tip'),
        i18n.t('Updated content will take effect after APP restarted'),
        [
          {
            text: i18n.t('Cancel'),
            onPress: () => {},
          },
          {
            text: i18n.t('Confirm'),
            onPress: async () => {
              try {
                setIsUpdating(true)
                await Updates.fetchUpdateAsync()
                await Updates.reloadAsync()
                setIsUpdating(false)
              } catch (error) {
                setIsUpdating(false)
                Toast.error(error)
              }
            },
          },
        ],
        {
          cancelable: true,
        }
      )
    } catch (error) {
      Toast.error(error)
    }
  }

  const actions: SettingItem[] = [
    {
      icon: Lifebelt,
      title: 'Help',
      value: '',
      onPress: () => WebBrowser.openBrowserAsync(links.help),
    },
    {
      icon: Glasses,
      title: 'Privacy',
      value: '',
      onPress: () => WebBrowser.openBrowserAsync(links.privacy),
    },
    {
      icon: StarOutline,
      title: 'Rate',
      value: '',
      onPress: () => {
        if (Platform.OS === 'ios') {
          StoreReview.requestReview()
        } else {
          Linking.openURL(links.android)
        }
      },
    },
  ]
  if (isDevMode) {
    actions.push({
      title: 'Update',
      icon: UploadSquareOutline,
      value: isUpdateAvaliable ? (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: Colors.red,
          }}
        />
      ) : (
        ''
      ),
      onPress: () => {
        if (isUpdateAvaliable) {
          onManualUpdate()
        }
      },
    })

    actions.push({
      title: 'Notification',
      icon: AppNotification,
      noChevron: true,
      value: <Copy width={20} height={20} color={Colors.gray9} />,
      onPress: async () => {
        if (!pushToken) {
          return
        }
        try {
          await Clipboard.setStringAsync(pushToken)
          Toast.success(i18n.t('Copied'))
        } catch (error) {
          Toast.error(error)
        }
      },
    })

    actions.push({
      title: 'Clear Cache',
      icon: Erase,
      noChevron: true,
      value: '',
      onPress: async () => {
        dispatch({
          type: 'setting/reset',
        })
        dispatch({
          type: 'asset/reset',
        })
        dispatch({
          type: 'dapp/reset',
        })
        Toast.success(i18n.t('Cleared'))
      },
    })

    actions.push({
      icon: RoundFlask,
      title: 'Labs',
      noChevron: true,
      value: (
        <Switch
          onValueChange={() => {
            dispatch({
              type: 'setting/updateConfigure',
              payload: {
                isLabEnabled: !isLabEnabled,
              },
            })
          }}
          value={!!isLabEnabled}
        />
      ),
      onPress: () => {},
    })
  }

  const buildVersion = getBuildVersion()
  actions.push({
    title: 'Version',
    icon: Keyframes,
    value: buildVersion,
    onPress: () => {},
    noChevron: true,
  })

  const onLogoClick = () => {
    if (clickCount < 7) {
      setClickCount(clickCount + 1)
    }
    if (clickCount === 7) {
      Toast.success(
        !isDevMode ? i18n.t('Dev mode enabled') : i18n.t('Dev mode disabled')
      )
      setClickCount(0)
      dispatch({
        type: 'setting/updateDevMode',
        payload: !isDevMode,
      })
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={i18n.t('About')} />
      <ScrollView style={styles.content}>
        <Box direction="column">
          <SettingBlock
            title="Community"
            items={[
              {
                icon: SeaAndSun,
                title: 'Website',
                value: '',
                onPress: () => WebBrowser.openBrowserAsync(links.website),
              },
              {
                icon: Twitter,
                title: 'Twitter',
                value: '',
                onPress: () => WebBrowser.openBrowserAsync(links.twitter),
              },
              {
                icon: Discord,
                title: 'Discord',
                value: '',
                onPress: () => WebBrowser.openBrowserAsync(links.discord),
              },
              {
                icon: Telegram,
                title: 'Telegram',
                value: '',
                onPress: () => WebBrowser.openBrowserAsync(links.telegram),
              },
              {
                icon: GitHub,
                title: 'Github',
                value: '',
                onPress: () => WebBrowser.openBrowserAsync(links.github),
              },
            ]}
          />

          <SettingBlock title="Other" items={actions} />
        </Box>

        <Box
          direction="column"
          align="center"
          justify="center"
          style={styles.logoWrap}
        >
          <MotiPressable
            onPress={onLogoClick}
            animate={({ hovered, pressed }) => {
              'worklet'

              return {
                opacity: hovered || pressed ? 0.5 : 1,
                transform: [{ scale: hovered || pressed ? 1.2 : 1 }],
              }
            }}
          >
            <MotiImage source={icons.ABOUT} style={styles.logo} />
          </MotiPressable>
          <Text style={styles.title}>Opto Wallet</Text>
        </Box>
      </ScrollView>

      <ScreenLoading visible={isUpdating} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  blockWrap: {
    borderRadius: 4,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  logoWrap: {
    marginTop: 30,
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: Fonts.heading,
    color: Colors.gray9,
  },
})
