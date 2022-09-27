import { i18n } from 'locale'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { Currency } from 'types'
import SheetModal from 'components/common/SheetModal'

export default function CurrencyModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const currency: Currency = useAppSelector(
    (state) => state.setting.currentCurrency || Currency.USD
  )

  return (
    <SheetModal
      title={i18n.t('Currency')}
      items={Object.keys(Currency).map((t) => t)}
      active={currency}
      onClose={onClose}
      isI18n
      onSelect={(item: string) => {
        dispatch({
          type: 'setting/updateCurrentCurrency',
          payload: item,
        })
        setTimeout(() => {
          onClose()
        }, 300)
      }}
    />
  )
}
