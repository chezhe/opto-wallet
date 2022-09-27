import { useNavigation } from '@react-navigation/native'
import WalletAPI from 'chain/WalletAPI'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { AddUser, Scanning } from 'iconoir-react-native'
import { useRef, useState } from 'react'
import { Modalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import { useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import { Chain, CreateAccount, NetworkType } from 'types'
import Toast from 'utils/toast'
import Box from './common/Box'
import Icon from './common/Icon'
import InfoItem from './common/InfoItem'
import ConfirmModal from './Modals/ConfirmModal'
import QRScanModal from './Modals/QRScanModal'
import { LINKDROP_GAS, MIN_BALANCE_TO_CREATE } from 'chain/near/constants'
import { isValidReceiverAddress } from 'chain/common'

export default function Scanner() {
  const wallet = useAppSelector((state) => state.wallet.current)

  const [wcUri, setWcUri] = useState('')
  const qrscanRef = useRef<Modalize>(null)
  const createAccountRef = useRef<Modalize>(null)
  const [newAccount, setNewAccount] = useState<CreateAccount>()

  const theme = useColorScheme()

  const navigation = useNavigation()

  const onScanned = async (data: string) => {
    qrscanRef.current?.close()

    try {
      const isAddress = await isValidReceiverAddress(data, wallet)
      if (isAddress) {
        return navigation.navigate('Transfer', { receiver: data })
      }
      const result = JSON.parse(data)
      if (result.action === 'create') {
        if (
          wallet?.chain !== Chain.NEAR &&
          wallet?.networkType === NetworkType.MAINNET
        ) {
          return Toast.error(i18n.t('Please switch to NEAR wallet'))
        }
        setNewAccount(result)
        createAccountRef.current?.open()
      }
    } catch (error) {
      navigation.navigate('Transfer', { receiver: data })
    }
  }

  const onConfirmCreate = async () => {
    try {
      if (!newAccount) {
        throw new Error('Invalid parameters')
      }
      await WalletAPI.signAndSendTransaction({
        wallet: wallet!,
        receiverId: 'near',
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'create_account',
              args: {
                new_account_id: newAccount.accountId,
                new_public_key: newAccount.publicKey.replace(/^ed25519:/, ''),
              },
              gas: LINKDROP_GAS,
              deposit: MIN_BALANCE_TO_CREATE,
            },
          },
        ],
      })
      createAccountRef?.current?.close()
      Toast.success(i18n.t('Account created successfully'))
    } catch (error) {
      Toast.error(error)
    }
  }

  return (
    <Box>
      <Icon
        icon={
          <Scanning
            width={24}
            height={24}
            color={Colors[theme].screenBackground}
            strokeWidth={2}
          />
        }
        onPress={() => {
          qrscanRef.current?.open()
        }}
      />
      <Portal>
        <Modalize
          ref={createAccountRef}
          adjustToContentHeight
          closeOnOverlayTap
          withHandle={false}
        >
          <ConfirmModal
            title="Create account"
            icon={<AddUser width={40} height={40} color={Colors.black} />}
            iconWrapColor={Colors.green}
            subtitle=""
            content={
              newAccount ? (
                <Box direction="column" align="flex-start">
                  <InfoItem title="Account ID" value={newAccount.accountId} />
                  <InfoItem title="Public Key" value={newAccount.publicKey} />
                </Box>
              ) : null
            }
            onCancel={() => createAccountRef?.current?.close()}
            onConfirm={onConfirmCreate}
          />
        </Modalize>
        <Modalize
          ref={qrscanRef}
          adjustToContentHeight
          closeOnOverlayTap
          handlePosition="inside"
        >
          <QRScanModal
            onCancel={() => qrscanRef.current?.close()}
            onConfirm={onScanned}
          />
        </Modalize>
      </Portal>
    </Box>
  )
}
