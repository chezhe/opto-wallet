import { i18n } from 'locale'
import _ from 'lodash'
import { Image, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import {
  BasePreviewSignParams,
  ButtonType,
  NearLinkDrop,
  NFTItem,
  Token,
} from 'types'
import { formatBalance, formatUrlHost } from 'utils/format'
import Fonts from 'theme/Fonts'
import Button from 'components/common/Button'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import useWallet from 'hooks/useWallet'
import { useEffect, useState } from 'react'
import NearWallet, { btoa } from 'chain/NearWallet'
import SignParamsList from './SignParamsList'
import { KeyPair, providers } from 'near-api-js'
import { CodeResult } from 'near-api-js/lib/providers/provider'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import FastImage from 'react-native-fast-image'
import { EmojiPuzzled } from 'iconoir-react-native'

interface DropInfo {
  config: {
    [key in string]: any
  }
  deposit_per_use: string
  drop_id: number
  drop_type:
    | 'Simple'
    | {
        NonFungibleToken: {
          contract_id: string
          sender_id: string
        }
      }
    | {
        FungibleToken: {
          balance_per_use: string
          contract_id: string
          ft_storage: string
          sender_id: string
        }
      }
  metadata: string
  next_key_id: number
  owner_id: string
  registered_uses: number
  required_gas: string
}

export default function LinkDropModal({
  project,
  isSigning,
  linkDrop,
  onCancel,
  onConfirm,
}: {
  project?: { title?: string; url?: string; logo?: string }
  isSigning: boolean
  linkDrop?: NearLinkDrop
  onCancel: () => void
  onConfirm: (dropInfo: BasePreviewSignParams) => void
}) {
  const { wallet, walletApi } = useWallet()
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
  const [dropInfo, setDropInfo] = useState<BasePreviewSignParams>()
  const [ftMetadata, setFtMetatdata] = useState<Token>()
  const [nftMetadata, setNftMetatda] = useState<NFTItem>()
  const [invalidDrop, setInvalidDrop] = useState(false)

  let title = project?.title
  if (!title) {
    title = formatUrlHost(project?.url)
  }

  useEffect(() => {
    async function fetchLinkDropInfo() {
      if (!(linkDrop && walletApi)) {
        return
      }
      try {
        const network = walletApi?.getNetwork()
        const provider = new providers.JsonRpcProvider({
          url: network?.nodeUrl,
        })
        const pubkey = KeyPair.fromString(linkDrop.fundingKey)
          .getPublicKey()
          .toString()
        const keyRes = await provider.query<CodeResult>({
          request_type: 'call_function',
          account_id: linkDrop.fundingContract,
          method_name: 'get_key_information',
          args_base64: btoa(JSON.stringify({ key: pubkey })),
          finality: 'optimistic',
        })
        const keyInfo = JSON.parse(Buffer.from(keyRes.result).toString())

        if (!keyInfo) {
          setInvalidDrop(true)
          return
        }

        const dropRes = await provider.query<CodeResult>({
          request_type: 'call_function',
          account_id: linkDrop.fundingContract,
          method_name: 'get_drop_information',
          args_base64: btoa(
            JSON.stringify({ drop_id: keyInfo.drop_id, key: pubkey })
          ),
          finality: 'optimistic',
        })
        const dropInfo: DropInfo = JSON.parse(
          Buffer.from(dropRes.result).toString()
        )

        setDropInfo(dropInfo)

        if (dropInfo.drop_type === 'Simple') {
          return
        }
        if ('FungibleToken' in dropInfo.drop_type) {
          const res = await provider.query<CodeResult>({
            request_type: 'call_function',
            account_id: dropInfo.drop_type.FungibleToken.contract_id,
            method_name: 'ft_metadata',
            args_base64: '',
            finality: 'optimistic',
          })
          setFtMetatdata(JSON.parse(Buffer.from(res.result).toString()))
        }
        if ('NonFungibleToken' in dropInfo.drop_type) {
          const tokenIdsRes = await provider.query<CodeResult>({
            request_type: 'call_function',
            account_id: linkDrop.fundingContract,
            method_name: 'get_nft_token_ids_for_drop',
            args_base64: btoa(
              JSON.stringify({
                drop_id: dropInfo.drop_id,
                from_index: '0',
                limit: 1,
              })
            ),
            finality: 'optimistic',
          })
          const tokenIds = JSON.parse(
            Buffer.from(tokenIdsRes.result).toString()
          )
          if (tokenIds.length) {
            const tokenId = tokenIds[0]
            const nftMetadataRes = await provider.query<CodeResult>({
              request_type: 'call_function',
              account_id: dropInfo.drop_type.NonFungibleToken.contract_id,
              method_name: 'nft_metadata',
              args_base64: '',
              finality: 'optimistic',
            })
            const tokenRes = await provider.query<CodeResult>({
              request_type: 'call_function',
              account_id: dropInfo.drop_type.NonFungibleToken.contract_id,
              method_name: 'nft_token',
              args_base64: btoa(
                JSON.stringify({
                  token_id: tokenId,
                })
              ),
              finality: 'optimistic',
            })
            const nftMedia = await (walletApi as NearWallet).getNFTMedia(
              dropInfo.drop_type.NonFungibleToken.contract_id,
              tokenId
            )
            const nftMetadata = JSON.parse(
              Buffer.from(tokenRes.result).toString()
            )
            setNftMetatda({
              ...(nftMetadata || {}),
              metadata: {
                ...(nftMetadata?.metadata || {}),
                media: nftMedia.uri,
              },
            })
          }
        }
      } catch (error) {
        console.log('error', error)
      }
    }
    fetchLinkDropInfo()
  }, [linkDrop, walletApi])

  let subtitle = ''
  let nft = null
  if (dropInfo) {
    if (dropInfo.drop_type === 'Simple') {
      subtitle = `+${formatNearAmount(dropInfo.deposit_per_use, 2)!} Ⓝ`
    } else if (dropInfo.drop_type.FungibleToken && ftMetadata) {
      subtitle = `+${formatBalance(
        dropInfo.drop_type.FungibleToken.balance_per_use,
        ftMetadata.decimals
      )!} ${ftMetadata.symbol}`
    } else if (dropInfo.drop_type.NonFungibleToken && nftMetadata) {
      subtitle = nftMetadata.metadata.title
      nft = (
        <FastImage
          source={{ uri: nftMetadata.metadata.media }}
          style={styles.nft}
          resizeMode="cover"
        />
      )
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 20,
          backgroundColor: Colors[theme].modalBackground,
        },
      ]}
    >
      <SheetHeader title="Linkdrop" />
      <View style={styles.content}>
        {!!project?.logo && (
          <Image
            source={{ uri: project.logo }}
            style={[
              styles.projectLogo,
              {
                borderColor: Colors[theme].borderColor,
              },
            ]}
          />
        )}
        {nft}
        <Text style={styles.subtitle}>{subtitle}</Text>
        {invalidDrop && (
          <EmojiPuzzled width={150} height={150} color={Colors.gray9} />
        )}
        {invalidDrop && <Text style={styles.invalid}>{i18n.t('Invalid')}</Text>}
        {dropInfo && (
          <SignParamsList
            previewSignParams={[dropInfo]}
            heightRatio={nftMetadata ? 0.2 : 0.4}
          />
        )}
        {wallet?.isLedger && isSigning && (
          <Text style={styles.ledgerTip}>
            {i18n.t('Please confirm on your Ledger device')}
          </Text>
        )}
      </View>
      <View style={styles.buttonGroup}>
        {!isSigning && (
          <Button
            label={i18n.t('Cancel')}
            style={{ marginRight: 10 }}
            filled={false}
            disabled={isSigning}
            onPress={onCancel}
          />
        )}
        <Button
          label={i18n.t('Confirm')}
          type={ButtonType.PRIMARY}
          isLoading={isSigning}
          filled={isSigning}
          disabled={invalidDrop || !dropInfo}
          onPress={() => onConfirm(dropInfo)}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonGroup: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  projectLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  subtitle: {
    fontSize: 30,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    marginBottom: 10,
  },
  ledgerTip: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    color: Colors.red,
    marginTop: 8,
  },
  nft: {
    width: 150,
    height: 150,
  },
  invalid: {
    fontSize: 16,
    color: Colors.red,
    textAlign: 'center',
  },
})
