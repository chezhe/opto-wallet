import { Image, StyleSheet } from 'react-native'
import { View } from 'components/Themed'

export default function NFTLogo({ url, size }: { url: string; size: number }) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: 10,
        },
      ]}
    >
      <Image
        source={{ uri: url }}
        style={[styles.logo, { width: size, height: size, borderRadius: 10 }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
})
