import { createSlice } from '@reduxjs/toolkit'
import { Platform } from 'react-native'
import { Contact, Currency, CurrencyRate, CustomNetwork } from 'types'

interface SettingSlice {
  bioAuthEnabled: boolean
  theme: string
  pushToken: string
  isDevMode: boolean
  currencyRates: CurrencyRate
  currentCurrency: Currency
  contacts: Contact[]
  pincode: string
  isExplorerEnabled: boolean
  networks: CustomNetwork[]
  guide: {
    [key: string]: boolean
  }
}

const initialState: SettingSlice = {
  bioAuthEnabled: false,
  theme: 'auto',
  pushToken: '',
  isDevMode: false,
  currencyRates: {
    USD: 1,
  },
  currentCurrency: Currency.USD,
  contacts: [],
  pincode: '',
  isExplorerEnabled: Platform.OS === 'android',
  networks: [],
  guide: {
    dapp: false,
  },
}

export const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    reset: (state, action) => {},
    doGuide: (state, action) => {
      if (typeof action.payload === 'string') {
        state.guide[action.payload] = true
      }
    },
    updateAuth: (state, action) => {
      state.bioAuthEnabled = action.payload
    },
    updateTheme: (state, action) => {
      state.theme = action.payload
    },
    updatePushToken: (state, action) => {
      state.pushToken = action.payload
    },
    updateDevMode: (state, action) => {
      state.isDevMode = action.payload
    },
    updateCurrencyRate: (state, action) => {
      state.currencyRates = { ...state.currencyRates, ...action.payload }
    },
    updateCurrentCurrency: (state, action) => {
      state.currentCurrency = action.payload
    },
    addContact: (state, action) => {
      if (!Array.isArray(state.contacts)) {
        state.contacts = []
      }
      state.contacts.push(action.payload)
    },
    removeContact: (state, action) => {
      state.contacts = state.contacts.filter(
        (contact) =>
          contact.alias !== action.payload.alias &&
          contact.address !== action.payload.address
      )
    },
    updateContact: (state, action) => {
      const { oldContact, newContact } = action.payload
      state.contacts = state.contacts.map((t) => {
        if (oldContact.address === t.address) {
          return newContact
        }
        return t
      })
    },
    addNetwork: (state, action) => {
      if (!Array.isArray(state.networks)) {
        state.networks = []
      }
      state.networks.push(action.payload)
    },
    removeNetwork: (state, action) => {
      state.networks = state.networks.filter(
        (contact) =>
          contact.name !== action.payload.name &&
          contact.nodeUrl !== action.payload.nodeUrl
      )
    },
    updateNetwork: (state, action) => {
      const { oldNetwork, newNetwork } = action.payload
      state.networks = state.networks.map((t) => {
        if (oldNetwork.nodeUrl === t.nodeUrl) {
          return newNetwork
        }
        return t
      })
    },
    setupPINCode: (state, action) => {
      state.pincode = action.payload
    },
    updateBioAuth: (state, action) => {
      state.bioAuthEnabled = action.payload
    },
    updateExplorer: (state, action) => {
      if (!state.isExplorerEnabled) {
        state.isExplorerEnabled = action.payload
      }
    },
  },
})

export const { updateAuth, updateTheme, updatePushToken, updateDevMode } =
  settingSlice.actions

export default settingSlice.reducer
