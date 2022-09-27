import { i18n } from 'locale'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { capitalizeFirstLetter } from 'utils/format'
import SheetModal from 'components/common/SheetModal'

export default function ThemeModal({ onClose }: { onClose: () => void }) {
  const themeSetting = useAppSelector((state) => state.setting.theme)
  const dispatch = useAppDispatch()
  return (
    <SheetModal
      title={i18n.t('Theme')}
      items={['Light', 'Dark', 'Auto']}
      active={capitalizeFirstLetter(themeSetting)}
      onClose={onClose}
      isI18n
      onSelect={(_theme) => {
        dispatch({
          type: 'setting/updateTheme',
          payload: _theme.toLowerCase(),
        })
        onClose()
      }}
    />
  )
}
