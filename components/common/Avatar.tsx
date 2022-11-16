import NearWallet from 'chain/NearWallet'
import { View } from 'components/Themed'
import useWallet from 'hooks/useWallet'
import React, { useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image'
import Colors from 'theme/Colors'
import { Chain, NetworkType, Wallet } from 'types'
import icons from 'utils/icons'

export default function Avatar({
  wallet,
  borderColor = Colors.gray9,
  size = 30,
  placeholder,
  style = {},
  onAvatarLoaded,
}: {
  size?: number
  borderColor?: string
  wallet: Pick<Wallet, 'address' | 'networkType' | 'chain' | 'avatar'>
  placeholder?: any
  style?: any
  onAvatarLoaded?: (avatar: string) => void
}) {
  const { wallet: current } = useWallet()
  const { address, networkType, chain, avatar } = wallet
  const [source, setSource] = useState<string | undefined>()
  const [isOwner, setIsOwner] = useState(true)

  useEffect(() => {
    if (!source && wallet.avatar) {
      setSource(avatar)
    }
    NearWallet.getAvatarByAddress(
      (networkType as NetworkType) || current?.networkType,
      address
    ).then((_avatar) => {
      if (_avatar) {
        setSource(_avatar.uri)
        setIsOwner(_avatar.isOwner)
        onAvatarLoaded && onAvatarLoaded(_avatar.uri)
      } else {
        setSource('')
        setIsOwner(true)
        onAvatarLoaded && onAvatarLoaded('')
      }
    })
  }, [wallet.address, wallet.avatar])

  if (!source || chain !== Chain.NEAR) {
    if (placeholder) {
      return placeholder
    }
    return null
  }

  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor,
          borderStyle: isOwner ? 'solid' : 'dashed',
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <FastImage
        source={{ uri: source }}
        defaultSource={icons.NRAVATAR}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  )
}
