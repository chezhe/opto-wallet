import NearWallet from 'chain/NearWallet'
import useWallet from 'hooks/useWallet'
import { useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image'
import Colors from 'theme/Colors'

export default function TxNFT({
  contractId,
  tokenId,
  isAvatar = false,
}: {
  contractId: string
  tokenId: string
  isAvatar?: boolean
}) {
  const [uri, setUri] = useState<string>()
  const { walletApi } = useWallet()
  useEffect(() => {
    if (contractId && tokenId && walletApi) {
      ;(walletApi as NearWallet)
        .getNFTMedia(contractId, tokenId)
        .then((media) => {
          if (media?.uri) {
            setUri(media.uri)
          }
        })
    }
  }, [contractId, tokenId, walletApi])

  if (!contractId || !tokenId || !uri) {
    return null
  }

  return (
    <FastImage
      source={{ uri }}
      style={[
        {
          width: 50,
          height: 50,
          borderRadius: isAvatar ? 25 : 4,
          borderWidth: 1,
          borderColor: Colors.gray9,
        },
      ]}
    />
  )
}
