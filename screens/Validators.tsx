import ScreenHeader from 'components/common/ScreenHeader'
import NearValidators from 'components/Staking/NearValidators'
import { View } from 'components/Themed'
import API from 'configure/api'
import { i18n } from 'locale'
import { useState } from 'react'
import { useAppSelector } from 'store/hooks'
import useSWR from 'swr'
import { NetworkType } from 'types'
import { fetcher } from 'utils/fetch'

export default function Validators() {
  const [keyword, setKeyword] = useState('')
  const wallet = useAppSelector((state) => state.wallet.current)
  const networkType = wallet?.networkType || NetworkType.MAINNET
  const { data: pools, error } = useSWR<{ account_id: string }[]>(
    `${API.indexer}/api/stakingPools?network=${networkType}`,
    fetcher
  )

  const isLoading = !pools && !error

  return (
    <View>
      <ScreenHeader title={i18n.t('Validators')} />
      <NearValidators
        isLoading={isLoading}
        pools={(pools || [])
          .filter((t) => {
            return keyword ? t.account_id.includes(keyword) : true
          })
          .map((t) => {
            return { validator_id: t.account_id }
          })}
      />
    </View>
  )
}
