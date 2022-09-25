import { Feather } from '@expo/vector-icons'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false)

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync()

        // Load fonts
        await Font.loadAsync({
          ...Feather.font,
          Gilroy: require('assets/fonts/Gilroy-Bold.ttf'),
          'Gilroy-Medium': require('assets/fonts/Gilroy-Medium.ttf'),
          DMMono: require('assets/fonts/DMMono.ttf'),
          BeVietnamPro: require('assets/fonts/BeVietnamPro.ttf'),
        })
        await cryptoWaitReady()
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e)
      } finally {
        setLoadingComplete(true)
        SplashScreen.hideAsync()
      }
    }

    loadResourcesAndDataAsync()
  }, [])

  return isLoadingComplete
}
