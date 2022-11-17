import AsyncStorageLib from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'
import { I18n } from 'i18n-js'
import en from './en'
import zh from './zh'
import ja from './ja'
import es from './es'
import fr from './fr'

export const i18n = new I18n({
  en,
  'en-US': en,
  'en-GB': en,
  zh,
  'zh-Hans': zh,
  'zh-Hans-CN': zh,
  'zh-Hans-US': zh,
  ja,
  es,
  fr,
})

AsyncStorageLib.getItem('locale')
  .then((res) => {
    if (res) {
      i18n.locale = res
    } else {
      const systemLan = Localization.locale.split('-')[0]
      i18n.locale = ['zh', 'en', 'ja', 'es', 'fr'].includes(systemLan)
        ? systemLan
        : 'en'
    }
  })
  .catch(console.log)

i18n.defaultLocale = 'en'
i18n.enableFallback = true
