import 'expo-dev-client'
import 'fastestsmallesttextencoderdecoder'
import '@polkadot/wasm-crypto/cjs/initOnlyAsm'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { Host } from 'react-native-portalize'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import './shim'
import './locale'
import useCachedResources from 'hooks/useCachedResources'
import Navigation from './navigation'
import { store, persistor } from 'store/index'
import ToastMessage from 'components/common/ToastMessage'
import { LogBox } from 'react-native'
import { IconoirProvider } from 'iconoir-react-native'
import Colors from 'theme/Colors'

LogBox.ignoreAllLogs()

cryptoWaitReady().catch(console.error)

export default function App() {
  const isLoadingComplete = useCachedResources()

  if (!isLoadingComplete) {
    return null
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <IconoirProvider
              iconProps={{
                color: Colors.gray9,
                strokeWidth: 1,
                width: '1em',
                height: '1em',
              }}
            >
              <SafeAreaProvider>
                <Host>
                  <Navigation />
                  <ToastMessage />
                </Host>
              </SafeAreaProvider>
            </IconoirProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    )
  }
}
