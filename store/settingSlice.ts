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
  isNFTEnabled: boolean
  isLabEnabled: boolean
  networks: CustomNetwork[]
  tour: {
    [key: string]: boolean
  }
  links: {
    [key: string]: string
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
  isNFTEnabled: Platform.OS === 'android',
  isLabEnabled: false,
  networks: [],
  tour: {
    dapp: false,
    common: false,
    explore: false,
  },
  links: {
    privacy: 'https://optowallet.com/privacy',
    android: 'https://play.google.com/store/apps/details?id=app.opto.wallet',
    help: 'https://docs.optowallet.com/',
    twitter: 'https://twitter.com/optowallet',
    website: 'http://optowallet.com/',
    discord: 'https://discord.gg/Ta9yjbX9NR',
    github: 'https://github.com/nonceLabs',
    ledger: 'https://docs.optowallet.com/en/ledger',
    telegram: 'https://t.me/+M_voGGoZmqA2MTQ1',
    migrateFromNearWallet:
      'https://docs.optowallet.com/en/migrate-from-nearwallet',
    connectToLedger: 'https://docs.optowallet.com/en/connect-to-ledger',
  },
}

export const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    reset: (state, action) => {
      state.pincode = ''
      state.bioAuthEnabled = false
      state.isDevMode = false
    },
    toured: (state, action) => {
      if (!state.tour) state.tour = {}
      if (typeof action.payload === 'string') {
        state.tour[action.payload] = true
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
    updateConfigure: (state, action) => {
      const { isExplorerEnabled, isNFTEnabled, links, isLabEnabled } =
        action.payload
      if (!state.isExplorerEnabled && isExplorerEnabled) {
        state.isExplorerEnabled = isExplorerEnabled
      }
      if (!state.isNFTEnabled && isNFTEnabled) {
        state.isNFTEnabled = isNFTEnabled
      }
      if (typeof isLabEnabled === 'boolean') {
        state.isLabEnabled = isLabEnabled
      }
      if (links) {
        state.links = { ...state.links, ...links }
      }
    },
  },
})

export const { updateAuth, updateTheme, updatePushToken, updateDevMode } =
  settingSlice.actions

export default settingSlice.reducer
