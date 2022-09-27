import { AppChainType, NetworkBase, NetworkType } from 'types'
import icons from 'utils/icons'

export const OCT_NETWORKS: {
  [key in AppChainType]: NetworkBase
} = {
  [AppChainType.ATOCHA]: {
    icon: icons.ATOCHA,
    name: AppChainType.ATOCHA,
    type: NetworkType.MAINNET,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/atocha/jungxomf4hdcfocwcalgoiz64g9avjim',
  },
  [AppChainType.DEBIO]: {
    icon: icons.DEBIO,
    name: AppChainType.DEBIO,
    type: NetworkType.MAINNET,
    nodeUrl:
      'wss://gateway.testnet.octopus.network/barnacle0918/j8xz59egu4h8y814qnunm0cqfrq09lrw',
  },
  [AppChainType.DEIP]: {
    icon: icons.DEIP,
    name: AppChainType.DEIP,
    type: NetworkType.MAINNET,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/deip/b9e1ipeh3ejw2znrb4s2xd4tlf6gynq0',
  },
  [AppChainType.MYRIAD]: {
    icon: icons.MYRIAD,
    name: AppChainType.MYRIAD,
    type: NetworkType.MAINNET,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/myriad/a4cb0a6e30ff5233a3567eb4e8cb71e0',
  },
  [AppChainType.FUSOTAO]: {
    icon: icons.FUSOTAO,
    name: AppChainType.FUSOTAO,
    type: NetworkType.MAINNET,
    nodeUrl:
      'wss://gateway.mainnet.octopus.network/fusotao/0efwa9v0crdx4dg3uj8jdmc5y7dj4ir2',
  },
  [AppChainType.BARNACLE]: {
    icon: icons.BARNACLE,
    name: AppChainType.BARNACLE,
    type: NetworkType.MAINNET,
    nodeUrl:
      'wss://gateway.testnet.octopus.network/barnacle0918/j8xz59egu4h8y814qnunm0cqfrq09lrw',
  },
}
