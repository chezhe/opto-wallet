import NearWallet, { getNFTMedia } from 'chain/NearWallet'
import Box from 'components/common/Box'
import Button from 'components/common/Button'
import { Empty } from 'components/common/Placeholder'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import useWallet from 'hooks/useWallet'
import { i18n } from 'locale'
import { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native'
import { CircleFade } from 'react-native-animated-spinkit'
import FastImage from 'react-native-fast-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppDispatch } from 'store/hooks'
import Colors from 'theme/Colors'
import { ButtonType, NFTsByCollection } from 'types'
import icons from 'utils/icons'
import Toast from 'utils/toast'

export default function SetAvatarModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: ({
    contractId,
    tokenId,
    nftMedia,
  }: {
    contractId: string
    tokenId: string
    nftMedia: string
  }) => void
}) {
  const { walletApi, wallet } = useWallet()
  const [collections, setCollections] = useState<NFTsByCollection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [avataring, setAvataring] = useState(false)
  const [avatar, setAvatar] = useState<{
    contractId: string
    tokenId: string
    nftMedia: string
  }>()

  useEffect(() => {
    if (walletApi) {
      setIsLoading(true)
      setCollections([])
      walletApi
        .getNFTList()
        .then((res) => {
          setCollections(res)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  }, [walletApi, wallet?.address])

  const { width, height } = useWindowDimensions()
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  const itemWidth = (width - 60) / 2

  const onSet = async () => {
    try {
      setAvataring(true)
      const network = (walletApi as NearWallet)?.getNetwork()
      await walletApi?.signAndSendTransaction({
        receiverId: network?.nravatar,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'set_avatar',
              args: {
                contract_id: avatar?.contractId,
                token_id: avatar?.tokenId,
              },
              gas: '300000000000000',
              deposit: '2000000000000000000000',
            },
          },
        ],
      })

      dispatch({
        type: 'wallet/setAvatar',
        payload: {
          avatar: avatar?.nftMedia,
        },
      })
      Toast.success(i18n.t('Avatar updated'))
      onClose()
      onConfirm(avatar!)
      setAvataring(false)
    } catch (error) {
      setAvataring(false)
      Toast.error(error)
    }
  }

  return (
    <View
      style={{
        height: height * 0.6,
        backgroundColor: Colors[theme].modalBackground,
        paddingTop: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Box direction="row" style={{ flexWrap: 'wrap' }}>
          {collections.map((collection) => {
            return collection.nfts.map((nft) => {
              const isSelected =
                avatar?.contractId ===
                  collection.contract_metadata.contract_account_id &&
                avatar?.tokenId === nft.token_id

              const nftMedia = getNFTMedia(
                collection.contract_metadata,
                nft
              ).uri
              return (
                <Pressable
                  key={nft.token_id}
                  onPress={() => {
                    if (!avataring) {
                      setAvatar({
                        contractId:
                          collection.contract_metadata.contract_account_id,
                        tokenId: nft.token_id,
                        nftMedia,
                      })
                    }
                  }}
                >
                  <Box
                    direction="column"
                    margin="small"
                    style={{
                      width: itemWidth,
                      height: itemWidth + 40,
                    }}
                    gap="small"
                  >
                    <FastImage
                      source={{
                        uri: nftMedia,
                      }}
                      defaultSource={icons.NFT}
                      resizeMode="cover"
                      style={{
                        width: itemWidth,
                        height: itemWidth,
                        borderWidth: isSelected ? 4 : 1,
                        borderColor: isSelected
                          ? Colors.link
                          : Colors[theme].borderColor,
                      }}
                    />
                    <Text style={{ width: itemWidth, fontSize: 12 }}>
                      {nft.metadata.title}
                    </Text>
                  </Box>
                </Pressable>
              )
            })
          })}
        </Box>
        {isLoading && (
          <Box align="center" justify="center" full style={{ paddingTop: 50 }}>
            <CircleFade size={100} color="#999" />
          </Box>
        )}
        {!isLoading && collections.length == 0 && (
          <Empty source={icons.NFT} title="No NFT found" />
        )}
      </ScrollView>
      <View
        style={{ ...styles.buttonGroup, paddingBottom: insets.bottom ?? 20 }}
      >
        {!avataring && (
          <Button
            label={i18n.t('Cancel')}
            style={{ marginHorizontal: 10 }}
            filled={false}
            onPress={onClose}
          />
        )}
        <Button
          label={i18n.t('Confirm')}
          type={ButtonType.PRIMARY}
          style={{ marginHorizontal: 10 }}
          filled={avataring}
          isLoading={avataring}
          disabled={!avatar}
          onPress={onSet}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonGroup: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
})
