import { StyleSheet, useWindowDimensions } from 'react-native'
import { Text } from '../Themed'
import Fonts from 'theme/Fonts'
import { Wallet } from 'types'
import useColorScheme from 'hooks/useColorScheme'
import Colors from 'theme/Colors'
import WalletFactory from 'chain/WalletFactory'

export default function Address({
  wallet,
  color,
  fontSize = 18,
  ellipsis = true,
  numberOfLines = 1,
}: {
  wallet: Pick<Wallet, 'address' | 'alias' | 'chain'> | undefined
  fontSize?: number
  ellipsis?: boolean
  color?: string
  numberOfLines?: number
}) {
  const theme = useColorScheme()
  const { width } = useWindowDimensions()
  if (!wallet) {
    return null
  }
  return (
    <Text
      style={[
        styles.address,
        {
          color: color ?? Colors[theme].link,
          fontSize,
          maxWidth: width - 120,
        },
      ]}
      numberOfLines={numberOfLines}
    >
      {ellipsis ? WalletFactory.formatAddress(wallet) : wallet.address}
    </Text>
  )
}

const styles = StyleSheet.create({
  address: {
    fontFamily: Fonts.variable,
  },
})
