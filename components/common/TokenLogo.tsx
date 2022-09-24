import { Image, StyleSheet } from 'react-native'
import { SvgCss } from 'react-native-svg'
import { Token } from 'types'
import { calcViewBox } from 'utils/helper'
import icons from 'utils/icons'
import { View } from 'components/Themed'

export default function TokenLogo({
  token,
  size,
}: {
  token: Token
  size: number
}) {
  if (!token) {
    return null
  }
  let icon = null
  let source
  if (typeof token.icon === 'string') {
    let iconStr = token.icon as string

    source = { uri: token.icon }

    if (iconStr.startsWith('data:image/svg+xml')) {
      let xml = ''
      if (iconStr.startsWith('data:image/svg+xml;base64')) {
        const _tmpIconStr = iconStr.substring(iconStr.indexOf(',') + 1)
        xml = Buffer.from(_tmpIconStr, 'base64').toString()
      } else {
        xml = decodeURIComponent(iconStr.substring(iconStr.indexOf(',') + 1))
      }

      if (xml.startsWith('<')) {
        const viewBox = calcViewBox(xml)

        if (viewBox) {
          icon = (
            <SvgCss
              xml={xml}
              width={size}
              height={size}
              viewBox={viewBox}
              style={[styles.logo, { borderRadius: size / 2 }]}
            />
          )
        } else {
          icon = (
            <SvgCss
              xml={xml}
              width={size}
              height={size}
              style={[styles.logo, { borderRadius: size / 2 }]}
            />
          )
        }
      } else {
        source = { uri: iconStr }
      }
    }
  } else if (typeof token.icon === 'number') {
    source = token.icon
  } else if (token.contractId === 'wrap.near') {
    source = icons.WNEAR
  } else {
    source = icons.NEAR_TOKEN
  }
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {icon || (
        <Image
          source={source}
          style={[
            styles.logo,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      )}
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
