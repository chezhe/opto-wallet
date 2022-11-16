import WalletFactory from 'chain/WalletFactory'
import { Image, StyleSheet } from 'react-native'
import { Chain } from 'types'

export default function ChainLogo({ chain }: { chain: Chain }) {
  return (
    <Image
      source={WalletFactory.chainLogo(chain)}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#999',
      }}
    />
  )
}
