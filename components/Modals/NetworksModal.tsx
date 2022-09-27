import { i18n } from 'locale'
import * as PubSub from 'pubsub-js'

import { useAppDispatch, useAppSelector } from 'store/hooks'
import { Chain, CustomNetwork, NetworkBase, NetworkType, PUB } from 'types'
import SheetModal from 'components/common/SheetModal'
import Toast from 'utils/toast'

export default function NetworksModal({
  onClose,
  avNetworks,
}: {
  onClose: () => void
  avNetworks: (NetworkBase | CustomNetwork)[]
}) {
  const dispatch = useAppDispatch()
  const wallet = useAppSelector((state) => state.wallet.current)

  let active = wallet?.appchainId as string
  if (!active) {
    active = (wallet?.customNetworkName ||
      wallet?.networkType ||
      NetworkType.MAINNET) as string
  }
  return (
    <SheetModal
      title={i18n.t('Networks')}
      items={avNetworks.map((t) => t.name)}
      active={active}
      onClose={onClose}
      isI18n={false}
      onSelect={(item: string) => {
        if (wallet?.chain === Chain.OCT) {
          dispatch({
            type: 'wallet/setCurrent',
            payload: {
              ...wallet,
              appchainId: item,
              networkType: NetworkType.MAINNET,
            },
          })
        } else {
          const network = avNetworks.find((t) => t.name === item)
          if (!network) {
            return Toast.error('Network not found')
          }
          if (
            ([NetworkType.MAINNET, NetworkType.TESTNET] as string[]).includes(
              item
            )
          ) {
            dispatch({
              type: 'wallet/setCurrent',
              payload: {
                ...wallet,
                networkType: item,
                customNetworkName: undefined,
              },
            })
          } else {
            dispatch({
              type: 'wallet/setCurrent',
              payload: {
                ...wallet,
                networkType: network.type,
                customNetworkName: item,
              },
            })
          }
        }
        PubSub.publish(PUB.REFRESH_TOKENLIST)
        setTimeout(() => {
          onClose()
        }, 300)
      }}
    />
  )
}
