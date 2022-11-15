import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native'
import WalletFactory from 'chain/WalletFactory'
import { StatusBar } from 'expo-status-bar'

import useColorScheme from 'hooks/useColorScheme'
import _ from 'lodash'
import { useEffect } from 'react'
import { useAppDispatch } from 'store/hooks'
import LinkingConfiguration from './LinkingConfiguration'
import RootNavigator from './RootNavigator'

export default function Navigation() {
  const theme = useColorScheme()
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch({
      type: 'asset/initNativeToken',
      payload: _.flatten(WalletFactory.getChains().map((t) => t.nativeTokens)),
    })
  }, [])

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={theme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  )
}
