import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import walletSlice from './walletSlice'
import assetSlice from './assetSlice'
import dappSlice from './dappSlice'
import settingSlice from './settingSlice'
import notiSlice from './notiSlice'

const persistConfig = {
  key: 'NieR',
  storage: AsyncStorage,
}

const rootReducer = combineReducers({
  asset: assetSlice,
  dapp: dappSlice,
  wallet: walletSlice,
  setting: settingSlice,
  noti: notiSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
})
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
