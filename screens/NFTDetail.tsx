import { useNavigation, useRoute } from '@react-navigation/native'
import { getNFTMedia } from 'chain/NearWallet'
import AnimatedInput from 'components/common/AnimatedInput'
import Box from 'components/common/Box'
import Button from 'components/common/Button'
import Heading from 'components/common/Heading'
import Icon from 'components/common/Icon'
import InfoItem from 'components/common/InfoItem'
import TokenLogo from 'components/common/TokenLogo'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import useWallet from 'hooks/useWallet'
import { NavArrowLeft } from 'iconoir-react-native'
import { i18n } from 'locale'
import { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import { NFTItem, NFTContractMetadata } from 'types'
import icons from 'utils/icons'
import Toast from 'utils/toast'

export default function NFTDetail() {
  const { params } = useRoute()
  const nft = (params as any).nft as NFTItem
  const metadata = (params as any).metadata as NFTContractMetadata

  const { walletApi } = useWallet()
  const { width } = useWindowDimensions()
  const theme = useColorScheme()
  const navigation = useNavigation()
  const { top, bottom } = useSafeAreaInsets()
  const [imageRawSize, setImageRawSize] = useState<{
    width: number
    height: number
  }>()
  const [inputVisible, setInputVisible] = useState(false)
  const [receiverId, setReceiverId] = useState('')
  const [transferring, setTransferring] = useState(false)

  const media = getNFTMedia(metadata, nft).uri

  useEffect(() => {
    if (media) {
      Image.getSize(media, (width, height) => {
        if (width !== 0 && height !== 0) {
          setImageRawSize({ width, height })
        }
      })
    }
  }, [media])

  const onTransfer = async () => {
    if (inputVisible) {
      try {
        setTransferring(true)
        await walletApi?.signAndSendTransaction({
          receiverId: metadata.contract_account_id,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'nft_transfer',
                args: {
                  receiver_id: receiverId,
                  token_id: nft.token_id,
                },
                gas: '30000000000000',
                deposit: '1',
              },
            },
          ],
        })
        setTransferring(false)
        navigation.goBack()
        Toast.success(i18n.t('Transfering'))
      } catch (error) {
        setTransferring(false)
        Toast.error(error)
      }
    } else {
      setInputVisible(true)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      enabled={Platform.OS === 'ios'}
    >
      <View style={{ flex: 1, position: 'relative' }}>
        <Icon
          icon={
            <NavArrowLeft
              width={24}
              height={24}
              color={Colors[theme].screenBackground}
              strokeWidth={2}
            />
          }
          style={{ top, ...styles.back }}
          onPress={() => {
            navigation.goBack()
          }}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: bottom }}
        >
          <FastImage
            source={{
              uri: media,
            }}
            defaultSource={icons.NFT}
            resizeMode="cover"
            style={{
              width: width,
              height: imageRawSize
                ? (width * imageRawSize.height) / imageRawSize.width
                : width,
            }}
          />
          <Box direction="column" align="flex-start" pad="large" full>
            <Heading>{nft.metadata.title}</Heading>
            <Text style={styles.desc}>{nft.metadata.description || ''}</Text>
            <InfoItem title="Owner" value={nft.owner_account_id} />
            <InfoItem title="Token ID" value={nft.token_id} />
            <InfoItem title="Copies" value={nft.metadata.copies || '-'} />

            {inputVisible && (
              <Box full style={{ marginTop: 20 }}>
                <AnimatedInput
                  autoCapitalize="none"
                  value={receiverId}
                  style={styles.input}
                  placeholder={i18n.t('Account ID')}
                  onChangeText={setReceiverId}
                  autoCorrect={false}
                />
              </Box>
            )}
            <Button
              label={i18n.t(inputVisible ? 'Confirm Transfer' : 'Send')}
              primary
              disabled={(inputVisible && !receiverId) || transferring}
              isLoading={transferring}
              style={{ marginTop: 10 }}
              onPress={onTransfer}
            />
            <View
              style={{
                ...styles.divider,
                backgroundColor: Colors[theme].borderColor,
              }}
            />
            <Heading level={3}>Contract</Heading>
            <TokenLogo
              token={{ icon: metadata.icon, contractId: '' }}
              size={40}
            />
            <InfoItem title="Account id" value={metadata.contract_account_id} />
            <InfoItem title="Name" value={metadata.name} />
            <InfoItem title="Symbol" value={metadata.symbol} />
            <InfoItem title="Spec" value={metadata.spec} />
          </Box>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  back: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  desc: {
    fontSize: 16,
    color: Colors.gray9,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 10,
  },
  input: {
    borderBottomWidth: 1,
    fontSize: 24,
    textAlign: 'left',
  },
})
