import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  Coin,
  Infinite,
  Planet,
  Settings as SettingsIcon,
} from 'iconoir-react-native'
import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Subscription } from 'expo-modules-core'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import NotFoundScreen from 'screens/NotFoundScreen'
import Home from 'screens/Home'
import Explore from 'screens/Explore'
import Settings from 'screens/Settings'
import TokenDetail from 'screens/TokenDetail'
import { RootTabParamList, RootTabScreenProps, RootStackParamList } from 'types'
import Start from 'screens/Start'
import Restore from 'screens/Restore'
import Create from 'screens/Create'
import Transfer from 'screens/Transfer'
import NotificationScreen from 'screens/NotificationScreen'
import SearchDAppResult from 'screens/SearchDAppResult'
import Finance from 'screens/Finance'
import WalletExport from 'screens/WalletExport'
import WalletsManage from 'screens/WalletsManage'
import WalletDetail from 'screens/WalletDetail'
import PINCode from 'screens/PINCode'
import Security from 'screens/Security'
import NewContact from 'screens/NewContact'
import About from 'screens/About'
import ContactsManage from 'screens/ContactsManage'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import ChangePINCode from 'screens/ChangePINCode'
import SearchDApp from 'screens/SearchDApp'
import { i18n } from 'locale'
import { fetchConfigure } from 'utils/fetch'
import Networks from 'screens/Networks'
import ChainNetworks from 'screens/ChainNetworks'
import NewNetwork from 'screens/NewNetwork'
import {
  AnimatedTabBarNavigator,
  DotSize,
} from 'react-native-animated-nav-tab-bar'
import Fonts from 'theme/Fonts'
import NFTDetail from 'screens/NFTDetail'
import AuthorizedApps from 'screens/AuthorizedApps'
import SetupPINCode from 'screens/SetupPINCode'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

async function registerForPushNotificationsAsync() {
  let token = ''
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      return ''
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        experienceId: Constants.manifest?.originalFullName,
      })
    ).data
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  return token
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const navigation = useNavigation()

  const notificationListener = useRef<Subscription>()
  const responseListener = useRef<Subscription>()

  const dispatch = useAppDispatch()
  const _pushToken = useAppSelector((state) => state.setting.pushToken)

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token !== _pushToken) {
          dispatch({
            type: 'setting/updatePushToken',
            payload: token,
          })
        }
      })
      .catch(() => {})
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        dispatch({
          type: 'noti/add',
          payload: {
            noti: notification,
            isRead: false,
          },
        })
      })
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const noti = {
          noti: response.notification,
          isRead: true,
        }
        dispatch({
          type: 'noti/add',
          payload: noti,
        })
        navigation.navigate('Notification', {
          noti,
        })
      })

    fetchConfigure().then((res) => {
      dispatch({
        type: 'setting/updateConfigure',
        payload: Platform.OS === 'ios' ? res : {},
      })
    })

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        )
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Root"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: 'Oops!' }}
      />
      <Stack.Group screenOptions={{ presentation: 'card' }}>
        <Stack.Screen
          name="TokenDetail"
          component={TokenDetail}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="Transfer"
          component={Transfer}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="WalletExport"
          component={WalletExport}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="SearchDAppResult"
          component={SearchDAppResult}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="SearchDApp"
          component={SearchDApp}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="WalletsManage"
          component={WalletsManage}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="WalletDetail"
          component={WalletDetail}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="About"
          component={About}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="Security"
          component={Security}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="Finance"
          component={Finance}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="NewContact"
          component={NewContact}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="ContactsManage"
          component={ContactsManage}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="ChangePINCode"
          component={ChangePINCode}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="Networks"
          component={Networks}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="ChainNetworks"
          component={ChainNetworks}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="NewNetwork"
          component={NewNetwork}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="NFTDetail"
          component={NFTDetail}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="AuthorizedApps"
          component={AuthorizedApps}
          options={{ header: () => null }}
        />
        <Stack.Screen
          name="SetupPINCode"
          component={SetupPINCode}
          options={{ header: () => null }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="PINCode"
          component={PINCode}
          options={{
            header: () => null,
          }}
        />
      </Stack.Group>
      <Stack.Screen
        name="Start"
        component={Start}
        options={{
          header: () => null,
          fullScreenGestureEnabled: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Restore"
        component={Restore}
        options={{ header: () => null }}
      />
      <Stack.Screen
        name="Create"
        component={Create}
        options={{ header: () => null }}
      />
    </Stack.Navigator>
  )
}

const Tabs = AnimatedTabBarNavigator<RootTabParamList>()

function BottomTabNavigator() {
  const theme = useColorScheme()
  const { isExplorerEnabled } = useAppSelector((state) => state.setting)

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      appearance={{
        topPadding: 4,
        bottomPadding: 4,
        floating: true,
        dotSize: DotSize.MEDIUM,
        tabBarBackground: Colors[theme].tabBarBg,
      }}
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].text,
        tabBarHideOnKeyboard: true,
      }}
      tabBarOptions={{
        labelStyle: {
          fontSize: 16,
          fontFamily: Fonts.heading,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={Home}
        options={({ navigation }: RootTabScreenProps<'Home'>) => {
          return {
            tabBarIcon: ({
              color,
              focused,
            }: {
              color: string
              focused: boolean
            }) => {
              return (
                <Coin
                  width={30}
                  height={30}
                  color={focused ? color : Colors[theme].text}
                  strokeWidth={focused ? 2 : 1}
                />
              )
            },
            headerShown: false,
            title: i18n.t('Assets'),
          }
        }}
      />
      <Tabs.Screen
        name="Finance"
        component={Finance}
        options={({ navigation }: RootTabScreenProps<'Finance'>) => {
          return {
            tabBarIcon: ({
              color,
              focused,
            }: {
              color: string
              focused: boolean
            }) => {
              return (
                <Infinite
                  width={30}
                  height={30}
                  color={focused ? color : Colors[theme].text}
                  strokeWidth={focused ? 2 : 1}
                />
              )
            },
            headerShown: false,
            title: i18n.t('Finance'),
          }
        }}
      />
      {isExplorerEnabled && (
        <Tabs.Screen
          name="Explore"
          component={Explore}
          options={({ navigation }: RootTabScreenProps<'Explore'>) => ({
            tabBarIcon: ({
              color,
              focused,
            }: {
              color: string
              focused: boolean
            }) => (
              <Planet
                width={30}
                height={30}
                color={focused ? color : Colors[theme].text}
                strokeWidth={focused ? 2 : 1}
              />
            ),
            headerShown: false,
            title: i18n.t('Explore'),
          })}
        />
      )}
      <Tabs.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string
            focused: boolean
          }) => (
            <SettingsIcon
              width={30}
              height={30}
              color={focused ? color : Colors[theme].text}
              strokeWidth={focused ? 2 : 1}
            />
          ),
          headerShown: false,
          title: i18n.t('Settings'),
        }}
      />
    </Tabs.Navigator>
  )
}
