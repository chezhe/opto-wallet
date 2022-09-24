import { Image, StyleSheet } from 'react-native'
import { Chain } from 'types'
import icons from 'utils/icons'

export default function ChainLogo({ chain }: { chain: Chain }) {
  return (
    <Image
      source={chain === Chain.NEAR ? icons.NEAR_LOGO : icons.OCT_LOGO}
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
