import AsyncStorageLib from '@react-native-async-storage/async-storage'
import { i18n } from 'locale'
import Toast from 'utils/toast'
import SheetModal from 'components/common/SheetModal'

export default function LanguageModal({ onClose }: { onClose: () => void }) {
  const items = ['en', 'zh']
  return (
    <SheetModal
      title={i18n.t('Language')}
      items={items.map((t) => i18n.t(t))}
      active={i18n.t(i18n.locale)}
      onClose={onClose}
      onSelect={(item: string, idx: number | undefined) => {
        if (typeof idx === 'number') {
          AsyncStorageLib.setItem('locale', items[idx])
            .then(() => {
              i18n.locale = items[idx]
              onClose()
            })
            .catch((error) => {
              Toast.error(error)
            })
        }
      }}
    />
  )
}
