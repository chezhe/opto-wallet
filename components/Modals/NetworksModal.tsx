import { i18n } from 'locale'
import * as PubSub from 'pubsub-js'

import { useAppDispatch } from 'store/hooks'
import { CustomNetwork, BaseNetwork, NetworkType, PUB } from 'types'
import SheetModal from 'components/common/SheetModal'
import Toast from 'utils/toast'
import useWallet from 'hooks/useWallet'

export default function NetworksModal({
  onClose,
  avNetworks,
}: {
  onClose: () => void
  avNetworks: (BaseNetwork | CustomNetwork)[]
}) {
  const dispatch = useAppDispatch()
  const { wallet, walletApi } = useWallet()

  const network = walletApi?.getNetwork()
  const active = (wallet?.customNetworkName ||
    network?.name ||
    NetworkType.MAINNET) as string

  return (
    <SheetModal
      title={i18n.t('Networks')}
      items={avNetworks.map((t) => t.name)}
      active={active}
      onClose={onClose}
      isI18n={false}
      onSelect={(item: string) => {
        const network = avNetworks.find((t) => t.name === item)
        if (!network) {
          return Toast.error(i18n.t('Network not found'))
        }
        if (walletApi?.isDefaultNetwork(item)) {
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
        PubSub.publish(PUB.REFRESH_TOKENLIST)
        setTimeout(() => {
          onClose()
        }, 300)
      }}
    />
  )
}
