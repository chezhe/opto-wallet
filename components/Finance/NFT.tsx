import { useNavigation } from '@react-navigation/native'
import { getNFTMedia } from 'chain/NearWallet'
import Box from 'components/common/Box'
import { Empty } from 'components/common/Placeholder'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import useWallet from 'hooks/useWallet'
import { useEffect, useState } from 'react'
import { FlatList, Pressable, useWindowDimensions } from 'react-native'
import { CircleFade } from 'react-native-animated-spinkit'
import FastImage from 'react-native-fast-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { NFTContractMetadata, NFTItem, NFTsByCollection } from 'types'
import icons from 'utils/icons'

export default function NFT() {
  const { walletApi, wallet } = useWallet()
  const [nfts, setNfts] = useState<
    { nft: NFTItem; contract: NFTContractMetadata }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNFTs = async () => {
    try {
      setRefreshing(true)
      const res = await walletApi?.getNFTList()
      const results: { nft: NFTItem; contract: NFTContractMetadata }[] = []

      res?.forEach((collection: NFTsByCollection) => {
        collection.nfts.forEach((nft) => {
          results.push({ nft, contract: collection.contract_metadata })
        })
      })
      setNfts(results)
      setIsLoading(false)
      setRefreshing(false)
    } catch (error) {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (walletApi) {
      setIsLoading(true)
      setNfts([])
      fetchNFTs()
    }
  }, [walletApi?.wallet.address])

  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
  const navigation = useNavigation()

  const itemWidth = 100

  const goNFTDetail = (nft: NFTItem, metadata: NFTContractMetadata) => {
    navigation.navigate('NFTDetail', { nft, metadata })
  }

  if (isLoading) {
    return (
      <Box align="center" justify="center" full style={{ paddingTop: 50 }}>
        <CircleFade size={100} color="#999" />
      </Box>
    )
  }

  if (!isLoading && nfts.length === 0) {
    return <Empty source={icons.NFT} title="No NFT found" />
  }

  return (
    <FlatList
      data={nfts}
      style={{ flex: 1, padding: 20, paddingBottom: insets.bottom + 20 }}
      keyExtractor={(item, index) => item.nft.token_id}
      contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
      renderItem={({ item, index }) => {
        const { nft, contract } = item
        return (
          <Pressable
            key={nft.token_id}
            onPress={() => goNFTDetail(nft, contract)}
          >
            <Box direction="row" margin="small" gap="small" align="flex-start">
              <FastImage
                source={{
                  uri: getNFTMedia(contract, nft).uri,
                }}
                defaultSource={icons.NFT}
                resizeMode="cover"
                style={{
                  width: itemWidth,
                  height: itemWidth,
                  borderWidth: 1,
                  borderColor: Colors[theme].borderColor,
                  borderRadius: 4,
                }}
              />
              <View style={{ paddingLeft: 10 }}>
                <Text
                  style={{
                    fontSize: 18,
                    maxWidth: width - itemWidth - 50,
                    fontFamily: Fonts.heading,
                  }}
                >
                  {nft.metadata.title}
                </Text>
                <Text style={{ color: Colors.gray }}>
                  {contract.contract_account_id}
                </Text>
                <Text style={{ color: Colors.gray }}>{nft.token_id}</Text>
              </View>
            </Box>
          </Pressable>
        )
      }}
      onRefresh={fetchNFTs}
      refreshing={refreshing}
    />
  )
}
